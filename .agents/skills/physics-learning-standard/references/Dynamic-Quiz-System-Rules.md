# Dynamic Quiz System Rules

> Rules for non-deterministic dynamic quiz systems in the Physics Learning Ecosystem.

This document defines how dynamic quizzes, randomized physics questions, roll-number based parameter generation, answer validation, worked solutions, and safety constraints should work.

---

# Purpose

Dynamic quiz systems should give learners individualized question parameters while preserving physics correctness, fairness, and reviewability.

The system may generate different values for each learner or attempt, but the generated question, expected answer, validation result, and solution explanation must remain internally consistent.

---

# Core Rule

A dynamic quiz is a calculation system, not an answer table.

Question parameters, expected answers, validation, feedback, and worked solutions must be generated from documented formulas and constraints.

Static hardcoded final answers must not be used when the answer can be calculated from formulas.

---

# System Type

Dynamic quiz systems in this ecosystem are designed as:

```text
Non-Deterministic Dynamic Systems
```

The system combines:

- Student roll number `R`
- Independently generated random base values
- Documented formulas
- Safety constraints
- On-the-fly answer calculation

The roll number helps produce learner-specific parameters.

Random base values help prevent repeated or predictable question sets.

---

# Roll Number Rule

The student roll number is represented as:

```text
R
```

Allowed range:

```text
R in [1, 40]
```

Rules:

- `R` must be an integer.
- `R` must be validated before parameter generation.
- Values outside `[1, 40]` must be rejected or corrected before generating a quiz.
- The meaning of `R` must be documented in the repository README or quiz documentation.
- `R` should be treated as a classroom identifier, not as the sole identity of a learner.

---

# Attempt-Scoped Determinism

The system may be non-deterministic when a quiz attempt is created.

However, after a quiz attempt is created, the attempt must become deterministic.

This means:

- The displayed question must use one fixed generated parameter set.
- The answer validator must use the same generated parameter set.
- The worked solution must use the same generated parameter set.
- The result must not change when the learner submits, retries, refreshes, or views the solution for the same attempt.

To support this, store at least one of:

- Generated parameter values
- Random seed
- Attempt state
- Attempt identifier linked to generated values

Do not generate fresh random values during answer submission unless the attempt is intentionally restarted.

---

# Dynamic Parameter Generation

Dynamic parameter generation must combine `R` with independently generated random base values.

General model:

```text
R = student roll number
B = random base values
P = generated physics parameters

P = generateParameters(R, B)
```

Each dynamic question should document:

- Input variables
- Random base value ranges
- How `R` modifies the parameters
- Generated parameter formulas
- Units
- Minimum and maximum values
- Rounding rules
- Safety constraints
- Expected answer formula

Example:

```text
R = student roll number, where R in [1, 40]
baseMass = random value in [1.0, 3.0] kg
baseAcceleration = random value in [2.0, 5.0] m/s^2

m = baseMass + 0.05R
a = baseAcceleration + 0.02R
F = ma

Constraints:
- m > 0
- a > 0
- F remains within the intended learning range
```

Generated values should remain physically reasonable for every valid `R`.

---

# On-the-fly Validation

Answer validation must be calculated on-the-fly from the active attempt data.

The validator should calculate the expected answer from:

- The learner's `R`
- The stored or reproducible random base values
- The generated parameters
- The documented formula
- The documented unit and tolerance rules

General model:

```text
expectedAnswer = calculateAnswer(generatedParameters)
validationResult = validateStudentAnswer(studentAnswer, expectedAnswer, tolerance)
solution = generateSolution(generatedParameters, expectedAnswer)
```

Rules:

- Do not validate from static answer tables.
- Do not validate from UI text.
- Do not validate from Canvas or rendering state.
- Do not re-randomize values during validation.
- Use tolerance for approximate numerical answers.
- Use unit conversion rules when multiple units are accepted.
- Keep answer calculation in the Physics Domain or a domain-safe quiz module.

Use `Units-and-Notation.md` for unit rules.

Use `Simulation-Standards.md` for numerical tolerance rules.

---

# No Static Hardcoded Answers

Dynamic quizzes must not use static hardcoded final answers when formulas can calculate the answer.

Avoid:

```text
if R = 1, answer = 12.4
if R = 2, answer = 13.1
if R = 3, answer = 13.8
```

Prefer:

```text
m = baseMass + 0.05R
a = baseAcceleration + 0.02R
answer = m * a
```

Hardcoded reference cases may be used only for tests or validation examples.

When used, they must be clearly marked as test fixtures, not production answer logic.

---

# Safety Constraints

Every dynamic quiz must define safety constraints for generated values.

Safety constraints prevent generated questions from producing values that are invalid, misleading, or physically impossible.

Constraints should include:

- Minimum values
- Maximum values
- Denominator safety
- Sign restrictions
- Unit restrictions
- Model validity ranges
- Answer magnitude ranges
- Rounding and display limits

Common invalid cases:

- Negative mass
- Negative length
- Negative area
- Negative absolute temperature in kelvin
- Division by zero
- Impossible geometry
- Speed outside the intended model range
- Values that contradict documented assumptions
- Generated answer too large or too small for the intended learning level

If generated values fail constraints, the system must use a documented fallback strategy before showing the question.

---

# Generation Fallback Strategy

Every dynamic quiz generator should define how it handles failed generation.

The fallback strategy should include:

- `maxRetries`: the maximum number of regeneration attempts after the first failed generation.
- Regeneration scope: which random base values or seed values may be regenerated.
- Stable inputs: which validated learner inputs, such as `R`, must not change during fallback.
- Failure behavior when all retries are exhausted.
- Learner-facing error message.
- Logging or review data needed for maintainers.

Recommended default:

```text
maxRetries = 3
```

`maxRetries` should be a small non-negative integer. Use a larger value only when the repository documents why the generation space needs it.

Fallback flow:

```text
1. Validate learner input such as R.
2. Generate random base values.
3. Generate candidate question parameters.
4. Check all safety constraints.
5. If constraints pass, store the generated values and show the question.
6. If constraints fail, regenerate allowed random base values until maxRetries is reached.
7. If no valid candidate is produced, reject the question or attempt before showing it.
```

After all retries are exhausted, the system must:

- Not show a partially generated, unsafe, or misleading question.
- Not silently change `R` or other validated learner identity values.
- Not score the learner as incorrect for a system generation failure.
- Return or display a respectful recovery message.
- Record enough technical detail for review.

Recommended learner-facing message:

```text
This question could not be generated safely. Please ask your teacher or instructor to restart the attempt.
```

Recommended technical log fields:

- Question type or question ID
- Attempt ID or session ID when available
- Retry count and `maxRetries`
- Failed constraint code or reason
- Generated parameter summary when safe to store
- Timestamp

Logs should avoid unnecessary personal data and should not expose hidden answer logic to learners.

If the dynamic quiz is part of a timed or scored exam, generation fallback should finish before the timer starts. A generation failure before the exam starts should be treated as a setup or system error, not as a learner submission.

Once a valid generated parameter set is shown to the learner, fallback must stop for that attempt. Do not regenerate values during answer submission, scoring, feedback, or worked solution display.

---

# Randomness Rules

Randomness should support fair variation.

Each repository should document:

- Which values are randomized
- Allowed random ranges
- Whether randomness is seeded
- Whether attempts are reproducible
- How generated values are stored or reconstructed

Use non-deterministic randomness when fresh variation matters.

Use deterministic seeds when review, grading, debugging, or replay must reproduce the same question.

For classroom assessment, reproducibility is usually recommended.

---

# Uniqueness Rules

Dynamic generation should reduce duplicate question parameters across learners.

However, `R` and random base values do not automatically guarantee perfect uniqueness.

If exact uniqueness is required, the system must check for collisions.

Example collision rule:

```text
If generated parameter set already exists in the same assessment session,
generate a new base value or apply a documented adjustment.
```

If exact uniqueness is not required, document that generated values are intended to be varied but not mathematically guaranteed unique.

---

# Answer Tolerance

Numerical answers should use documented tolerance when exact matching is not appropriate.

Each question type should define:

- Expected answer
- Accepted unit or units
- Absolute tolerance, relative tolerance, or percentage tolerance
- Rounding rule for displayed solutions
- Significant figures expectation, when applicable

The displayed solution and the validation logic must use compatible rounding.

Do not reject a correct physics answer because of harmless formatting differences.

---

# Worked Solution Generation

Worked solutions should be generated from the same active attempt data as the question and validator.

A worked solution should include:

- Formula
- Substitution of generated values
- Unit handling
- Calculation steps
- Final answer
- Rounding or tolerance explanation when helpful

Example:

```text
Given:
m = 2.25 kg
a = 4.40 m/s^2

F = ma
F = (2.25)(4.40)
F = 9.90 N
```

Do not display a solution that was generated from different parameters than the learner saw.

---

# Architecture Rules

Dynamic quiz logic should follow the Domain-Centric Architecture.

Recommended responsibility separation:

```text
Physics Domain
    -> formulas
    -> generated parameters
    -> expected answers
    -> constraints
    -> tolerance rules

Application
    -> attempt lifecycle
    -> quiz flow
    -> scoring coordination

Adapters
    -> UI display
    -> Canvas rendering
    -> storage
    -> input forms
```

UI, Canvas, and storage code may display or save quiz state.

They must not become the source of physics truth.

Use `Architecture-Enforcement.md` when reviewing boundaries.

---

# Documentation Requirements

Each dynamic quiz system should document:

- Roll number rule
- Random parameter rules
- Formula used for each question type
- Units
- Constraints
- Tolerance
- Generation fallback strategy
- Attempt reproducibility behavior
- Validation method
- Worked solution generation
- Known limitations

Small learning repositories may document this in `README.md`.

Larger quiz systems should use a dedicated document in `docs/`.

---

# Review Checklist

Use this checklist when reviewing a dynamic quiz system.

| Check | Question |
| :--- | :--- |
| Roll number | Is `R` validated as an integer in `[1, 40]`? |
| Parameter generation | Are random bases and `R` combined through documented formulas? |
| Attempt consistency | Does one attempt keep the same generated values for question, answer, and solution? |
| On-the-fly validation | Is the answer calculated from formulas during validation? |
| No hardcoded answers | Are production static answer tables avoided? |
| Safety constraints | Are minimum, maximum, sign, denominator, and model constraints documented? |
| Generation fallback | Are `maxRetries`, retry exhaustion behavior, learner message, and review logging documented? |
| Units | Are units explicit and consistent? |
| Tolerance | Is numerical tolerance documented and consistent with displayed rounding? |
| Reproducibility | Can the attempt be reviewed or reproduced when needed? |
| Solution | Does the worked solution use the same parameters as the displayed question? |
| Architecture | Is quiz physics logic separated from UI, Canvas, storage, and rendering? |

---

# Relationship to Other Standards

Full standards index: `README.md`.

Closest companions: `Physics-Standards.md`, `Units-and-Notation.md`, `Simulation-Standards.md`, `Timed-Exam-System-Rules.md`, and `Architecture-Enforcement.md`.

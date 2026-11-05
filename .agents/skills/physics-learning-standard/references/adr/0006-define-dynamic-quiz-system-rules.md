# Decision 0006: Define Dynamic Quiz System Rules

Status: Accepted

Date: 2026-08-01

---

# Context

The Physics Learning Ecosystem includes learning repositories that may generate individualized quiz questions.

Some quiz systems use a student roll number `R` together with random base values to generate question parameters and answers.

Without explicit rules, these systems can become inconsistent.

Common risks include re-randomizing values during validation, using static answer tables, generating impossible physics values, or displaying a worked solution that does not match the learner's generated question.

---

# Decision

The Physics Learning Standard defines `Dynamic-Quiz-System-Rules.md`.

This document standardizes dynamic quiz behavior for:

- Roll-number based parameter generation.
- Non-deterministic random base values.
- Attempt-scoped determinism.
- On-the-fly validation.
- No static hardcoded production answers.
- Safety constraints.
- Tolerance and unit handling.
- Worked solution generation.
- Architecture boundaries.

---

# Rationale

Dynamic quiz systems are related to simulations, physics standards, and numerical validation, but they have additional concerns.

They need clear rules for learner-specific parameters, randomization, attempt reproducibility, validation, and answer explanation.

Separating these rules prevents `Simulation-Standards.md` from becoming too broad and gives future learning units a direct reference for quiz behavior.

---

# Impact

Repositories that include dynamic quizzes should document how roll number `R`, random base values, constraints, tolerance, validation, and worked solutions are handled.

Dynamic quiz logic should remain in the Physics Domain or a domain-safe quiz module.

UI, Canvas, and storage code may display or preserve quiz state, but they should not define physics truth or expected answers.

Adding these rules is compatible with existing standards because it extends guidance without replacing previous physics or simulation rules.

---

# Related Standards

- `Dynamic-Quiz-System-Rules.md`
- `Physics-Standards.md`
- `Units-and-Notation.md`
- `Simulation-Standards.md`
- `Architecture-Enforcement.md`
- `Standard-Compliance-Checklist.md`
- `README-Template.md`
- `Validation-Workflow.md`
- `AI-Agent-Rules.md`


# Decision 0008: Standardize High-School Gravity Approximation

Status: Accepted

Date: 2026-08-02

---

# Context

The Physics Learning Ecosystem needs one consistent learning approximation for
gravitational acceleration near Earth's surface.

Earlier standard examples used a more precise classroom value in some documents,
while the agent guidance used `g = 10 m/s^2` for high-school learning tasks.
That difference could cause child repositories to generate inconsistent
examples, quiz answers, worked solutions, and validation rules.

The ecosystem serves high-school learners, where simple arithmetic often
supports learning clarity. At the same time, some repositories may need a more
precise value when the learning objective is precision, measurement,
experimental comparison, or advanced modeling.

---

# Decision

The Physics Learning Standard uses `g = 10 m/s^2` as the default learning
approximation for high-school mechanics activities near Earth's surface.

Repositories may use a more precise gravitational acceleration value when they
document:

- The value used.
- The source or approximation level.
- Why precision matters for that repository.
- How the choice affects examples, dynamic questions, validation, and worked
  solutions.

The chosen value must remain consistent across a repository's explanations,
simulations, quizzes, validation logic, and displayed solutions.

---

# Rationale

A single default value reduces confusion for learners and makes generated
questions easier to review across repositories.

`g = 10 m/s^2` is appropriate for high-school classroom mechanics when the
learning goal is conceptual understanding or straightforward calculation.

Allowing documented precision-focused exceptions preserves scientific
correctness for repositories where a more precise gravitational acceleration
value is part of the learning objective.

---

# Impact

Repositories with high-school mechanics content should default to
`g = 10 m/s^2` unless they document a precision-focused exception.

Dynamic quiz systems and timed exams should calculate expected answers,
validation tolerance, and worked solutions from the same selected value of `g`.

Physics engines and shared libraries should expose or document the selected
constant clearly instead of hiding it in UI, Canvas, storage, or rendering code.

This decision updates the guidance in:

- `Physics-Standards.md`
- `Units-and-Notation.md`
- `Simulation-Standards.md`
- `README-Template.md`

---

# Related Standards

- `Physics-Standards.md`
- `Units-and-Notation.md`
- `Simulation-Standards.md`
- `Dynamic-Quiz-System-Rules.md`
- `Timed-Exam-System-Rules.md`
- `Architecture-Enforcement.md`
- `README-Template.md`

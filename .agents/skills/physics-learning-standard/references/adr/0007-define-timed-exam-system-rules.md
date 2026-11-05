# Decision 0007: Define Timed Exam System Rules

Status: Accepted

Date: 2026-08-02

---

# Context

The Physics Learning Ecosystem includes learning repositories that may collect
classroom scores through timed or scored exam modes.

These exams need a consistent start screen, learner identity fields, timer
behavior, lock rules, scoring boundaries, and submitted result data.

Without a shared standard, child repositories may hardcode score totals in UI
text, start timers too early, mix scoring logic with rendering code, or store
inconsistent result data.

The ecosystem already has `Dynamic-Quiz-System-Rules.md` for generated and
roll-number based quiz questions. Timed exams overlap with dynamic quizzes, but
they also include distinct assessment-flow concerns such as explicit start,
identity validation, auto-submit, and lock behavior.

---

# Decision

The Physics Learning Standard adds `Timed-Exam-System-Rules.md`.

This document standardizes:

- Timed and scored exam metadata.
- Exam start screen layout and warning panel expectations.
- Learner identity fields.
- Timer start, timeout, and auto-submit behavior.
- Refresh, tab-switch, focus-loss, and lock behavior.
- Numerical answer rules for scored calculation questions.
- Scoring architecture boundaries.
- Submitted assessment session data expectations.

The standard also adds `schemas/assessment-session.schema.json` as a shared data
contract for stored or exported exam sessions.

---

# Rationale

Timed exam behavior affects fairness, accessibility, and reviewability.

A start screen should make rules visible before a learner begins. A timer should
start only after explicit learner action. Locking and auto-submit rules should
be deterministic and disclosed before the exam starts. Scoring should remain
outside UI rendering to preserve the Domain-Centric Architecture.

This decision keeps exam-flow rules separate from dynamic-question rules while
making the relationship between them explicit.

---

# Consequences

Repositories with timed or scored exams should follow
`Timed-Exam-System-Rules.md`.

Repositories that include dynamic or roll-number based questions inside timed
exams must also follow `Dynamic-Quiz-System-Rules.md`.

Learning-unit and interactive-simulation compliance checks now include timed
exam behavior when exam mode exists.

The README template now asks repositories to document timed exam setup when
applicable.

The standard validation script now checks that the timed exam standard, schema,
and ADR are present and referenced.

---

# Relationship to Other Standards

This decision complements:

- `Dynamic-Quiz-System-Rules.md`
- `Architecture-Enforcement.md`
- `Physics-Standards.md`
- `Units-and-Notation.md`
- `Simulation-Standards.md`
- `UI-Guidelines.md`
- `Accessibility.md`
- `Standard-Compliance-Checklist.md`
- `README-Template.md`

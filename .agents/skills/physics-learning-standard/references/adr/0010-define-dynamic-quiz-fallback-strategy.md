# Decision 0010: Define Dynamic Quiz Fallback Strategy

Status: Accepted

Date: 2026-08-02

---

# Context

Dynamic quiz systems can generate invalid candidates when random base values,
learner-specific inputs, formulas, or safety constraints interact badly.

The existing standard required systems to regenerate values or reject the
attempt, but it did not define retry limits, failure behavior, learner-facing
messages, or review logging. That ambiguity made child repositories likely to
handle failed generation inconsistently.

---

# Decision

Dynamic quiz systems must document a generation fallback strategy.

The strategy should define:

- `maxRetries`.
- Which random base values or seed values may be regenerated.
- Which validated learner inputs remain stable.
- What happens when retries are exhausted.
- What learner-facing message is shown.
- What technical review or logging data is recorded.

After retries are exhausted, unsafe generated questions must be rejected before
being shown to the learner.

Timed or scored exams should complete dynamic generation before the timer starts.
A generation failure before the exam starts is a setup or system error, not a
learner submission.

---

# Rationale

Explicit fallback rules make dynamic quizzes fairer and easier to review.

`maxRetries` prevents infinite loops and makes failure behavior testable.

Keeping learner inputs such as `R` stable preserves attempt consistency and
prevents hidden changes to learner-specific parameters.

Rejecting unsafe candidates before display protects physics correctness and
avoids scoring learners for system failures.

---

# Impact

Child repositories with dynamic quizzes should update their quiz documentation
and implementation to include generation fallback behavior.

Repositories without dynamic or randomized quizzes may mark this guidance as
`Not applicable`.

Existing dynamic quizzes remain compatible, but should be reviewed for explicit
fallback behavior during the next assessment or compliance review.

---

# Related Standards

- `Dynamic-Quiz-System-Rules.md`
- `Simulation-Standards.md`
- `Timed-Exam-System-Rules.md`
- `Standard-Compliance-Checklist.md`
- `README-Template.md`
- `Validation-Workflow.md`

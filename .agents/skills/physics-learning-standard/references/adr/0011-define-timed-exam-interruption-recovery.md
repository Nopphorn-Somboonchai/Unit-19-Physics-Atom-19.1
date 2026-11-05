# Decision 0011: Define Timed Exam Interruption Recovery

Status: Accepted

Date: 2026-08-02

---

# Context

Timed and scored exams can be interrupted by refresh, browser close, offline
mode, network loss, backend outage, or unavailable browser storage.

The existing timed exam standard covered start screens, timers, auto-submit,
locking, scoring, and result data. It did not clearly define how repositories
should preserve in-progress attempts, recover saved attempts, or label
submission state when storage or synchronization fails.

Without a shared rule, child repositories may silently discard learner answers,
restart timers after refresh, mark unsynced submissions as complete, or mix
storage state with scoring state.

---

# Decision

Timed or scored exam repositories must document an interruption recovery
strategy when an attempt can be affected by local storage, refresh, browser
return, offline mode, network loss, or backend failure.

The strategy should define:

- Local persistence scope for in-progress attempts.
- Recovery flow for saved attempts.
- Timer continuity based on the original start timestamp.
- Submission sync or export status labels.
- Learner-facing messages for pending, recovered, or failed submissions.
- Review fields needed by teachers or maintainers.
- Privacy limits for locally persisted learner data.

Assessment state and storage state should be tracked separately. Assessment
status remains focused on scoring flow, such as `in-progress`, `submitted`,
`auto-submitted`, or `locked`. Sync or export status describes persistence and
delivery state, such as `local-only`, `pending-sync`, `synced`,
`sync-failed`, or `conflict-review`.

The assessment session schema now allows optional recovery and sync fields while
remaining compatible with existing session data.

---

# Rationale

Timed exam interruptions affect fairness and reviewability.

Preserving the original start timestamp prevents refresh or offline recovery
from granting extra time. Persisting generated parameters and draft answers
keeps the recovered attempt internally consistent. Separating sync state from
assessment state keeps scoring deterministic while still allowing teachers or
maintainers to review whether a result has been exported or synchronized.

The guidance is intentionally deployment-neutral. Local-only classroom exams,
manual export flows, and backend-backed exams can all follow the same concepts
while implementing storage and synchronization differently.

---

# Impact

Child repositories with timed or scored exams should update their README or exam
documentation to describe interruption behavior.

Repositories that persist in-progress attempts should save only the data needed
for fair recovery and review. Repositories with backend submission should keep
pending submissions retryable or exportable until synchronization succeeds.

Repositories without timed or scored exams may mark this guidance as
`Not applicable`.

---

# Related Standards

- `Timed-Exam-System-Rules.md`
- `Dynamic-Quiz-System-Rules.md`
- `Standard-Compliance-Checklist.md`
- `README-Template.md`
- `schemas/assessment-session.schema.json`
- `Validation-Workflow.md`

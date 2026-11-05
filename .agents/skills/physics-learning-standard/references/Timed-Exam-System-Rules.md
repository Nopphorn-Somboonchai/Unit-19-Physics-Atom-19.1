# Timed Exam System Rules

> Rules for scored and timed exam systems in the Physics Learning Ecosystem.

This document defines how scored exams, timed assessments, exam start screens,
learner identity fields, scoring, lock behavior, and submitted assessment data
should work.

---

# Purpose

Timed exam systems should support classroom score collection while preserving
physics correctness, fairness, accessibility, and reviewability.

The system may include fixed questions, dynamic questions, randomized
parameters, or roll-number based questions. Whatever the source of the question,
the displayed question, expected answer, score, and submitted result must remain
internally consistent for one exam attempt.

---

# Ownership Boundary

`physics-learning-standard` defines the rules, required fields, UI pattern, and
data contract for timed or scored exam systems.

Child repositories implement the actual exam UI, questions, scoring logic,
storage, visual theme, and deployment.

Shared UI implementations may live in a separate shared UI repository when
multiple child repositories need the same components.

Lesson-specific questions, answer keys, and production exam screens should not
be placed inside `physics-learning-standard`.

---

# Relationship to Dynamic Quiz Rules

Use this document when an activity is a scored exam, timed assessment, or
classroom score collection flow.

Use `Dynamic-Quiz-System-Rules.md` when questions are randomized, generated from
student roll number `R`, or validated on-the-fly from generated parameters.

When a timed exam includes dynamic questions, both standards apply:

- `Timed-Exam-System-Rules.md` governs exam flow, start screen, identity,
  timing, locking, scoring, and submitted results.
- `Dynamic-Quiz-System-Rules.md` governs generated parameters, attempt-scoped
  determinism, answer calculation, tolerance, and worked solutions.

This document must not weaken the Domain-Centric Architecture or permit UI code
to become the source of physics truth.

---

# Required Exam Metadata

Every timed or scored exam must document:

| Field | Requirement |
| :--- | :--- |
| Exam title | Human-readable title shown before the exam starts |
| Grade or learner group | Target learners, such as Grade 12 or M.6 |
| Unit or chapter | Course unit, chapter, or topic |
| Main topic | Main physics concept covered |
| Content scope | Concepts, formulas, and applications included |
| Number of questions | Total number of questions |
| Points per question | Score value per question, or a scoring table if mixed |
| Total score | Maximum score |
| Time limit | Time allowed in minutes, or `Not applicable` |
| Numerical answer rule | Decimal places, tolerance, and units if applicable |
| Lock or auto-submit rule | Conditions that lock or submit the exam |
| Interruption recovery | Refresh, browser return, offline, network failure, and sync or export behavior |
| Result storage | Where answers and scores are stored or exported |

The metadata shown to learners must match the implemented exam behavior.

---

# Required Start Screen

A timed or scored exam must show a start screen before the first question.

The learner must explicitly start the exam. Loading the page alone must not start
the timer unless the repository documents a controlled classroom reason.

The start screen should use this top-to-bottom order:

1. Assessment icon or subject marker.
2. Exam title.
3. Unit, chapter, or topic subtitle.
4. Rules warning panel.
5. Learner identity form.
6. Back or cancel action.
7. Primary start action.

The warning panel must appear before the learner identity form and before the
start action.

The start screen must include:

- Exam title.
- Unit, chapter, or topic subtitle.
- Warning or rules section visible before the learner starts.
- Number of questions.
- Points per question and total score.
- Content scope.
- Time limit.
- Numerical answer formatting rule when the exam accepts calculated answers.
- Refresh, tab-switch, timeout, lock, or auto-submit rule when implemented.
- Offline, refresh recovery, local persistence, or sync/export rule when implemented.
- Learner identity fields.
- Clear back or cancel action.
- Clear start action.

---

# Reference Start Screen Pattern

The following pattern is based on the provided Thai physics scored exam UI. Use
repository-specific values instead of copying these lesson details unless the
child repository is for the same topic.

```text
Exam title:
ทดสอบเก็บคะแนน ม.6

Subtitle:
บทที่ 17.4 พลศาสตร์ของของไหล (Fluid Dynamics)

Rules title:
กติกาการสอบ (อ่านก่อนเริ่ม):

Rules:
- มีข้อสอบทั้งหมด 5 ข้อ ข้อละ 2 คะแนน (คะแนนเต็ม 10 คะแนน)
- ขอบเขตเนื้อหา: ของไหลอุดมคติ, อัตราการไหล, สมการความต่อเนื่อง, สมการเบร์นูลลี, กฎของตอร์ริเชลลี และการประยุกต์ใช้
- มีระยะเวลาจำกัดในการทำข้อสอบ 15 นาที
- การตอบคำถามประเภทคำนวณตัวเลข ให้ป้อนคำตอบเป็นทศนิยมไม่เกิน 2 ตำแหน่ง
- ห้ามรีเฟรชหน้าจอหรือสลับแท็บ มิฉะนั้นจะถูกล็อคส่งคำตอบอัตโนมัติ
```

Recommended Thai classroom fields:

| Field | Label | Placeholder or control |
| :--- | :--- | :--- |
| Full name | `ชื่อ-นามสกุลผู้สอบ:` | `ระบุชื่อจริง นามสกุล` |
| Class or room | `ชั้น ม.6 / ห้อง:` | Select classroom or room |
| Student number | `เลขที่ (เลขตั้งค่าโจทย์):` | `ระบุเลขที่ 1-40` |

The exact grade label should match the child repository. For example, Grade 10
repositories should not keep `ม.6` unless that is the target learner group.

---

# Visual Requirements

The reference design uses a centered white exam panel, a compact subject icon, a
strong title, a muted topic subtitle, a red warning panel, and a clear primary
start button.

Implementations should preserve these functional visual priorities:

- The title is the strongest text on the screen.
- The subtitle is visible but secondary.
- The warning panel uses a distinct danger or warning style.
- The warning panel has enough contrast for comfortable reading.
- Inputs are full-width or arranged in a responsive grid.
- The primary start action is visually stronger than the back action.
- Buttons have stable dimensions and do not shift layout on hover or loading.

Decorative elements must not make the warning panel, labels, or actions harder
to read.

---

# Learner Identity Fields

Timed or scored exams should collect the following fields before starting:

| Field | Requirement |
| :--- | :--- |
| Full name | Required unless the system already authenticates the learner |
| Grade or class | Required for classroom assessments |
| Room or section | Required when used by the teacher |
| Student number | Required when used for seating, grouping, or generated values |

Repositories may add school ID, email, or authenticated user ID when
appropriate.

Identity fields must be validated before the exam starts. Validation errors
should be respectful, specific, and placed near the relevant field.

Student number should not be treated as the learner's full identity. When a
question system uses roll number `R`, apply `Dynamic-Quiz-System-Rules.md`.

---

# Timing Rules

If an exam has a time limit:

- The timer starts only after the learner selects the start action.
- The remaining time is visible during the exam.
- Timeout behavior is deterministic and documented.
- The exam should auto-submit when time expires.
- Submitted timestamps should be recorded.
- Recovered attempts must derive remaining time from the original start time and
  configured duration.

The displayed duration must match the configured duration used by the scoring or
submission logic.

---

# Locking and Integrity Rules

Repositories may implement integrity controls such as refresh detection,
tab-switch detection, focus-loss warnings, or auto-submit.

When implemented:

- The start screen must state the rule before the learner starts.
- The logic must be deterministic.
- The reason for lock or auto-submit should be recorded.
- The rule should avoid punishing accessibility tools or normal browser behavior
  unless the teacher has explicitly chosen strict exam mode.

Strict controls are appropriate for classroom score collection. They may be
unnecessary for practice mode.

---

# Offline and Network Failure Strategy

Timed or scored exams must document what happens when an attempt is interrupted
by refresh, browser close, offline mode, network loss, backend outage, or local
storage failure.

The strategy should match the repository's deployment model. A local-only
classroom exam may use browser persistence and manual export. A backend-backed
exam may use local persistence plus retryable synchronization. Repositories
without timed or scored exams may mark this guidance as `Not applicable`.

At minimum, the documented strategy should define:

- Local persistence scope for in-progress attempts.
- Recovery flow after reload, browser return, or interrupted session.
- Sync or export behavior for completed submissions.
- Submission and sync status labels.
- Learner-facing message for pending, recovered, or failed submissions.
- Review fields needed by teachers or maintainers.
- Privacy limits for locally persisted learner data.

## Local Persistence

When local persistence is used, save only the attempt data needed for fair
recovery and review:

- Attempt ID.
- Exam ID and version or configuration snapshot.
- Learner identity fields required by the assessment.
- Generated parameters or seed values for dynamic questions.
- Draft answers entered by the learner when practical.
- Original start timestamp and configured time limit.
- Last saved timestamp.
- Lock or auto-submit reason when applicable.
- Local sync or export status.

Do not store unnecessary sensitive data. If browser storage is unavailable, the
exam should show a clear message before the learner starts or provide a
documented teacher-controlled fallback.

## Recovery Flow

When a saved in-progress attempt exists, the system should detect it before
starting a new attempt.

The recovery flow should:

- Preserve the original start timestamp.
- Recalculate remaining time from the original start time and time limit.
- Resume the same generated question parameters, draft answers, and scoring
  context.
- Submit or lock as `timeout` if the time limit expired while the learner was
  away.
- Avoid silently discarding saved attempts.
- Allow discard only when the repository documents the teacher or maintainer
  policy for doing so.

Refreshing the page, closing the browser, or losing network access must not grant
extra exam time unless a teacher-controlled reset is explicitly documented.

## Sync and Export Status

Assessment state and storage state should be tracked separately.

Recommended assessment statuses:

- `in-progress`
- `submitted`
- `auto-submitted`
- `locked`

Recommended sync or export statuses:

- `not-applicable`
- `local-only`
- `pending-export`
- `exported`
- `pending-sync`
- `synced`
- `sync-failed`
- `conflict-review`

Do not mark an attempt as `synced` or `exported` until the target backend,
download, or teacher-controlled export acknowledges the stored result.

If submission or synchronization fails after scoring, the system should preserve
the completed session data for retry or export and show a respectful message
that explains the submission is pending review or retry.

## Review and Audit Fields

Recovered, pending, or failed submissions should record enough information for
review without exposing hidden answer logic to learners.

Useful fields include:

- Attempt ID.
- Original start timestamp.
- Last saved timestamp.
- Recovered timestamp.
- Submitted timestamp.
- Sync status.
- Recovery action.
- Lock or auto-submit reason.
- Client clock warning when detected.

---

# Security and Privacy

Timed or scored exams that collect learner identity, answers, scores, saved
attempts, exports, or backend submissions must follow `Security-and-Privacy.md`.

At minimum, exam documentation should define:

- Learner data collected before the exam starts.
- Why each field is needed.
- Where attempts and submissions are stored.
- Whether data is local-only, exported, or sent to a backend.
- Input validation for identity fields, roll number, and answers.
- Tamper limits for client-side scoring or local-only classroom exams.
- Sync, export, retry, or failure status shown after submission.
- Privacy limits for locally persisted learner data.

Client-side integrity controls can support classroom workflows, but they should
not be described as tamper-proof unless the repository has a verified backend or
teacher-controlled review process.

Do not commit real learner identities, real assessment submissions, secrets, or
backend credentials to the repository.

---

# Performance and Submission Responsiveness

Timed or scored exams that submit to a backend, export files, generate questions,
or run under unstable networks should follow `Performance-Standards.md`.

Submission behavior should be bounded and reviewable:

- Preserve completed session data before retrying when practical.
- Show pending, failed, local-only, exported, or synced status clearly.
- Avoid granting extra time while waiting for generation or submission.
- Avoid duplicate submissions, or mark duplicates for review.

---

# Numerical Answers

For calculation questions:

- Accepted units must be documented when units are required.
- Decimal-place rules must be visible before or during the question.
- Tolerance must be documented in code or data.
- Scoring must compare normalized numeric values, not raw display strings.
- Questions should calculate expected answers from formulas when practical.

Example learner-facing rule:

```text
Enter numerical answers as decimal values with no more than 2 decimal places.
```

---

# Scoring Rules

Scoring logic must be independent from UI rendering.

The scoring domain or domain-safe assessment module should receive:

- Exam configuration.
- Question definitions.
- Learner answers.
- Timing state when relevant.

The scoring domain or domain-safe assessment module should return:

- Per-question correctness or score.
- Total score.
- Maximum score.
- Submission status.
- Feedback state when applicable.

UI code must display scoring results and must not be the source of scoring
truth.

---

# Result Data Contract

Stored or exported exam session data should follow
`schemas/assessment-session.schema.json`.

At minimum, a submitted result should include:

- Exam ID.
- Exam title.
- Learner identity.
- Start timestamp.
- Submit timestamp.
- Time limit.
- Answers.
- Score.
- Maximum score.
- Submission status.
- Sync or export status when applicable.
- Lock or auto-submit reason when applicable.

Do not store unnecessary sensitive data.

---

# Accessibility Requirements

Timed or scored exam screens must preserve the accessibility expectations in
`Accessibility.md` and `UI-Guidelines.md`.

Before release, verify that:

- Warning text is visible before starting.
- Form fields expose accessible labels.
- The start button is disabled until required fields are valid.
- Keyboard navigation reaches every field and action.
- Focus states are visible.
- Validation messages are placed near invalid fields.
- Time warnings are understandable without relying on color alone.
- The layout has no overlapping text or controls on supported screen sizes.

---

# Review Checklist

Use this checklist when reviewing a timed or scored exam system.

| Check | Question |
| :--- | :--- |
| Metadata | Does documented metadata match the implemented exam behavior? |
| Start screen | Does the exam show title, topic, rules, identity fields, and actions before starting? |
| Explicit start | Does the timer start only after the learner selects the start action? |
| Identity validation | Are required learner fields validated before starting? |
| Timing | Is the time limit displayed and enforced consistently? |
| Lock behavior | Are refresh, tab-switch, timeout, or auto-submit rules documented and deterministic? |
| Interruption recovery | Does the exam document local persistence, recovery flow, and offline or network failure behavior? |
| Timer continuity | Do recovered attempts preserve the original start time instead of granting extra time? |
| Sync/export status | Are pending, synced, failed, local-only, or exported results labeled clearly when applicable? |
| Security and privacy | Are learner data, input validation, storage, export, tamper limits, and privacy notes documented? |
| Submission performance | Are slow, failed, duplicate, or offline submissions handled and reviewable? |
| Numerical answers | Are decimal, unit, and tolerance rules documented and enforced consistently? |
| Scoring | Is scoring independent from UI rendering? |
| Dynamic questions | Do generated questions also follow `Dynamic-Quiz-System-Rules.md`? |
| Result data | Does stored or exported data follow `schemas/assessment-session.schema.json` when applicable? |
| Accessibility | Can the start screen and exam flow be used with keyboard controls and readable warning text? |

---

# Relationship to Other Standards

Full standards index: `README.md`.

Closest companions: `Dynamic-Quiz-System-Rules.md`, `Security-and-Privacy.md`,
`Performance-Standards.md`, `Architecture-Enforcement.md`,
`Standard-Compliance-Checklist.md`, `README-Template.md`, `UI-Guidelines.md`,
and `Accessibility.md`.

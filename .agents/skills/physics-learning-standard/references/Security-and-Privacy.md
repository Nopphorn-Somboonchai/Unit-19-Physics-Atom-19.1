# Security and Privacy

> Security, learner data, privacy, and assessment integrity guidance for the
> Physics Learning Ecosystem.

---

# Purpose

Physics learning software may collect learner names, class information, student
numbers, answers, scores, saved attempts, exports, or backend submissions.

Security and privacy guidance protects learners, teachers, and maintainers while
keeping the educational system understandable.

This document defines baseline expectations for input handling, data
minimization, local storage, exports, assessment integrity, and privacy review.

---

# Core Rule

Collect the minimum learner data needed for the learning or assessment purpose.

Do not store sensitive data only because it is technically convenient.

Repositories that collect, persist, export, or submit learner data should
document:

- What data is collected.
- Why it is needed.
- Where it is stored.
- How long it is kept when known.
- Who can review or export it.
- What happens when storage or submission fails.

---

# Learner Data

Common learner data includes:

- Full name.
- Class, room, or section.
- Student number.
- Answers and draft answers.
- Generated parameters or seeds.
- Score and feedback.
- Attempt timestamps.
- Sync or export status.

Student number is not a complete identity by itself.

If a repository uses student number for dynamic question generation, follow
`Dynamic-Quiz-System-Rules.md`.

---

# Input Handling

All learner-provided input should be validated before it is used for scoring,
storage, export, or display.

Recommended practices:

- Trim accidental whitespace where appropriate.
- Validate required identity fields before starting an exam.
- Validate numerical answers using documented units and tolerance.
- Reject invalid roll numbers before generating learner-specific questions.
- Escape or safely render text before displaying it as HTML.
- Avoid placing raw learner input into code, markup, filenames, or formulas.

Validation messages should be respectful and specific.

---

# Assessment Integrity

Client-side checks can support classroom workflows, but they are not a strong
security boundary.

Timed or scored exams should not rely on hidden client-side answer keys as the
only protection against tampering.

When backend submission exists:

- Recalculate or verify scores server-side when practical.
- Store exam ID, exam version, question IDs, generated parameters, submitted
  answers, timestamps, and score review data.
- Treat client-submitted score fields as review data unless the backend
  independently verifies them.

When local-only or export-only submission is used:

- Document that the system is classroom-local.
- Preserve review fields for teacher inspection.
- Avoid claiming tamper-proof scoring.

---

# Local Storage

Use local storage only for data that the repository intentionally needs.

For timed or scored exams, local persistence should follow
`Timed-Exam-System-Rules.md`.

Recommended practices:

- Save only data required for recovery, scoring, export, or review.
- Avoid storing unnecessary personal data.
- Provide a documented clear/discard flow when appropriate.
- Label completed local submissions as `local-only`, `pending-export`, or
  another documented status.
- Explain what happens if browser storage is unavailable.

---

# Export and Submission

Exports and submissions should be predictable and reviewable.

Repositories should document:

- Export format.
- Destination or backend, if any.
- Required network access.
- Retry behavior.
- Sync or export status labels.
- Failure message shown to learners or teachers.

Do not mark a result as exported or synced until the export or backend
acknowledges success.

---

# Privacy and PDPA Awareness

Repositories used in Thai classrooms should be aware that learner data may be
subject to school policy and Thai PDPA expectations.

This standard does not provide legal advice. It requires repositories to make
learner data handling explicit so maintainers and schools can review it.

At minimum:

- Do not collect unnecessary personal data.
- Do not publish learner data in public repositories.
- Do not commit real assessment results or learner identities.
- Use fictional or anonymized data in examples and tests.
- Document third-party services that receive learner data.

---

# Secrets and Configuration

Do not commit secrets, API keys, backend credentials, or private tokens.

Use environment variables or deployment configuration for secrets when needed.

Documentation should use placeholders such as:

```text
EXAMPLE_API_KEY
```

Never use real learner data or real credentials in examples.

---

# Review Checklist

| Check | Question |
| :--- | :--- |
| Data minimization | Does the repository collect only necessary learner data? |
| Data documentation | Does README or docs explain collected data, storage, export, and retention when known? |
| Input validation | Are identity fields, numerical answers, and generated-value inputs validated before use? |
| Safe rendering | Is learner input safely displayed or exported? |
| Assessment integrity | Is scoring reviewable, and are tamper limits documented for client-side exams? |
| Local storage | Is local persistence scoped, recoverable, and documented? |
| Export/submission | Are sync/export statuses and failure behavior documented? |
| Secrets | Are credentials and real learner data absent from the repository? |

---

# Relationship to Other Standards

Full standards index: `README.md`.

Closest companions: `Timed-Exam-System-Rules.md`,
`Dynamic-Quiz-System-Rules.md`, `Validation-Workflow.md`,
`README-Template.md`, and `Standard-Compliance-Checklist.md`.

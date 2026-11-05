# Decision 0014: Add Expanded Governance Guidance

Status: Accepted

Date: 2026-08-02

---

# Context

The standard already covers architecture, physics correctness, dynamic quizzes,
timed exams, validation, implementation examples, automation, and AI document
selection.

Child repositories still need shared governance for three cross-cutting areas:

- Thai-English language, bilingual labels, locale formatting, and encoding.
- Learner data, privacy, input handling, assessment integrity, storage, export,
  submission, and secrets.
- Simulation, Canvas, dynamic generation, asset, and assessment submission
  performance.

Without shared guidance, repositories may handle these concerns inconsistently,
especially in timed or scored exams that collect learner identity and results.

---

# Decision

The standard adds three conditional governance documents:

- `Internationalization-and-Localization.md`
- `Security-and-Privacy.md`
- `Performance-Standards.md`

The new guidance is conditional. Repositories should apply it only when the
behavior exists and should mark non-applicable checks as `Not applicable`.

Related templates, checklists, AI agent rules, profile guidance, domain-specific
standards, and validation checks are updated to reference the new documents.

---

# Rationale

The three areas affect many repository profiles, but they should not be forced
onto repositories where they do not apply.

Separating them into dedicated documents keeps detailed guidance discoverable
without expanding every existing standard. This preserves token efficiency while
giving maintainers and AI agents clear review targets for language, privacy, and
performance work.

The security and privacy guidance is intentionally not legal advice. It requires
explicit learner data handling so schools, teachers, and maintainers can review
risk against their own policies.

---

# Impact

Child repositories should document:

- Primary UI language and locale-sensitive rules when learner-facing text is
  present.
- Learner data handling when identity, answers, scores, storage, export, or
  submission exists.
- Performance expectations when simulations, Canvas rendering, generated
  values, large assets, or submission flows affect learning or fairness.

AI agents should use the Document Selection Matrix in `AGENTS.md` to load these
documents only when the task touches the relevant behavior.

---

# Related Standards

- `Internationalization-and-Localization.md`
- `Security-and-Privacy.md`
- `Performance-Standards.md`
- `AGENTS.md`
- `AI-Agent-Rules.md`
- `Repository-Profiles.md`
- `Standard-Compliance-Checklist.md`
- `README-Template.md`
- `Timed-Exam-System-Rules.md`
- `Simulation-Standards.md`
- `Canvas-Guidelines.md`
- `Validation-Workflow.md`

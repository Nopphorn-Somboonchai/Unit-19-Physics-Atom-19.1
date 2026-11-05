# AGENTS.md

> AI agent entry point for the Physics Learning Standard repository.

AI agents working in this repository MUST follow the standards defined here before making changes.

## Required Reading

Before modifying files, AI agents MUST read:

1. README.md
2. Principles.md
3. Architecture.md
4. Architecture-Enforcement.md
5. Folder-Structure.md
6. AI-Agent-Rules.md
7. VERSION.md
8. CHANGELOG.md
9. Repository-Profiles.md
10. Standard-Compliance-Checklist.md
11. Physics-Standards.md, when physics content is involved
12. Units-and-Notation.md, when formulas, variables, or units are involved
13. Simulation-Standards.md, when simulations, dynamic questions, or numerical validation are involved
14. Dynamic-Quiz-System-Rules.md, when dynamic quizzes, randomized assessments, or roll-number based questions are involved
15. Timed-Exam-System-Rules.md, when timed exams, scored assessments, exam start screens, lock behavior, or submitted exam data are involved
16. Internationalization-and-Localization.md, when language, bilingual labels, Thai-English text, encoding, or locale formatting is involved
17. Security-and-Privacy.md, when learner data, input handling, storage, export, submission, secrets, or privacy is involved
18. Performance-Standards.md, when simulations, Canvas rendering, dynamic generation, large assets, runtime loops, or assessment submission performance is involved
19. Validation-Workflow.md, when completing or reviewing changes
20. The standard document related to the task

## Document Selection Matrix

After reading the required core documents, use this matrix to choose additional
task-specific standards. Do not read unrelated domain standards unless the task
touches that behavior.

| Task type | Read in addition | Usually not needed unless directly touched |
| :--- | :--- | :--- |
| Repository creation or compliance review | Repository-Profiles.md, Standard-Compliance-Checklist.md, README-Template.md, Validation-Workflow.md | Canvas-Guidelines.md, UI-Guidelines.md, Timed-Exam-System-Rules.md |
| Architecture or source boundary change | Architecture.md, Architecture-Enforcement.md, Folder-Structure.md | Dynamic-Quiz-System-Rules.md, Timed-Exam-System-Rules.md |
| Physics formula, constant, or unit change | Physics-Standards.md, Units-and-Notation.md, Simulation-Standards.md when numerical behavior is involved | Canvas-Guidelines.md, UI-Guidelines.md |
| Simulation, numerical validation, or dynamic generated values | Simulation-Standards.md, Physics-Standards.md, Units-and-Notation.md, Performance-Standards.md when runtime responsiveness matters | Timed-Exam-System-Rules.md unless exam mode is included |
| Dynamic quiz or randomized assessment | Dynamic-Quiz-System-Rules.md, Simulation-Standards.md, Physics-Standards.md, Units-and-Notation.md | Canvas-Guidelines.md unless rendering changes |
| Timed or scored exam | Timed-Exam-System-Rules.md, Security-and-Privacy.md, Dynamic-Quiz-System-Rules.md when generated questions are included, Validation-Workflow.md | Canvas-Guidelines.md unless rendering changes |
| UI, Canvas, formula display, or accessibility | UI-Guidelines.md, Canvas-Guidelines.md, Formula-Display.md, Accessibility.md, Internationalization-and-Localization.md when language changes | Dynamic-Quiz-System-Rules.md, Timed-Exam-System-Rules.md unless assessment behavior changes |
| Security, privacy, learner data, or export/submission | Security-and-Privacy.md, Timed-Exam-System-Rules.md when assessments are involved, Validation-Workflow.md | Canvas-Guidelines.md unless rendering changes |
| Performance, large assets, animation, or network submission | Performance-Standards.md, Simulation-Standards.md, Canvas-Guidelines.md or Timed-Exam-System-Rules.md as applicable | Security-and-Privacy.md unless learner data or submission is involved |
| Standard repository update | VERSION.md, CHANGELOG.md, Decision-Records.md, Validation-Workflow.md, related ADRs | Child-repository profile examples unless the change affects them |

## Working Rules

AI agents MUST:

- Keep changes focused on the requested task.
- Preserve the Domain-Centric Architecture.
- Apply Architecture-Enforcement.md when reviewing code boundaries.
- Apply Physics-Standards.md when reviewing physics content.
- Apply Units-and-Notation.md when reviewing formulas, variables, units, or constants.
- Apply Simulation-Standards.md when reviewing simulations, dynamic questions, randomness, or numerical tolerance.
- Apply Dynamic-Quiz-System-Rules.md when reviewing dynamic quizzes, randomized assessments, roll-number based parameter generation, or on-the-fly answer validation.
- Apply Timed-Exam-System-Rules.md when reviewing timed exams, scored assessments, exam start screens, lock behavior, scoring, or submitted exam data.
- Apply Internationalization-and-Localization.md when reviewing Thai-English text, bilingual labels, encoding, or locale-specific formatting.
- Apply Security-and-Privacy.md when reviewing learner data, input handling, storage, export, submission, secrets, or privacy behavior.
- Apply Performance-Standards.md when reviewing simulations, Canvas rendering, dynamic generation, assets, runtime loops, or assessment submission performance.
- Avoid unrelated refactoring.
- Avoid changing established standards without documenting the reason.
- Update related documentation when a standard changes.
- Update CHANGELOG.md and VERSION.md when a change affects the approved standard version.
- Create or update ADRs in `adr/` for significant architectural or cross-repository decisions.
- Use repository profiles and the compliance checklist when creating or reviewing ecosystem repositories.
- Run `scripts/validate-standard.ps1` or document why it could not be run after changing this standard repository.
- Report validation performed before completion.

AI agents MUST NOT:

- Move physics logic into UI, Canvas, formula, or infrastructure layers.
- Introduce undocumented architecture changes.
- Leave referenced required files empty.
- Change repository direction without maintainer approval.

## Conflict Resolution

If standards appear to conflict, AI agents MUST apply them in this order:

1. Principles.md
2. Architecture.md
3. Folder-Structure.md
4. Domain-specific standards
5. Coding-Standards.md
6. Naming-Conventions.md
7. AI-Agent-Rules.md
8. AGENTS.md

Lower-level documents MUST NOT override higher-level standards.

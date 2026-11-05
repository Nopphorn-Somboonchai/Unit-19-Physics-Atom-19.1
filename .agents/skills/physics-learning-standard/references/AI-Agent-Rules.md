# AI Agent Rules

> **AI Collaboration Guidelines for the Physics Learning Ecosystem**

This document defines the rules and expectations for AI agents contributing to repositories within the Physics Learning ecosystem.

Its purpose is to ensure that AI-generated contributions remain consistent, maintainable, and aligned with the project's engineering standards.

These rules apply to all AI-assisted development unless explicitly overridden by project maintainers.

---

# Purpose

AI agents are collaborators, not decision makers.

Their responsibility is to assist development while respecting the project's architecture, engineering standards, and educational goals.

AI should improve productivity without reducing software quality.

---

# General Principles

AI agents should:

* Follow established project standards.
* Preserve architectural consistency.
* Prefer clarity over unnecessary complexity.
* Produce maintainable code.
* Respect existing design decisions.

When uncertain, AI should avoid making assumptions that change project direction.

---

# Understand Before Changing

Before modifying code, AI agents should understand:

* Repository purpose
* Existing architecture
* Folder structure
* Module responsibilities
* Related documentation

Avoid making isolated changes without sufficient context.

---

# Think Before Acting

AI agents should understand the problem before proposing a solution.

Avoid making immediate implementation changes without first considering architecture, existing standards, and long-term maintainability.

Reasoning should precede implementation.

---

# Follow Project Standards

AI-generated work should comply with:

* Principles.md
* Architecture.md
* Architecture-Enforcement.md
* Folder-Structure.md
* Repository-Profiles.md
* Standard-Compliance-Checklist.md
* Physics-Standards.md
* Units-and-Notation.md
* Simulation-Standards.md
* Dynamic-Quiz-System-Rules.md
* Timed-Exam-System-Rules.md
* Internationalization-and-Localization.md
* Security-and-Privacy.md
* Performance-Standards.md
* Validation-Workflow.md
* Coding-Standards.md
* Naming-Conventions.md
* Canvas-Guidelines.md
* Formula-Display.md
* UI-Guidelines.md
* Accessibility.md

Project standards take precedence over general coding preferences.

Use the Document Selection Matrix in `AGENTS.md` to choose additional
task-specific standards without reading unrelated domain standards.

---

# Preserve Architecture

AI agents should respect the established architecture.

Do not:

* Introduce unnecessary coupling.
* Move business logic into rendering layers.
* Mix unrelated responsibilities.
* Bypass architectural boundaries.

Technology should continue to serve the Physics Domain.

Use **Architecture-Enforcement.md** when deciding whether code belongs in the Physics Domain, Application Services, Adapters, Infrastructure, Shared modules, or Utilities.

Use **Physics-Standards.md**, **Units-and-Notation.md**, and **Simulation-Standards.md** when creating or modifying physics explanations, formulas, constants, simulations, dynamic questions, or numerical validation.

Use **Dynamic-Quiz-System-Rules.md** when creating or modifying dynamic quizzes, randomized assessments, roll-number based parameter generation, on-the-fly validation, or worked solution generation.

Use **Timed-Exam-System-Rules.md** when creating or modifying timed exams, scored assessments, exam start screens, learner identity fields, lock behavior, scoring, or submitted exam data.

Use **Internationalization-and-Localization.md** when creating or modifying Thai-English text, bilingual labels, encoding, locale-sensitive formatting, or learner-facing translated content.

Use **Security-and-Privacy.md** when creating or modifying learner data collection, input handling, storage, export, backend submission, secrets, or privacy-sensitive flows.

Use **Performance-Standards.md** when creating or modifying simulations, Canvas rendering, dynamic generation loops, large assets, runtime performance, or assessment submission behavior.

Use **Validation-Workflow.md** when finishing changes or reviewing repository compliance.

For changes to this standard repository, AI agents should run `scripts/validate-standard.ps1` when possible and report the result.

---

# Focused Changes

Each change should have a single, well-defined purpose.

Avoid combining refactoring, feature additions, formatting, and architectural changes into a single modification whenever practical.

---

# Minimize Unnecessary Changes

AI should modify only what is necessary.

Avoid:

* Large-scale refactoring without justification.
* Renaming unrelated code.
* Reformatting entire files without purpose.
* Changing established patterns unnecessarily.

Small, focused changes are preferred.

---

# Produce Readable Code

Generated code should be:

* Clear
* Consistent
* Modular
* Predictable
* Easy to review

Code should prioritize maintainability over novelty.

---

# Reuse Before Creating

Before introducing new modules or utilities, AI should determine whether equivalent functionality already exists.

Prefer extending existing reusable components over creating duplicates.

Avoid unnecessary code duplication.

---

# Preserve Consistency

When multiple valid solutions exist, prefer the one that is most consistent with the existing project.

Consistency across repositories is more valuable than introducing new patterns.

---

# Explain Significant Decisions

When making non-trivial architectural or design changes, AI should explain:

* What changed
* Why it changed
* Expected impact

Transparent reasoning improves collaboration and code review.

---

# Educational Focus

Every contribution should support the educational mission of the project.

AI should prioritize:

* Learning clarity
* Scientific correctness
* Educational consistency

Technical elegance should never reduce educational value.

---

# Human Oversight

Final architectural and engineering decisions remain the responsibility of human maintainers.

AI recommendations should be treated as proposals rather than authoritative decisions.

---

# Relationship to Other Standards

This document complements all engineering standards within the Physics Learning ecosystem.

AI agents should interpret these standards as a unified system rather than isolated documents.

---

# Golden Rule

Every contribution should improve the repository without reducing its consistency, maintainability, or educational value.

When trade-offs are required, AI agents should prioritize:

1. Educational value
2. Architectural consistency
3. Simplicity
4. Maintainability
5. Implementation convenience

AI should adapt to the project.

The project should never adapt to AI.

---

# Summary

AI agents are engineering collaborators.

They should preserve architecture, respect established standards, and support the educational goals of the project through consistent, maintainable, and well-reasoned contributions.

Successful AI collaboration depends on understanding the project before attempting to improve it.

# Physics Learning Standard

> **Official Engineering Standards for the Physics Learning Ecosystem**

The **Physics Learning Standard** repository serves as the **single source of truth** for engineering practices, architectural guidelines, development standards, and documentation conventions across the entire Physics Learning Project.

Every repository within the ecosystem should reference and follow the standards defined here to ensure consistency, maintainability, scalability, and long-term sustainability.

---

# Vision

Build a consistent, scalable, maintainable, and high-quality Physics Learning ecosystem through a unified engineering standard.

Our goal is to ensure that every learning module, simulation, library, and shared component follows the same architectural principles and development practices, creating a seamless experience for both developers and learners.

---

# Mission

This repository exists to:

* Define engineering standards for all repositories.
* Establish a common software architecture.
* Maintain consistent project structures.
* Standardize documentation.
* Define coding conventions.
* Promote maintainable and scalable software.
* Improve collaboration across repositories.
* Provide a common reference for AI-assisted development.

---

# Why This Repository Exists

As projects grow, individual repositories naturally evolve in different directions. Without a centralized standard, inconsistencies begin to appear in:

* Project architecture
* Architecture enforcement
* Folder organization
* Coding style
* Documentation
* User interface design
* Accessibility
* Mathematical notation
* Canvas rendering
* Naming conventions

Over time, these inconsistencies increase maintenance costs, reduce code quality, and make collaboration more difficult.

The **Physics Learning Standard** repository eliminates these problems by providing one authoritative reference that every repository follows.

---

# Scope

These standards apply to every repository within the Physics Learning ecosystem, including but not limited to:

* Physics Learning Units
* Interactive Simulations
* Shared Libraries
* UI Components
* Physics Engines
* Utility Packages
* Documentation Repositories
* Educational Tools
* Future supporting repositories

---

# Repository Structure

```text
physics-learning-standard/

├── README.md
├── VERSION.md
├── CHANGELOG.md
├── Principles.md
├── Architecture.md
├── Architecture-Enforcement.md
├── Folder-Structure.md
├── Repository-Profiles.md
├── Standard-Compliance-Checklist.md
├── Physics-Standards.md
├── Units-and-Notation.md
├── Simulation-Standards.md
├── Dynamic-Quiz-System-Rules.md
├── Timed-Exam-System-Rules.md
├── Internationalization-and-Localization.md
├── Security-and-Privacy.md
├── Performance-Standards.md
├── Validation-Workflow.md
├── README-Template.md
├── Coding-Standards.md
├── Naming-Conventions.md
├── Canvas-Guidelines.md
├── UI-Guidelines.md
├── Formula-Display.md
├── Accessibility.md
├── AI-Agent-Rules.md
├── Decision-Records.md
├── examples/
│   ├── physics-unit-example/
│   ├── readme-profile-examples/
│   └── test-templates/
├── schemas/
│   └── assessment-session.schema.json
├── adr/
│   ├── README.md
│   ├── 0001-adopt-domain-centric-architecture.md
│   ├── 0002-define-repository-profiles-and-compliance.md
│   ├── 0003-define-architecture-enforcement-rules.md
│   ├── 0004-define-physics-domain-standards.md
│   ├── 0005-define-validation-workflow.md
│   ├── 0006-define-dynamic-quiz-system-rules.md
│   ├── 0007-define-timed-exam-system-rules.md
│   ├── 0008-standardize-high-school-gravity-approximation.md
│   ├── 0009-add-reference-implementation-example.md
│   ├── 0010-define-dynamic-quiz-fallback-strategy.md
│   ├── 0011-define-timed-exam-interruption-recovery.md
│   ├── 0012-add-implementation-support-examples.md
│   ├── 0013-add-child-repository-validation-and-agent-decision-matrix.md
│   └── 0014-add-expanded-governance-guidance.md
├── scripts/
│   ├── README.md
│   ├── validate-standard.ps1
│   └── validate-repository.ps1
└── LICENSE
```

---

# Standards Overview

| Document                  | Purpose                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| **README.md**             | Project overview and entry point                                   |
| **VERSION.md**            | Current approved standard version and versioning rules             |
| **CHANGELOG.md**          | History of approved standard changes                               |
| **Principles.md**         | Engineering philosophy and core principles                         |
| **Architecture.md**       | Standard software architecture                                     |
| **Architecture-Enforcement.md** | Enforceable dependency and responsibility boundary rules     |
| **Folder-Structure.md**   | Standard repository layout                                         |
| **Repository-Profiles.md** | Standard repository profiles for ecosystem repositories            |
| **Standard-Compliance-Checklist.md** | Profile-based checklist for standard compliance          |
| **Physics-Standards.md**  | Scientific correctness standards for physics content               |
| **Units-and-Notation.md** | Unit, symbol, and notation standards                               |
| **Simulation-Standards.md** | Simulation, numerical validation, and dynamic question standards  |
| **Dynamic-Quiz-System-Rules.md** | Roll-number based dynamic quiz generation and validation rules |
| **Timed-Exam-System-Rules.md** | Timed and scored exam flow, start screen, scoring, recovery, and result data rules |
| **Internationalization-and-Localization.md** | Thai-English language, locale, encoding, and bilingual text guidance |
| **Security-and-Privacy.md** | Learner data, privacy, input handling, assessment integrity, and submission security guidance |
| **Performance-Standards.md** | Simulation, Canvas, dynamic generation, asset, and assessment submission performance guidance |
| **schemas/assessment-session.schema.json** | Shared data contract for stored or exported exam sessions, including optional recovery and sync status fields |
| **Validation-Workflow.md** | Validation workflow, reporting expectations, and automation scope  |
| **README-Template.md**    | Official README template for all repositories                      |
| **Coding-Standards.md**   | JavaScript / ES2025 coding standards                               |
| **Naming-Conventions.md** | Naming rules for files, folders, variables, classes, and functions |
| **Canvas-Guidelines.md**  | Canvas rendering standards                                         |
| **UI-Guidelines.md**      | UI and UX consistency guidelines                                   |
| **Formula-Display.md**    | Mathematical formula rendering standards                           |
| **Accessibility.md**      | Accessibility requirements                                         |
| **AI-Agent-Rules.md**     | Rules for AI-assisted development                                  |
| **Decision-Records.md**   | Architectural Decision Records (ADR)                               |
| **examples/physics-unit-example/** | Reference implementation for a learning-unit repository |
| **examples/readme-profile-examples/** | Profile-specific README examples for child repositories |
| **examples/test-templates/** | Reusable contract-test examples for physics, dynamic quiz, and answer validation behavior |
| **adr/**                  | Individual decision record files                                   |
| **scripts/validate-standard.ps1** | Lightweight validation script for this standard repository |
| **scripts/validate-repository.ps1** | Read-only lightweight validator for child repository README/profile/version evidence and basic source boundaries |
| **scripts/README.md** | Usage notes for standard and child repository automation |

---

# Engineering Principles

The entire project follows a shared engineering philosophy documented in **Principles.md**.

Core principles include:

* Consistency
* Simplicity
* Maintainability
* Scalability
* Documentation First
* Learning First
* Reusability
* Accessibility by Default

All repositories are expected to align with these principles.

---

# AI Agent Compliance

This project is designed to support both human developers and AI-assisted development.

All AI agents working within the Physics Learning ecosystem should follow the standards defined in this repository.

This includes, but is not limited to:

* Repository structure
* Documentation
* Coding style
* Software architecture
* UI implementation
* Naming conventions
* Accessibility
* Formula rendering
* Canvas implementation
* Physics correctness
* Units and notation
* Simulation validation
* Dynamic quiz validation
* Timed exam and scored assessment validation
* Internationalization and localization
* Security and learner data privacy
* Performance and responsiveness
* Validation reporting

Agent-generated code and documentation should comply with these standards unless a repository explicitly defines a justified exception.

AI agents creating or reviewing ecosystem repositories should identify the repository profile and use **Standard-Compliance-Checklist.md** to verify applicable requirements.

Repositories with source code should use **Architecture-Enforcement.md** to review dependency direction, layer responsibilities, and documented exceptions.

Repositories with physics content should use **Physics-Standards.md**, **Units-and-Notation.md**, and **Simulation-Standards.md** to review scientific correctness, unit consistency, notation, numerical tolerance, and simulation behavior.

Repositories with dynamic quizzes should use **Dynamic-Quiz-System-Rules.md** to review roll-number based parameter generation, non-deterministic random values, on-the-fly validation, safety constraints, tolerance, and worked solutions.

Repositories with timed or scored exams should use **Timed-Exam-System-Rules.md** to review exam start screens, learner identity fields, timing, lock behavior, offline or recovery behavior, scoring, and submitted result data.

Repositories with Thai-English, bilingual, or locale-sensitive learner-facing text should use **Internationalization-and-Localization.md** to review language choice, encoding, labels, and locale formatting.

Repositories that collect, persist, export, or submit learner data should use **Security-and-Privacy.md** to review data minimization, input handling, privacy, assessment integrity, storage, export, and secrets.

Repositories with simulations, Canvas rendering, dynamic generation, large assets, or assessment submission flows should use **Performance-Standards.md** to review responsiveness, bounded loops, asset loading, and retry behavior.

Changes to this standard repository should use **Validation-Workflow.md** and run or document the result of **scripts/validate-standard.ps1** when possible.

AI agents and maintainers reviewing child repositories may use
**scripts/validate-repository.ps1** as a preflight check before completing the
profile-based compliance review.

---

# Repository Lifecycle

Every repository within the ecosystem should follow the same development lifecycle.

```text
Physics Learning Standard
            │
            ▼
Project Standards
            │
            ▼
Repository Template
            │
            ▼
Repository Development
            │
            ▼
Implementation
            │
            ▼
Code Review
            │
            ▼
Quality Assurance
            │
            ▼
Release
            │
            ▼
Continuous Improvement
```

The standards defined here should guide every stage of development.

---

# Standard Update Policy

Engineering standards evolve over time.

To maintain consistency across the ecosystem, all changes should follow the same governance process.

```text
Proposal
    │
    ▼
Technical Review
    │
    ▼
Approval
    │
    ▼
Documentation Update
    │
    ▼
Decision Record Update
    │
    ▼
Changelog Update
    │
    ▼
Version Increment
    │
    ▼
Validation
    │
    ▼
Repository Synchronization
```

Repositories should periodically synchronize with the latest approved standards.

---

# Versioning

This repository follows **Semantic Versioning (SemVer)**.

The current approved version is recorded in **VERSION.md**.

Approved standard changes are recorded in **CHANGELOG.md**.

Significant architectural or cross-repository decisions are recorded as individual files in **adr/**.

```text
MAJOR.MINOR.PATCH

MAJOR
Breaking changes to standards.

MINOR
New standards or significant additions.

PATCH
Clarifications, corrections, and documentation improvements.
```

Example:

```text
v1.13.0
```

---

# Contributing

Contributions to the engineering standards are welcome.

Before proposing changes:

1. Review the existing documentation.
2. Ensure the proposal aligns with the project's engineering principles.
3. Document the rationale for the change.
4. Update related standards if necessary.
5. Record significant architectural decisions in **adr/** according to **Decision-Records.md**.
6. Update **CHANGELOG.md** and **VERSION.md** when the change affects the approved standard version.
7. Run or document validation according to **Validation-Workflow.md**.

Consistency across the ecosystem should always take priority over individual repository preferences.

---

# Guiding Philosophy

This repository is more than a collection of documentation.

It is the engineering foundation of the entire Physics Learning ecosystem.

Every standard exists to support three primary goals:

* Build software that is easy to understand.
* Build software that is easy to maintain.
* Build software that improves the learning experience.

Engineering decisions should always serve educational quality first.

---

# License

The original documentation, standards, templates, guidelines, and governance materials in this repository are licensed under the **Creative Commons Attribution 4.0 International License (CC BY 4.0)**.

This license applies only to original materials created for this repository.

It does not apply to third-party educational content, textbook content, curriculum materials, problem statements, images, figures, or externally sourced materials, including materials from สสวท. or other educational publishers.

Third-party materials remain the property of their respective copyright holders and must be used only under their own licenses, permissions, or applicable legal exceptions.

See **LICENSE** for details.

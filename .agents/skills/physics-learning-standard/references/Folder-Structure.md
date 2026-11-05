# Folder Structure

> **Standard Repository Structure for the Physics Learning Ecosystem**

This document defines the standard repository and source code structure for all repositories within the Physics Learning ecosystem.

A consistent folder structure improves maintainability, reduces onboarding time, simplifies collaboration, and enables AI agents to generate repositories that follow the same engineering standards.

This document focuses on **how repositories should be organized**, not how code should be written.

---

# Purpose

Every repository should share a predictable structure.

A consistent organization helps developers and AI agents quickly understand:

* Where source code belongs
* Where documentation belongs
* Where assets belong
* Where tests belong
* How the source code is organized internally

---

# Repository Level

The **Repository Level** defines the top-level structure of every repository.

## Standard Repository Layout

```text
repository/

├── README.md
├── LICENSE
├── docs/
├── src/
├── assets/
├── tests/
└── scripts/
```

Additional files or folders may be added when required, but they should not change the purpose of the standard structure.

---

## Repository Folder Responsibilities

### Root Directory

**Purpose**

Project entry point and configuration.

**Typical Contents**

* README.md
* LICENSE
* package.json
* Configuration files
* Git metadata

The root directory should remain clean and contain only project-level files.

---

### docs/

**Purpose**

Project documentation.

**Contains**

* Architecture documents
* Design documents
* Development guides
* Decision records
* Learning resources

**Must Not Contain**

* Production source code
* Runtime assets
* Generated files

---

### src/

**Purpose**

Application source code.

This folder contains all production code and follows the Source Level structure defined later in this document.

---

### assets/

**Purpose**

Static resources used by the application.

**Contains**

* Images
* Icons
* Fonts
* Audio
* Static data files

**Must Not Contain**

* JavaScript source code
* Documentation
* Build scripts

---

### tests/

**Purpose**

Automated testing.

**Contains**

* Unit tests
* Integration tests
* Test fixtures
* Mock data

**Must Not Contain**

* Production code
* Documentation

---

### scripts/

**Purpose**

Development automation.

**Contains**

* Build scripts
* Utility scripts
* Maintenance scripts
* Development automation

**Must Not Contain**

* Application logic
* Physics calculations
* UI implementation

---

## Repository Rules

Every repository should follow these rules:

* Keep the repository root clean.
* Store documentation inside `docs/`.
* Store production code inside `src/`.
* Store static resources inside `assets/`.
* Store tests inside `tests/`.
* Store automation inside `scripts/`.
* Avoid unrelated files in the root directory.

---

# Source Level

The **Source Level** defines how the application code inside `src/` should be organized.

Its structure reflects the Domain-Centric Architecture defined in **Architecture.md**.

Dependency and responsibility boundaries are enforced by **Architecture-Enforcement.md**.

## Standard Source Layout

```text
src/

├── physics/
├── application/
├── adapters/
│   ├── canvas/
│   ├── formula/
│   ├── storage/
│   └── ui/
├── shared/
└── utils/
```

---

## Source Folder Responsibilities

### physics/

**Purpose**

Contains the core educational and scientific logic of the application.

**Contains**

* Physics models
* Physics formulas
* Mathematical calculations
* Simulation rules
* Educational algorithms

**Must Not Contain**

* UI
* Canvas rendering
* Browser APIs
* Storage
* External framework logic

---

### application/

**Purpose**

Coordinates application behavior.

**Contains**

* Use cases
* Application workflows
* State coordination
* Event orchestration

**Must Not Contain**

* Physics calculations
* Rendering logic
* Browser-specific implementation

---

### adapters/

**Purpose**

Connects external technologies to the application.

Adapters isolate implementation details from the Physics Domain.

Typical adapters include:

* Canvas
* Formula rendering
* User interface
* Storage

Technology changes should be implemented inside adapters whenever possible.

---

#### adapters/canvas/

Responsible for drawing and rendering using HTML Canvas or future rendering technologies.

---

#### adapters/formula/

Responsible for displaying mathematical formulas.

---

#### adapters/storage/

Responsible for persistence and data storage.

---

#### adapters/ui/

Responsible for user interface interaction.

---

### shared/

**Purpose**

Reusable modules shared across multiple features.

**Contains**

* Shared constants
* Common helpers
* Shared utilities
* Common models

**Must Not Contain**

* Feature-specific implementations

---

### utils/

**Purpose**

Generic helper functions.

**Contains**

General-purpose utilities without educational or application-specific knowledge.

**Must Not Contain**

* Physics logic
* Business workflows
* Rendering logic

---

## Source Design Rules

The source code should follow these principles:

* Organize code by responsibility.
* Keep the Physics Domain independent.
* Separate application logic from technology.
* Prefer reusable modules.
* Avoid circular dependencies.
* Keep modules small and focused.

---

# Naming Guidelines

Folder names should:

* Use lowercase.
* Use descriptive names.
* Avoid unnecessary abbreviations.
* Remain consistent across repositories.

Examples:

```text
Good

physics/
application/
adapters/
shared/
utils/

Avoid

misc/
temp/
new/
stuff/
```

---

# Flexibility

Not every repository requires every folder.

Examples:

* Documentation repositories may not require `src/`.
* Shared libraries may not require `assets/`.
* Utility packages may not require `docs/`.

Only create folders that are actually required.

However, whenever a folder exists, it should follow the responsibilities defined in this document.

Use **Repository-Profiles.md** and **Standard-Compliance-Checklist.md** to determine which folders apply to a specific repository profile.

---

# Relationship to Other Standards

Full standards index: `README.md`.

Closest companions: `Architecture.md`, `Architecture-Enforcement.md`, `Repository-Profiles.md`, `Standard-Compliance-Checklist.md`, and `README-Template.md`.

---

# Summary

A consistent folder structure is essential for maintaining a scalable and understandable codebase.

By separating the Repository Level from the Source Level, every repository shares the same external organization while allowing the internal source code to follow the project's Domain-Centric Architecture.

This consistency improves maintainability, collaboration, onboarding, and AI-assisted development across the entire Physics Learning ecosystem.

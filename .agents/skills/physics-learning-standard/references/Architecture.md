# Architecture

# Architecture Philosophy

The Physics Learning Project is built around one fundamental idea:

> **The Physics Domain is the center of the system.**

Technologies change.

Frameworks evolve.

Rendering engines improve.

Programming languages advance.

However, the educational content, physics models, and scientific principles remain stable.

For this reason, every architectural decision should protect the Physics Domain from unnecessary dependencies on technology.

---

> **Reference Architecture for the Physics Learning Ecosystem**

This document defines the reference architecture adopted by every repository within the Physics Learning ecosystem.

It establishes a consistent architectural foundation that enables repositories to remain maintainable, scalable, reusable, and easy to understand for both human developers and AI agents.

Implementation details are intentionally excluded from this document and are defined in their respective standards.

---

# Purpose

The purpose of this architecture is to provide a shared structural model for every repository in the project.

Rather than prescribing technologies or frameworks, this document defines how software should be organized and how responsibilities should be separated.

Every repository should follow this architecture unless there is a well-documented reason not to.

---

# Reference Architecture

```text
                    Physics Domain
                           ▲
                           │
               ┌───────────┼───────────┐
               │           │           │
               │           │           │
        Canvas Adapter  Formula Adapter  UI Adapter
               │           │           │
               └───────────┼───────────┘
                           │
                  Application Services
                           │
                           ▼
                   Infrastructure
```

The architecture is centered around the Physics Domain.

Everything outside the domain exists to support it.

---

# Architectural Components

## Physics Domain

The Physics Domain contains the core educational knowledge of the system.

Examples include:

* Physics models
* Scientific formulas
* Mathematical calculations
* Simulation rules
* Educational logic

The Physics Domain should never depend on UI, Canvas, browser APIs, or external frameworks.

---

## Application Services

Application Services coordinate interactions between the user interface and the Physics Domain.

Typical responsibilities include:

* User workflows
* Event handling
* State coordination
* Executing learning scenarios

Application Services should not contain rendering logic.

---

## Adapters

Adapters connect external technologies to the application.

Examples include:

* Canvas rendering
* Formula rendering
* User interface
* Browser interaction
* Storage

Adapters translate between external systems and the internal application.

Whenever technologies change, adapters should change—not the Physics Domain.

---

## Infrastructure

Infrastructure provides supporting technical services.

Examples include:

* Browser APIs
* Local storage
* Configuration
* Shared utilities
* External libraries

Infrastructure exists to support the application and should not contain educational logic.

---

# Dependency Rule

Dependencies should always move toward the Physics Domain.

```text
User Interface
        │
        ▼
Adapters
        │
        ▼
Application Services
        │
        ▼
Physics Domain
```

The reverse dependency should never occur.

The Physics Domain should remain independent of implementation technologies.

Detailed dependency and responsibility boundary rules are defined in **Architecture-Enforcement.md**.

---

# Separation of Responsibilities

Each architectural component has one primary responsibility.

| Component            | Responsibility                         |
| -------------------- | -------------------------------------- |
| Physics Domain       | Educational and scientific logic       |
| Application Services | Coordinate application behavior        |
| Adapters             | Communicate with external technologies |
| Infrastructure       | Provide technical services             |

Keeping responsibilities separate improves maintainability and simplifies future development.

---

# Repository Relationships

Every repository within the Physics Learning ecosystem follows the same architectural foundation.

```text
Physics Learning Standard
            │
            ▼
Repository Template
            │
            ▼
Learning Repository
            │
            ▼
Interactive Learning Module
```

This shared architecture ensures consistency across all repositories.

---

# Shared Components

Functionality that is used by multiple repositories should be extracted into Shared Components whenever appropriate.

Typical shared functionality includes:

* Mathematical utilities
* Physics constants
* Canvas utilities
* Common UI components
* Formula rendering utilities

Repositories should reuse Shared Components instead of duplicating implementations.

---

# Architectural Constraints

Repositories should:

* Follow the official project architecture.
* Keep educational logic independent from rendering.
* Separate responsibilities clearly.
* Avoid unnecessary coupling.
* Keep modules focused and reusable.
* Prefer composition over duplication.
* Document significant architectural decisions.
* Review implementation boundaries using **Architecture-Enforcement.md**.

---

# Relationship to Other Standards

Full standards index: `README.md`.

Closest companions: `Principles.md`, `Architecture-Enforcement.md`, `Folder-Structure.md`, and `Decision-Records.md`.

---

# Future Evolution

The architecture should evolve only when it provides clear benefits to the ecosystem.

Changes should:

* Improve maintainability
* Improve consistency
* Preserve compatibility whenever practical
* Be documented through Architectural Decision Records

Architecture should evolve deliberately rather than reactively.

---

# Architectural Decision Rationale

The Physics Learning ecosystem adopts a **Domain-Centric Architecture** because the project's most valuable asset is not its technology stack, but its educational and scientific knowledge.

Rendering technologies, UI frameworks, storage mechanisms, and external libraries are expected to evolve over time. However, the core physics concepts, mathematical models, and educational logic remain stable.

To preserve this stability, the Physics Domain is intentionally isolated from implementation details.

This architectural decision provides several long-term benefits:

- Educational logic remains independent of technology.
- Rendering technologies can evolve without affecting core logic.
- Shared physics models can be reused across repositories.
- Testing becomes simpler because the Physics Domain has minimal external dependencies.
- AI agents can more easily identify which parts of the system contain business logic and which parts are implementation details.

Rather than organizing the system around frameworks or user interfaces, this architecture organizes the system around knowledge.

Technology supports the Physics Domain.

The Physics Domain does not depend on technology.

---

# Design Principles

The reference architecture follows these principles:

- Domain First
- Separation of Responsibilities
- Low Coupling
- High Cohesion
- Reusability
- Simplicity

-----

# Shared Component Guidelines

A module should be extracted into a shared library when:

- It is reused by multiple repositories.
- It represents stable domain knowledge.
- It has independent value.
- It reduces duplication.
-----

# Golden Rule

Every architectural decision within the Physics Learning ecosystem should follow one fundamental principle:

> **Technology serves the Physics Domain.**
>
> **The Physics Domain never serves technology.**

When making architectural decisions, always prioritize preserving the independence of the Physics Domain over adopting new technologies or frameworks.

If a technology introduces unnecessary coupling to the Physics Domain, the architecture should be reconsidered.

This principle ensures that educational knowledge remains reusable, maintainable, and resilient to future technological changes.

-----

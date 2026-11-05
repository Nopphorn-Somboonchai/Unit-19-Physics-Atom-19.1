# Architecture Enforcement

> Enforceable architecture boundary rules for the Physics Learning Ecosystem.

This document turns the Domain-Centric Architecture from `Architecture.md` into reviewable dependency and responsibility rules.

---

# Purpose

The Physics Learning Ecosystem should protect physics knowledge from unnecessary technology dependencies.

This document explains how to check whether source code respects the architecture.

It is intended for:

- Human maintainers reviewing repositories.
- Contributors implementing new features.
- AI agents creating, editing, or reviewing repository code.
- Future automation that checks architecture boundaries.

---

# Core Rule

The Physics Domain is the center of the system.

Dependencies should point toward stable educational and scientific logic, not toward rendering technology.

```text
UI / Browser Events
        |
        v
Adapters
        |
        v
Application Services
        |
        v
Physics Domain
```

The reverse direction is not allowed.

---

# Standard Source Layers

When a repository uses `src/`, the expected source layers are:

```text
src/
|-- physics/
|-- application/
|-- adapters/
|   |-- canvas/
|   |-- formula/
|   |-- storage/
|   `-- ui/
|-- shared/
`-- utils/
```

Repositories may omit folders that do not apply to their profile.

When a folder exists, it must follow the responsibilities defined here and in `Folder-Structure.md`.

Repositories may add `src/infrastructure/` when technical support modules are needed.

If `src/infrastructure/` exists, it must remain technical and must not contain physics or educational logic.

---

# Dependency Matrix

Use this table when reviewing imports or module dependencies.

| Source layer | May depend on | Must not depend on |
| :--- | :--- | :--- |
| `src/physics/` | Local physics modules, domain-safe constants, pure math utilities | UI, Canvas, DOM, browser APIs, storage, rendering libraries, application workflows |
| `src/application/` | `src/physics/`, domain-safe shared utilities, application state models | Canvas APIs, DOM APIs, UI framework code, concrete browser storage, rendering libraries |
| `src/adapters/canvas/` | `src/application/`, `src/physics/`, drawing utilities, Canvas APIs | Defining core physics formulas or becoming the source of physics truth |
| `src/adapters/formula/` | `src/application/`, formula display libraries, formatting helpers | Defining physics calculations or replacing Physics Domain formulas |
| `src/adapters/storage/` | Application state contracts, browser or platform storage APIs | Defining learning rules or physics calculations |
| `src/adapters/ui/` | `src/application/`, UI framework or DOM APIs | Defining core physics formulas, simulation rules, or assessment truth |
| `src/infrastructure/` when present | Technical wrappers, platform services, configuration, external library setup | Physics formulas, learning rules, rendering truth |
| `src/shared/` | Domain-safe constants, shared data structures, general helpers | Feature-specific workflows or technology-specific behavior unless clearly scoped |
| `src/utils/` | Generic utilities without educational meaning | Physics formulas, business workflows, rendering logic |

---

# Physics Domain Rules

The Physics Domain contains educational and scientific truth.

It may include:

- Physics formulas.
- Physics constants.
- Unit conversion logic.
- Simulation state rules.
- Numerical calculation helpers.
- Validation logic for physics answers.
- Domain models such as vectors, forces, energy, waves, fields, or fluids.

Physics content in the domain should follow `Physics-Standards.md`, `Units-and-Notation.md`, `Simulation-Standards.md`, and `Dynamic-Quiz-System-Rules.md` when applicable.

Scored assessment and exam-flow logic should follow `Timed-Exam-System-Rules.md` when timed or scored exam mode is included.

It must not include:

- DOM access such as `document`, `window`, or HTML elements.
- Canvas drawing calls.
- UI component code.
- Browser storage such as `localStorage` or `sessionStorage`.
- Network calls.
- Formula rendering libraries.
- CSS class decisions.
- Event listener wiring.

The Physics Domain should be testable without opening a browser.

---

# Application Service Rules

Application Services coordinate behavior.

They may:

- Call Physics Domain functions.
- Coordinate user workflows.
- Prepare state for adapters.
- Manage application-level state transitions.
- Decide which use case runs next.

They must not:

- Draw on Canvas.
- Directly manipulate DOM elements.
- Store data directly in browser storage.
- Define physics formulas that belong in `src/physics/`.
- Render mathematical notation.

Application Services may define simple contracts for adapters, but concrete adapter implementation should stay in `src/adapters/`.

---

# Adapter Rules

Adapters connect the application to external technologies.

Adapters may:

- Read user input from the UI.
- Draw visual output.
- Render mathematical formulas.
- Store or load application state.
- Translate between external APIs and internal application data.

Adapters must not:

- Become the source of physics truth.
- Hide physics formulas inside rendering code.
- Duplicate domain calculations that already exist in `src/physics/`.
- Mix unrelated responsibilities in one module.

If an adapter needs a calculated value, it should receive that value from the Physics Domain or Application Services.

---

# Infrastructure Rules

Infrastructure modules provide technical support.

They may:

- Configure external libraries.
- Wrap platform APIs.
- Provide environment configuration.
- Support storage, network, or build-time integration.

They must not:

- Define physics formulas.
- Define educational rules.
- Become the source of simulation truth.
- Force the Physics Domain to depend on platform-specific APIs.

When infrastructure is needed by application behavior, prefer passing data through Application Services or adapters instead of importing infrastructure directly into the Physics Domain.

---

# Shared and Utility Rules

`src/shared/` is for reusable project-level modules.

Good examples:

- Shared constants.
- Common data models.
- Domain-safe helper functions.
- Reusable configuration objects.

`src/utils/` is for generic utilities without educational meaning.

Good examples:

- Number formatting helpers.
- Array helpers.
- String helpers.
- Simple validation helpers.

Avoid placing important physics formulas in `src/utils/` because they belong in `src/physics/`.

---

# External API Rules

The following APIs and technologies must not be used inside `src/physics/`:

- `document`
- `window`
- `HTMLElement`
- `CanvasRenderingContext2D`
- `localStorage`
- `sessionStorage`
- `fetch`
- UI frameworks
- Formula rendering libraries

These APIs should be isolated in adapters or infrastructure-specific modules.

---

# Simple Repository Rule

Some learning repositories may start as simple browser-based projects with files such as:

```text
index.html
app.js
style.css
```

This is allowed when it is appropriate for the repository profile.

However, even simple repositories should separate responsibilities conceptually.

At minimum:

- Physics formulas should be grouped and clearly named.
- Rendering functions should be grouped separately.
- UI event handlers should be grouped separately.
- Storage logic should be grouped separately.
- README should document that the repository uses a simple structure.

When a simple repository grows large or becomes difficult to review, it should migrate toward the standard `src/` structure.

---

# Exception Rules

Architecture exceptions are allowed only when they are intentional and documented.

An exception should explain:

- Which rule cannot be followed.
- Why the exception is needed.
- What risk the exception creates.
- Whether the exception is temporary or permanent.
- How the repository still protects physics correctness.

Example:

```text
Exception: This prototype keeps physics calculations and UI event handlers in app.js.
Reason: The repository is a small classroom prototype.
Risk: The file may become difficult to test as features grow.
Mitigation: Physics functions are grouped in a clearly marked section and do not access DOM or Canvas APIs.
Review date: 2026-09-01
```

---

# Review Checklist

Use this checklist during code review.

| Check | Question |
| :--- | :--- |
| Physics purity | Can physics calculations run without a browser or UI? |
| Rendering boundary | Does Canvas or UI code only display state instead of defining formulas? |
| Storage boundary | Is storage separated from learning and physics logic? |
| Formula ownership | Is each physics formula defined in one clear place? |
| Dependency direction | Do dependencies point toward the Physics Domain? |
| Duplication | Are physics calculations duplicated across adapters? |
| Exceptions | Are any boundary exceptions documented? |
| Testability | Can core physics logic be tested independently? |

---

# Compliance Relationship

Architecture compliance should be checked through `Standard-Compliance-Checklist.md`.

Repositories with the `physics-engine` profile should apply the strictest boundary checks.

Repositories with `learning-unit` or `interactive-simulation` profiles should apply the boundary checks that match their implementation size.

Repositories without production code should mark implementation-specific architecture checks as `Not applicable`.

---

# Relationship to Other Standards

Full standards index: `README.md`.

Closest companions: `Architecture.md`, `Folder-Structure.md`, `Repository-Profiles.md`, `Standard-Compliance-Checklist.md`, and `AI-Agent-Rules.md`.

This document defines how the architectural model is enforced during implementation and review.

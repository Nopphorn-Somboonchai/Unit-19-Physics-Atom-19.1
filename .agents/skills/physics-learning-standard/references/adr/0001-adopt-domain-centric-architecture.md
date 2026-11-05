# Decision 0001: Adopt Domain-Centric Architecture

Status: Accepted

Date: 2026-08-01

---

# Context

The Physics Learning Ecosystem includes learning units, simulations, shared libraries, UI components, physics engines, documentation repositories, and future educational tools.

Without a shared architecture, each repository may mix physics calculations, user interface behavior, canvas rendering, formula display, storage, and framework-specific code in different ways.

This makes repositories harder to maintain, harder to test, harder for learners to trust, and harder for AI agents to modify safely.

The most stable and valuable part of the ecosystem is the educational and scientific knowledge, not the rendering technology or user interface framework.

---

# Decision

The Physics Learning Ecosystem adopts Domain-Centric Architecture.

The Physics Domain is the center of the system.

Physics formulas, calculations, models, simulation rules, and educational logic belong in the Physics Domain.

UI, Canvas rendering, formula rendering, storage, browser APIs, and external frameworks must remain outside the Physics Domain and connect through adapters or application services.

---

# Rationale

This decision protects scientific and educational logic from unnecessary technology dependencies.

It supports:

- Clear separation between physics knowledge and presentation.
- More reusable physics logic across repositories.
- Easier testing of formulas and calculations.
- Safer AI-assisted development.
- Easier replacement of UI, Canvas, formula, or storage technologies in the future.

Technology should support the Physics Domain.

The Physics Domain should not depend on technology.

---

# Impact

Repositories should organize source code so that physics logic remains independent from rendering and browser-specific behavior.

Canvas code should visualize application state, not define physics truth.

UI code should collect input and present output, not become the source of formulas or calculations.

Shared physics logic should be extracted when multiple repositories need the same stable knowledge.

Exceptions should be documented with a clear reason.

---

# Related Standards

- `Principles.md`
- `Architecture.md`
- `Folder-Structure.md`
- `Coding-Standards.md`
- `Canvas-Guidelines.md`
- `Formula-Display.md`
- `UI-Guidelines.md`
- `AI-Agent-Rules.md`

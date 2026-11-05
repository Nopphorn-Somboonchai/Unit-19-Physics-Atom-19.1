# Canvas Guidelines

> **Canvas Implementation Guidelines for the Physics Learning Ecosystem**

This document defines the standard approach for implementing HTML Canvas within the Physics Learning ecosystem.

Its purpose is to ensure consistent rendering, maintainable code, and reusable graphics across all repositories.

This document defines implementation principles rather than Canvas API documentation.

---

# Purpose

Canvas is the primary rendering technology used for interactive physics visualizations.

A consistent implementation improves:

* Readability
* Performance
* Reusability
* Maintainability
* AI-assisted development

Every repository using Canvas should follow these guidelines.

---

# Design Principles

Canvas implementations should follow these principles:

* Separate rendering from physics logic.
* Keep rendering deterministic.
* Prefer reusable drawing functions.
* Keep rendering code independent of business logic.
* Optimize for clarity before optimization.

Canvas exists to visualize the Physics Domain—not to contain it.

---

# Rendering Responsibilities

Canvas code should be responsible for:

* Drawing objects
* Rendering animations
* Displaying graphs
* Visualizing simulations
* Handling rendering updates

Canvas code should **not** contain:

* Physics calculations
* Educational rules
* Business workflows
* Application state management

---

# Coordinate System

Use a consistent coordinate system across repositories.

Recommended practices:

* Clearly define the origin.
* Keep axis directions consistent.
* Document any coordinate transformations.
* Avoid mixing multiple coordinate systems unnecessarily.

A predictable coordinate system simplifies both development and debugging.

---

# Drawing Organization

Rendering code should be organized into small, reusable drawing functions.

Examples include:

* Draw vectors
* Draw forces
* Draw particles
* Draw axes
* Draw labels

Avoid creating large rendering functions responsible for multiple unrelated tasks.

---

# Animation

Animations should:

* Be smooth and predictable.
* Separate timing from rendering.
* Update visual state consistently.
* Stop cleanly when no longer required.

Animation timing should not contain educational logic.

Simulation behavior, numerical tolerance, and model assumptions should follow **Simulation-Standards.md**.

---

# Performance

Performance improvements should not reduce readability.

Recommended practices:

* Minimize unnecessary redraws.
* Reuse rendering calculations when practical.
* Keep rendering functions focused.
* Avoid unnecessary object creation inside rendering loops.

Optimize only after identifying real performance requirements.

Use `Performance-Standards.md` when Canvas rendering, animation loops, large
assets, or responsiveness affect the learning experience.

Canvas performance work must preserve adapter boundaries. Rendering code should
not become the source of physics truth.

---

# Reusable Components

Common rendering functionality should be extracted into reusable modules whenever practical.

Examples include:

* Grid rendering
* Coordinate axes
* Arrow drawing
* Labels
* Common shapes

Avoid duplicating rendering logic across repositories.

---

# Separation of Concerns

Canvas should only visualize application state.

Follow the dependency direction in `Architecture.md` and the adapter boundary rules in `Architecture-Enforcement.md`.

Rendering should depend on application data; application logic should never depend on rendering.

---

# Testing Considerations

Canvas code should be designed to be testable.

Prefer testing:

* Rendering calculations
* Coordinate transformations
* Drawing utilities
* Rendering state

Avoid coupling rendering logic directly to browser-specific behavior whenever possible.

---

# Relationship to Other Standards

Full standards index: `README.md`.

Closest companions: `Architecture-Enforcement.md`, `Simulation-Standards.md`,
`Performance-Standards.md`, `Formula-Display.md`, and `Accessibility.md`.

---

# Summary

Canvas is responsible for presenting educational content visually.

By keeping rendering independent from the Physics Domain, repositories remain easier to understand, easier to maintain, and more resilient to future technological changes.

Canvas should always serve the educational experience without becoming part of the educational logic itself.

# Decision 0003: Define Architecture Enforcement Rules

Status: Accepted

Date: 2026-08-01

---

# Context

The Physics Learning Ecosystem already adopted Domain-Centric Architecture.

However, architecture principles alone are not enough to guide implementation and review.

Without enforceable dependency and responsibility rules, repositories may still mix physics calculations, UI behavior, Canvas rendering, formula display, storage, and browser-specific code in ways that are hard to test and maintain.

Learning repositories may also begin as simple browser-based projects, so the ecosystem needs rules that are strict about physics correctness while still allowing small repositories to start simply.

---

# Decision

The Physics Learning Standard defines `Architecture-Enforcement.md`.

This document provides:

- Dependency direction rules.
- Layer responsibility rules.
- Forbidden dependencies for the Physics Domain.
- Adapter boundaries.
- Rules for simple browser-based repositories.
- Exception documentation rules.
- Architecture review checklist.

Architecture compliance is also added to `Standard-Compliance-Checklist.md`.

---

# Rationale

The ecosystem needs architecture rules that are clear enough for humans and AI agents to apply consistently.

The most important rule is that physics truth must remain independent from UI, Canvas, browser APIs, storage, formula rendering, and external frameworks.

Making this rule explicit reduces accidental coupling, improves testability, and helps future repositories grow beyond single-file prototypes without losing scientific correctness.

The exception process allows small classroom prototypes to exist while still documenting the risk and mitigation.

---

# Impact

Repositories with source code should review imports, dependencies, and module responsibilities against `Architecture-Enforcement.md`.

Physics engines must apply the strictest boundary rules.

Learning units and interactive simulations should apply the rules according to their repository size and profile.

Simple repositories may keep a small structure when appropriate, but they should group responsibilities clearly and document exceptions when architecture boundaries cannot be fully separated yet.

Future automation can use these rules as the basis for import or dependency checks.

---

# Related Standards

- `Architecture.md`
- `Architecture-Enforcement.md`
- `Folder-Structure.md`
- `Repository-Profiles.md`
- `Standard-Compliance-Checklist.md`
- `Coding-Standards.md`
- `Canvas-Guidelines.md`
- `Formula-Display.md`
- `UI-Guidelines.md`
- `AI-Agent-Rules.md`

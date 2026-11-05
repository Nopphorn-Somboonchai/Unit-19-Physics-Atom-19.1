# Decision 0004: Define Physics Domain Standards

Status: Accepted

Date: 2026-08-01

---

# Context

The Physics Learning Ecosystem needs standards that protect scientific correctness, not only software architecture.

Learning units, simulations, physics engines, and dynamic question systems can become inconsistent if they use different unit conventions, different notation, undocumented approximations, or hidden numerical tolerances.

The ecosystem also needs to support high-school physics learning without overcomplicating explanations or pretending that simplified models are exact real-world models.

---

# Decision

The Physics Learning Standard defines three domain-specific standards:

- `Physics-Standards.md`
- `Units-and-Notation.md`
- `Simulation-Standards.md`

These documents separate responsibilities:

- `Physics-Standards.md` defines scientific correctness, formula ownership, assumptions, constants, dynamic question principles, and reference expectations.
- `Units-and-Notation.md` defines SI unit usage, symbols, formula notation, constants notation, rounding, and bilingual terminology guidance.
- `Simulation-Standards.md` defines simulation documentation, state/rendering separation, timestep rules, numerical tolerance, randomness, input constraints, validation cases, and motion accessibility.

---

# Rationale

Physics correctness should be explicit and reviewable.

Separating these standards prevents one document from becoming too broad.

It also helps non-developer maintainers understand what to check:

- Are the physics ideas correct?
- Are the units and symbols consistent?
- Does the simulation or dynamic quiz produce reasonable results?

These rules support AI-assisted development by making physics expectations visible before code is generated or modified.

---

# Impact

Repositories that include physics content should document their physics scope, formulas, variables, units, assumptions, and limitations.

Repositories that include simulations or dynamic questions should document numerical tolerance, input constraints, randomness, and validation cases when applicable.

Physics engines should use these standards as core review criteria.

Learning repositories may use simplified constants or models when appropriate for the learning level, but approximations should be documented.

This decision does not replace existing architecture rules.

It complements them by defining what the Physics Domain should preserve.

---

# Related Standards

- `Physics-Standards.md`
- `Units-and-Notation.md`
- `Simulation-Standards.md`
- `Architecture-Enforcement.md`
- `Formula-Display.md`
- `Canvas-Guidelines.md`
- `Accessibility.md`
- `Standard-Compliance-Checklist.md`
- `AI-Agent-Rules.md`

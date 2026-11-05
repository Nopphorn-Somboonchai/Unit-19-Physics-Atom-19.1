# Simulation Standards

> Simulation, numerical validation, and dynamic question standards for the Physics Learning Ecosystem.

This document defines how repositories should design, document, and validate simulations, numerical models, randomized questions, and calculated answers.

---

# Purpose

Interactive simulations and dynamic questions should help learners understand physics.

They should be predictable, scientifically reasonable, and documented clearly enough for humans and AI agents to review.

---

# Core Rule

Simulations should visualize a documented physics model.

They should not hide undefined physics behavior inside rendering code or UI event handlers.

Physics calculations should remain separate from rendering according to `Architecture-Enforcement.md`.

---

# Simulation Model Documentation

Every simulation should document:

- Purpose
- Physics concepts
- Key formulas
- Variables and units
- Assumptions
- Limitations
- Input ranges
- Expected behavior
- Validation examples

Small simulations may document these items in `README.md`.

Larger simulations should use a dedicated document in `docs/`.

---

# State and Rendering Separation

Simulation state should be calculated separately from rendering.

Recommended separation:

```text
Physics model
    -> simulation state
    -> application coordination
    -> rendering adapter
    -> visual output
```

Canvas, SVG, DOM, or UI code should display simulation state.

Rendering code must not become the source of physics truth.

---

# Time Step Rules

Time-based simulations should document how time is updated.

Common options:

- Fixed time step
- Variable time step
- Paused/manual step
- Analytical calculation without iterative time stepping

When numerical integration is used, document the method when practical.

Examples:

- Euler method
- Semi-implicit Euler method
- Verlet method
- Runge-Kutta method

For high-school learning simulations, simpler methods are acceptable when the limitation is documented.

---

# Numerical Tolerance

Numerical validation should use tolerance when exact comparison is not appropriate.

Use one or more of:

- Absolute tolerance
- Relative tolerance
- Percentage tolerance
- Significant-figure based tolerance

Example:

```text
Expected: 10.0
Student answer: accepted if |answer - expected| <= 0.1
Tolerance type: absolute
```

Recommended defaults for learning activities:

| Situation | Suggested tolerance |
| :--- | :--- |
| Simple integer or exact conceptual answer | Exact match |
| Basic numerical answer | Absolute tolerance based on displayed rounding |
| Large or small scientific notation values | Relative tolerance |
| Experimental-style activity | Percentage tolerance |
| Multi-step randomized problem | Tolerance documented per question type |

Tolerance must be consistent between answer checking and displayed solutions.

---

# Dynamic Question Rules

Dynamic questions should calculate answers from formulas.

They must not rely on fixed hardcoded answer tables when formula-based calculation is possible.

Generated parameters should:

- Stay physically reasonable.
- Avoid division by zero.
- Avoid impossible signs or magnitudes.
- Match the documented assumptions.
- Produce answers suitable for the intended learning level.
- Include units when the answer is numerical.

If learner-specific values such as roll number are used, the rule should be documented clearly.

Use `Dynamic-Quiz-System-Rules.md` for full roll-number based quiz system rules.

Example:

```text
R = learner roll number
m = baseMass + 0.1R
Constraint: m > 0
```

---

# Randomness

Randomness should support learning, not confusion.

Randomized systems should document:

- What is randomized
- Allowed ranges
- Constraints
- Whether results are reproducible
- Whether a seed is used

Use deterministic seeds when repeatability is important for review, grading, or debugging.

---

# Input Constraints

Inputs should be constrained to values that match the model.

Examples:

- Mass should be positive.
- Absolute temperature in kelvin should not be negative.
- Length should be positive.
- Area should be positive.
- Probabilities should stay between 0 and 1.
- Angles should use documented units.

Invalid input should produce clear feedback.

---

# Validation Cases

Each simulation or calculation model should have known validation cases.

Validation cases may include:

- Simple textbook examples
- Boundary cases
- Symmetry cases
- Conservation checks
- Dimensional checks
- Expected qualitative behavior

Examples:

```text
If force is zero, acceleration should be zero for constant mass.
If pipe area decreases in ideal steady flow, speed should increase.
If spring displacement doubles, restoring force doubles within Hooke's law range.
```

---

# Units and Dimensional Checks

Calculations should preserve unit consistency.

When practical, verify dimensions during review:

```text
F = ma
kg x m/s^2 = N
```

Generated questions should not mix units silently.

Use `Units-and-Notation.md` for unit formatting and notation.

---

# Visual Accuracy

Visual output should support the documented physics model.

Visual scale may be exaggerated for learning clarity, but exaggeration should not mislead learners.

When visual scale is not physically exact, document it.

Example:

```text
Visual displacement is amplified by 20x so learners can see the motion clearly.
Numerical values remain calculated from the unscaled physics model.
```

---

# Accessibility and Motion

Animations should support learning.

When practical, simulations should provide:

- Pause
- Reset
- Replay
- Reduced motion option
- Keyboard-accessible controls
- Text or numeric explanation of important visual behavior

Never rely only on animation to communicate essential physics information.

---

# Performance and Responsiveness

Simulations should follow `Performance-Standards.md` when rendering, numerical
updates, generated values, large assets, or runtime loops affect usability.

Performance work must preserve the documented physics model.

Recommended expectations:

- Keep physics state updates separate from rendering.
- Pause or throttle simulation loops when inactive.
- Avoid unbounded generation or update loops.
- Document target responsiveness when it matters for the learning activity.
- Re-run validation cases after performance optimizations.

---

# Review Checklist

Use this checklist when reviewing simulations or dynamic questions.

| Check | Question |
| :--- | :--- |
| Model | Is the physics model documented? |
| Assumptions | Are assumptions and limitations clear? |
| State separation | Is state calculation separate from rendering? |
| Units | Are units explicit and consistent? |
| Tolerance | Is numerical tolerance documented? |
| Input range | Are generated and user inputs physically reasonable? |
| Randomness | Is randomness constrained and documented? |
| Validation cases | Are known cases or expected behaviors checked? |
| Visual clarity | Does the visual output support the physics model? |
| Performance | Do update loops, rendering, generated values, and assets remain responsive on supported devices? |
| Accessibility | Can learners understand the concept without relying only on motion? |

---

# Relationship to Other Standards

Full standards index: `README.md`.

Closest companions: `Physics-Standards.md`, `Units-and-Notation.md`,
`Dynamic-Quiz-System-Rules.md`, `Canvas-Guidelines.md`,
`Performance-Standards.md`, and `Accessibility.md`.

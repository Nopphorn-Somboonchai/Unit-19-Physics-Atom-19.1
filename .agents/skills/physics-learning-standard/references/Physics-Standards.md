# Physics Standards

> Scientific correctness standards for the Physics Learning Ecosystem.

This document defines how repositories should handle physics concepts, formulas, assumptions, constants, examples, and references.

---

# Purpose

Physics learning software must be educationally clear and scientifically reliable.

This document helps maintainers, contributors, and AI agents protect physics correctness across learning units, simulations, shared libraries, physics engines, and educational tools.

---

# Core Rule

Physics correctness is a primary quality requirement.

When there is a trade-off between visual style, implementation convenience, and scientific correctness, scientific correctness takes priority.

Learning clarity should never require incorrect physics.

---

# Source of Physics Truth

Physics formulas, constants, models, and validation logic should be defined in the Physics Domain.

They should not be hidden inside:

- UI event handlers
- Canvas rendering code
- Formula rendering code
- Storage code
- Styling code
- Hardcoded answer tables

Use `Architecture-Enforcement.md` to review implementation boundaries.

---

# Physics Scope

Each learning repository should document its physics scope.

The scope should include:

- Covered concepts
- Key formulas
- Variables and units
- Assumptions
- Limitations
- Learning level or audience when applicable
- References or source alignment when applicable

Do not expand physics scope without updating documentation.

Do not include advanced or unrelated concepts unless they support the learning objective.

---

# Formula Correctness

Formulas should be:

- Scientifically correct
- Written using consistent notation
- Explained in context
- Connected to variables and units
- Used consistently across examples, simulations, quizzes, and explanations

When a formula is simplified for learning, the simplification should be documented.

Example:

```text
Assumption: Air resistance is ignored.
Reason: The activity focuses on ideal projectile motion.
Limitation: The result is not accurate for high-speed or large-area objects in air.
```

---

# Constants

Physics constants should be centralized when used in code.

Constants should include:

- Symbol
- Name
- Numerical value
- Unit
- Source
- Approximation level, when rounded

Use current internationally recommended constants when precision matters.

For learning activities, rounded constants may be used when they improve clarity, but the approximation should be documented.

Example:

```text
g = 10 m/s^2
Use case: High-school mechanics classroom problems.
Approximation: Learning approximation near Earth's surface.
Precision note: Use a documented precision value when precision matters.
```

---

# Units

Physics calculations should use SI units unless a documented educational reason requires otherwise.

Unit conversion should be explicit.

Do not silently mix units.

Use `Units-and-Notation.md` for unit formatting, SI notation, and symbol guidance.

---

# Assumptions and Limitations

Every simulation, calculation model, or dynamic problem generator should document assumptions and limitations.

Examples:

- Ideal fluid
- Frictionless surface
- Point mass
- Uniform gravitational field
- Small-angle approximation
- Constant acceleration
- No air resistance
- Rigid body approximation

Assumptions should be visible in documentation and, when educationally helpful, visible in the learning interface.

---

# Numerical Correctness

Numerical results should be checked for:

- Correct formula use
- Correct unit conversion
- Reasonable magnitude
- Appropriate significant figures or rounding
- Documented tolerance for approximate answers
- Edge cases and invalid inputs

Use `Simulation-Standards.md` for tolerance and numerical validation rules.

Use `Dynamic-Quiz-System-Rules.md` when dynamic quizzes use roll numbers, randomized parameters, or on-the-fly validation.

---

# Dynamic Questions

Dynamic questions must calculate answers from formulas.

They must not rely on fixed hardcoded final answers when formulas can compute the answer.

Generated values should remain physically reasonable.

Invalid or misleading generated cases should be avoided.

Examples of invalid generated cases:

- Negative mass
- Negative absolute temperature in kelvin
- Division by zero
- Impossible geometry
- Speeds beyond the intended model range
- Values that contradict documented assumptions

---

# Educational Alignment

Physics content should match the intended learning level.

For high-school learning repositories, explanations should avoid unnecessary mathematical complexity unless it is part of the learning objective.

When a repository references a textbook, curriculum, or external educational source, the reference should be identified clearly.

Third-party content must not be incorrectly relicensed.

---

# Review Checklist

Use this checklist when reviewing physics content.

| Check | Question |
| :--- | :--- |
| Scope | Is the physics scope documented? |
| Formula correctness | Are formulas correct and consistently used? |
| Units | Are units explicit and consistent? |
| Constants | Are constants centralized or clearly documented? |
| Assumptions | Are assumptions and limitations documented? |
| Numerical behavior | Are calculated values reasonable? |
| Dynamic questions | Are answers calculated from formulas? |
| References | Are sources or curriculum references clear? |
| Architecture | Is physics truth kept out of UI, Canvas, storage, and rendering code? |

---

# Recommended References

Use authoritative references when documenting standards-level physics rules.

Recommended references:

- BIPM SI Brochure for SI units: https://www.bipm.org/en/publications/si-brochure
- NIST CODATA values for fundamental physical constants: https://physics.nist.gov/constants

Repositories may also cite textbooks, curricula, and local teaching materials when they are used for learning alignment.

---

# Relationship to Other Standards

Full standards index: `README.md`.

Closest companions: `Units-and-Notation.md`, `Simulation-Standards.md`, `Dynamic-Quiz-System-Rules.md`, and `Architecture-Enforcement.md`.

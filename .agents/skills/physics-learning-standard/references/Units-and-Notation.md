# Units and Notation

> Unit, symbol, and notation standards for the Physics Learning Ecosystem.

This document defines how repositories should write units, variables, constants, formulas, and numerical values.

---

# Purpose

Consistent units and notation reduce learner confusion and prevent calculation errors.

Physics repositories should present the same concept with the same notation whenever practical.

---

# Primary Unit System

The International System of Units (SI) is the default unit system.

Physics calculations should use SI units unless a documented educational reason requires otherwise.

When non-SI units are used, the repository should explain:

- Why the non-SI unit is used.
- How it converts to SI.
- Whether calculations internally use SI.

---

# SI Base Units

Use these SI base units unless a documented exception applies.

| Quantity | SI unit | Symbol |
| :--- | :--- | :--- |
| Length | metre | m |
| Mass | kilogram | kg |
| Time | second | s |
| Electric current | ampere | A |
| Thermodynamic temperature | kelvin | K |
| Amount of substance | mole | mol |
| Luminous intensity | candela | cd |

---

# Common Derived Units

Use standard SI derived units for common physics quantities.

| Quantity | Unit | Symbol | Equivalent |
| :--- | :--- | :--- | :--- |
| Force | newton | N | kg m s^-2 |
| Energy | joule | J | kg m^2 s^-2 |
| Power | watt | W | kg m^2 s^-3 |
| Pressure | pascal | Pa | kg m^-1 s^-2 |
| Charge | coulomb | C | A s |
| Potential difference | volt | V | kg m^2 s^-3 A^-1 |
| Resistance | ohm | ohm | kg m^2 s^-3 A^-2 |
| Frequency | hertz | Hz | s^-1 |

When plain text cannot display special symbols reliably, write `ohm` instead of `Ω`.

---

# Unit Formatting

Use a space between numbers and units.

```text
Good: 12 m
Avoid: 12m
```

Use exponent notation consistently.

```text
Good: m/s^2
Good: m s^-2
Avoid: mps2
```

Use SI prefixes carefully.

```text
1 km = 1000 m
1 cm = 0.01 m
1 ms = 0.001 s
```

Do not mix unit systems silently.

---

# Variable Notation

Use internationally recognizable physics notation whenever practical.

| Symbol | Meaning | Common unit |
| :--- | :--- | :--- |
| t | time | s |
| x | position | m |
| s | displacement or distance, depending on context | m |
| v | velocity or speed | m/s |
| a | acceleration | m/s^2 |
| F | force | N |
| m | mass | kg |
| p | momentum or pressure, depending on context | kg m/s or Pa |
| E | energy or electric field, depending on context | J or N/C |
| P | power or pressure, depending on context | W or Pa |
| W | work | J |
| Q | heat or charge, depending on context | J or C |
| q | electric charge | C |
| V | electric potential or volume, depending on context | V or m^3 |
| I | electric current | A |
| R | resistance | ohm |
| rho | density | kg/m^3 |
| mu | coefficient of friction or dynamic viscosity, depending on context | dimensionless or Pa s |
| theta | angle | rad or degree |

Some symbols have multiple meanings across physics topics.

When a symbol is ambiguous, define it near first use.

---

# Formula Notation

Formulas should be written consistently across README files, explanations, simulations, quizzes, and source code comments.

Each important formula should identify:

- Formula
- Quantity being calculated
- Variable meanings
- Units
- Assumptions or limitations

Example:

```text
F = ma

F = net force (N)
m = mass (kg)
a = acceleration (m/s^2)
Assumption: Mass is constant.
```

---

# Constants

Constants should be written with clear source and approximation level.

Examples:

| Symbol | Meaning | Recommended learning value | Unit | Notes |
| :--- | :--- | :--- | :--- | :--- |
| g | Gravitational acceleration near Earth's surface | 10 | m/s^2 | Default high-school learning approximation |
| c | Speed of light in vacuum | 299792458 | m/s | Exact in SI |
| e | Elementary charge | 1.602176634 x 10^-19 | C | Exact in SI |

When precision matters, use current CODATA recommended values.

When learning clarity matters, rounded values may be used if the approximation is documented.

For high-school mechanics learning activities in this ecosystem, use `g = 10 m/s^2` as the default learning approximation near Earth's surface unless the repository documents a precision-focused reason to use a different value.

---

# Angles

Radians should be used for calculations unless the learning context uses degrees.

If degrees are used, clearly label them.

Trigonometric calculations should document whether angle input is in degrees or radians.

---

# Rounding and Significant Figures

Rounding should match the educational context.

For high-school learning units:

- Show enough digits to avoid misleading learners.
- Avoid excessive precision when input data is approximate.
- Use consistent rounding between question generation, validation, and solution display.

If exact answer checking is not appropriate, use tolerance rules from `Simulation-Standards.md`.

---

# Thai and English Text

Thai explanations may use Thai terms with English terms in parentheses when helpful.

Example:

```text
แรง (Force)
พลังงานจลน์ (Kinetic Energy)
โมเมนตัม (Momentum)
```

Do not switch notation for the same concept without a clear reason.

Use `Internationalization-and-Localization.md` for full Thai-English language,
bilingual label, locale formatting, and UTF-8 encoding guidance.

---

# Reference Sources

Authoritative unit references:

- BIPM SI Brochure: https://www.bipm.org/en/publications/si-brochure
- NIST Constants, Units, and Uncertainty: https://physics.nist.gov/cuu/

---

# Relationship to Other Standards

Full standards index: `README.md`.

Closest companions: `Physics-Standards.md`, `Formula-Display.md`,
`Simulation-Standards.md`, `Dynamic-Quiz-System-Rules.md`, and
`Internationalization-and-Localization.md`.

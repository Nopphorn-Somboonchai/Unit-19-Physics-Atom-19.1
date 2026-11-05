# Naming Conventions

> **Naming Conventions for the Physics Learning Ecosystem**

This document defines the naming conventions adopted by repositories within the Physics Learning ecosystem.

Consistent naming improves readability, maintainability, discoverability, and AI-assisted development.

These conventions apply to all repositories unless a specific standard explicitly defines otherwise.

---

# Purpose

Names should communicate intent clearly.

A well-chosen name reduces ambiguity, improves code navigation, and makes the codebase easier to understand for both developers and AI agents.

Consistency is preferred over personal preference.

---

# General Principles

Names should be:

* Clear
* Descriptive
* Consistent
* Predictable
* Concise

Avoid abbreviations unless they are universally recognized.

Examples:

```text
Good

calculateForce
renderCanvas
physicsConstants

Avoid

calcF
doThing
tempData
misc
```

---

# Repository Names

Repository names should:

* Use lowercase letters.
* Separate words with hyphens (`-`).
* Describe the repository's primary purpose.

Examples:

```text
physics-learning-standard
physics-unit-01
physics-shared-components
```

---

# Folder Names

Folder names should:

* Use lowercase letters.
* Use kebab-case when multiple words are required.
* Describe responsibility rather than implementation.

Examples:

```text
shared
application
physics
canvas-adapter
```

Avoid generic names such as:

```text
misc
temp
new
test2
```

---

# File Names

File names should:

* Use descriptive names.
* Use kebab-case for multiple words.
* Reflect the primary responsibility of the file.

Examples:

```text
vector-calculator.js
motion-simulator.js
canvas-renderer.js
```

---

# Variables

Variable names should:

* Use camelCase.
* Describe the value they represent.
* Avoid unnecessary abbreviations.

Examples:

```javascript
const gravitationalForce
const simulationTime
const currentVelocity
```

---

# Constants

Constants should:

* Use UPPER_SNAKE_CASE.
* Represent values that do not change.

Examples:

```javascript
const GRAVITY
const MAX_ITERATIONS
const DEFAULT_CANVAS_WIDTH
```

---

# Functions

Function names should:

* Use camelCase.
* Begin with a verb.
* Clearly describe the action performed.

Examples:

```javascript
calculateForce()
renderScene()
updatePosition()
loadSimulation()
```

Avoid vague names such as:

```javascript
doWork()
process()
handleStuff()
```

---

# Classes

Class names should:

* Use PascalCase.
* Represent a noun or concept.

Examples:

```javascript
Vector
ForceCalculator
MotionSimulator
CanvasRenderer
```

---

# Boolean Values

Boolean variables should clearly express a true/false state.

Prefer prefixes such as:

* is
* has
* can
* should

Examples:

```javascript
isVisible
hasCollision
canRender
shouldUpdate
```

---

# Event Names

Event names should describe what happened.

Examples:

```text
simulationStarted
objectMoved
formulaUpdated
animationCompleted
```

Use past-tense or completed-action wording where appropriate.

---

# Avoid Ambiguous Names

Avoid names that do not communicate intent.

Examples:

```text
data
info
value
temp
object
manager
helper
```

Choose names that describe the actual responsibility instead.

---

# Consistency Rules

When a naming pattern has been established, continue using it throughout the repository.

Avoid introducing alternative names for the same concept.

For example, do not mix:

```text
calculateForce
computeForce
getForce
```

Choose one convention and use it consistently.

---

# Relationship to Other Standards

Full standards index: `README.md`.

Closest companions: `Folder-Structure.md`, `Coding-Standards.md`, and `Architecture-Enforcement.md`.

---

# Summary

Consistent naming is one of the simplest ways to improve software quality.

Well-chosen names reduce cognitive load, simplify navigation, and help both developers and AI agents understand the purpose of the code without unnecessary explanation.

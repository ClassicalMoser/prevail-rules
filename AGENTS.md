# Agents

Never start work until you have read ALL of the linked documents COMPLETELY. Follow them strictly. Failure to do so will terminate session.

## The point of this project

This is a rules engine for a board game, and the goal of the whole codebase is that it holds the meaning of that game readably. A reader who knows Prevail but has never seen this code should be able to follow why a module exists and what rule it serves. That is not a phase of the work or a standard to reach later; it is what the code is for, and it governs every change you make to it.

[`README.md`](./README.md) is the register to write in — "your hand represents your army's will to fight; when it's gone, the battle is over" — not the chain of states a lookup passes through.

Models rarely comment enough, and never do without prompting. [`STYLE.md`](./STYLE.md) says what a comment must carry and what a test must state. Read it before writing either.

- [`README.md`](./README.md) – Background and intent for the project
- [`STYLE.md`](./STYLE.md) — Rules for how code is written
- [`DESIGN.md`](./DESIGN.md) — Rules for how code is organized
- [`src/domain/ENGINES.md`](./src/domain/ENGINES.md) — Clear description of how the domain code works
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Rules for workflows
- [`LAYERS.md`](./LAYERS.md) — Documentation of this project's structure
- [`boundaries.ts`](./boundaries.ts) — Enforced dependency directions
- [`src/domain/entities/README.md`](./src/domain/entities/README.md) — Intro to domain docs
- [`AUDIT_PROCESS.md`](./AUDIT_PROCESS.md) — Rules for running an audit
- [`src/domain/AUDIT.md`](./src/domain/AUDIT.md) — Main WIP at the moment
- [`ASSESSMENT-2026-11-10.md`](./ASSESSMENT-2026-11-10.md) – Current open findings from first scout and subsequent mitigation work
- [`RULEBOOK.md`](./RULEBOOK.md) — The design intent the engine must match. The appendix records where the code still differs.

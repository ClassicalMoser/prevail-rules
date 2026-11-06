# Agents

Read the human docs and follow them. Value rigor and clarity over brevity. Be explicit. ALWAYS follow the [`STYLE.md`](./STYLE.md) guide when producing any code.

In particular, models rarely comment enough, and never do without prompting. Every step of a function should have a comment clarifying why it is there. Readability is more important than optimization.

Alignment quality tracks comment density only when the comments say something, and the thing they must say is gameplay meaning: what happens in the game, and why the rules want it. `// Lower initiative value wins` earns its line; `// Get the adjacent spaces` above a call to `getAdjacentSpaces` does not. Read [`STYLE.md`](./STYLE.md) on commentary before writing any, and match the examples there. Judge only what you are about to write: commentary already in the file is authored, and you do not rewrite or remove it.

Padding a body to raise a number is a failure, not a fix. But the remedy for a weak comment is a better one, not a deleted one: nearly every step here serves a rule, so if you cannot name the rule, leave a `TODO` mark saying what you could not state rather than leaving the step bare.

Before you commit, `pnpm validate` must pass: lint, formatting, types, and the self-proof check that no spec reaches its own subject. A pre-commit hook runs it. `pnpm check:commentary` reports in-body commentary density per layer. It cannot fail, and it is not a target to hit: padding a body raises the number and breaks the rule above.

- [`README.md`](./README.md) – Background and intent for the project
- [`STYLE.md`](./STYLE.md) — Rules for how code is written
- [`DESIGN.md`](./DESIGN.md) — Rules for how code is organized
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Rules for workflows
- [`LAYERS.md`](./LAYERS.md) — Documentation of this project's structure
- [`boundaries.ts`](./boundaries.ts) — Enforced dependency directions
- [`src/domain/entities/README.md`](./src/domain/entities/README.md) — Intro to domain docs
- [`AUDIT_PROCESS.md`](./AUDIT_PROCESS.md) — Rules for running an audit
- [`src/domain/AUDIT.md`](./src/domain/AUDIT.md) — Main WIP at the moment

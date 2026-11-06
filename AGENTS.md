# Agents

Read the human docs and follow them. Value rigor and clarity over brevity. Be explicit. ALWAYS follow the [`STYLE.md`](./STYLE.md) guide when producing any code.

In particular, models rarely comment enough, and never do without prompting. Every step of a function should have a comment clarifying why it is there. Readability is more important than optimization.

Alignment quality tracks comment density only when the comments say something. A comment that restates the code, labels the obvious, or holds a place for a real one later is worse than none: read [`STYLE.md`](./STYLE.md) on this before writing any. Padding a body to raise a number is a failure, not a fix. If a step has nothing worth saying, leave it bare.

Before you commit, `pnpm validate` must pass: lint, formatting, types, and the self-proof check that no spec reaches its own subject. A pre-commit hook runs it. `pnpm check:commentary` reports in-body commentary density per layer and fails if a layer drops below where it already was — it does not gate on the 25% standard, because nothing is there yet.

- [`README.md`](./README.md) – Background and intent for the project
- [`STYLE.md`](./STYLE.md) — Rules for how code is written
- [`DESIGN.md`](./DESIGN.md) — Rules for how code is organized
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Rules for workflows
- [`LAYERS.md`](./LAYERS.md) — Documentation of this project's structure
- [`boundaries.ts`](./boundaries.ts) — Enforced dependency directions
- [`src/domain/entities/README.md`](./src/domain/entities/README.md) — Intro to domain docs
- [`AUDIT_PROCESS.md`](./AUDIT_PROCESS.md) — Rules for running an audit
- [`src/domain/AUDIT.md`](./src/domain/AUDIT.md) — Main WIP at the moment

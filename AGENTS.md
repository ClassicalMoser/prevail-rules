# Agents

Read the human docs and follow them. Value rigor and clarity over brevity. Be explicit. ALWAYS follow the [`STYLE.md`](./STYLE.md) guide when producing any code.

## The point of this project

This is a rules engine for a board game, and the goal of the whole codebase is that it holds the meaning of that game readably. A reader who knows Prevail but has never seen this code should be able to follow why a module exists and what rule it serves. That is not a phase of the work or a standard to reach later; it is what the code is for, and it governs every change you make to it.

So the test of any module is whether its gameplay reason is on the page. [`README.md`](./README.md) is the register to write in — "your hand represents your army's will to fight; when it's gone, the battle is over" — not the chain of states a lookup passes through.

Models rarely comment enough, and never do without prompting. Readability is more important than optimization. But density only counts when the comments say something, and the thing they must say is what happens in the game and why the rules want it. Where a step encodes a rule, name the rule. Where no rule is at stake the step still has an intended purpose and use, and that is what you write; a label naming the operation is not enough. Every step has a reason, and only some reasons are rules. A module's meaning also includes who calls it and what they do with the answer, so reading the call sites is part of reading the module. Read [`STYLE.md`](./STYLE.md) on commentary and on tests before writing any. Judge only what you are about to write: commentary already in the file is authored, and you do not rewrite or remove it.

Padding a body to raise a number is a failure, not a fix. But the remedy for a weak comment is a better one, not a deleted one: nearly every step here serves a rule. If you're struggling to place the rule, check call sites. If you can't answer it at all, leave a `TODO`.

## Two practices that make that happen

Both are required, on every change, not only during an audit.

**Write the comment before the code.** For each step, state the gameplay reason first, then write or change the code so it matches that reason. Done the other way round, the comment describes the code you just wrote, which is how `// Get the adjacent spaces` gets written. Done this way, a step you cannot introduce has no reason to exist, and a comment that stops matching its check is visible immediately.

**State the gameplay meaning before you call a file done.** For each file you finish, say which rule of the game each commented step serves. Not a summary of the module — the rule, per step, in the game's terms. Any step whose rule you cannot name gets a `TODO` saying what you could not state. If you find yourself writing the same sentence for every step, or writing the function's name back, the commentary is not carrying meaning yet and the file is not done.

Both practices apply to a spec before its first case. Name the fact and the real slot that fact needs, then write the case. The spec beside it is not the pattern. A passing run does not finish the file.

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

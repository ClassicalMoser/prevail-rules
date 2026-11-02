# Audit process

An audit brings code back in line with the standards in this repo. It can run on any directory, or on a diff.

The machine audit fixes what is obviously wrong. It brings up what needs human judgment and improvement. It stands alone.

The human read follows only when the audit calls for one. An audit that requires it says so in its tracker.

## Criteria

- [`STYLE.md`](./STYLE.md) — functions, files, commentary, tests
- [`DESIGN.md`](./DESIGN.md) — pure functions, immutability, events
- [`LAYERS.md`](./LAYERS.md) — what each layer is for
- [`boundaries.ts`](./boundaries.ts) — which package may import which

Package notes live in each package README when present. Those docs own the rules. This one owns the workflow.

## Machine audit

### Before starting

- Work on a branch, from a clean tree.
- Take one scope at a time: a directory or a diff.
- Run `pnpm test` and `pnpm validate`. Record any failure that already exists.

### What it may change freely

Commentary. Add what a reader needs. Do not remove or shorten an existing comment unless it is wrong. A comment must match the check the code makes.

Tests have some leeway. Rewrite a spec when the result is clearer or more accurate. Pin an assertion to a value the test passes in. Compose factories and transforms instead of building the same shell by hand. Make the title the fact. Do not drop a case or merge two facts without listing it in the report.

### What it may change without changing behavior

- Split a file so that it has one primary export. Each spec moves with its function.
- Name an intermediate. `return` stands on its own line and returns that name.
- Move a predicate to the layer that owns it, as `LAYERS.md` describes.
- Do not refile a directory onto a different axis.

### What it may fix

A fix is allowed when the code is obviously wrong. That means all of these hold:

- The code contradicts its own comment, its type, or a test, or a rule in the docs.
- The right behavior is not in question.
- The fix is small, and it does not change any game rule.

A fix gets a failing spec first, and its own commit.

### What it leaves alone

Anything that fails that test goes in the report and stays in the code:

- A possible bug that could be a design decision.
- Any change to a game rule.
- Any change to a thrown message, a branch, a call order, or a return value that is not an allowed fix.
- Replacing an ad-hoc definition with a shared helper. See duplication, below.

### Duplication

Queries and transforms are meant to compose. An ad-hoc walk or change that repeats a shared helper is a finding.

Search the whole package for the helper. Do not rely on the names in scope. Report the duplicate and do not replace it. Two definitions can look the same and differ on `'miss'`, `'pending'`, or whether they throw.

### Commits

One kind per commit, in this order where they apply:

1. Refiling and splits
2. Commentary
3. Specs
4. Fixes, one per commit

A behavior change has nowhere to hide in a comments-only commit.

### Before finishing

Run `pnpm test` on the whole repo, not only the scope. Run `pnpm validate`. A failure that was not there at the start is the audit's to explain.

If a rewritten spec fails, stop. Name the assertion and the value it now provides. Do not change production code to make it pass unless that is an allowed fix.

### Report

The diff comes with a report. Keep each section, and write "None" when it is empty.

- **Fixes made:** what was wrong, and how you know.
- **Suspected bugs:** file, what looks wrong, and the state that would show it.
- **Duplication:** the definition, the helper that may replace it, and any behavioral difference. Write "none found" only after comparing them.
- **Needs human judgment:** surprising branches, design questions, and names that mislead.
- **Spec changes to check:** any case dropped, merged, or aimed at a different rule.
- **Test results:** failures at the start and at the end.

## Human read

Read the report first. Then read the commits in order.

Read the scope for what it does. Change it only where the implementation is wrong. Decide each duplication entry and each suspected bug.

A production hunk that the audit was not allowed to make is reverted before the read.

Set a time limit for a file that will not open. When it runs out, write the specific question you cannot answer in the tracker's stuck list, and move on. A stuck question closes as a comment, a fix, or a known hard spot.

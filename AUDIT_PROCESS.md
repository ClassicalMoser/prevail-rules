# Audit process

An audit brings code back in line with the standards in this repo. It runs on one
scope at a time, on the same branch, one scope ahead of the human read.

The read is for comprehension: the author understands the scope well enough to
change it unaided. The scout pass exists to make that reading cheap. Everything
below serves that, and a step that does not is noise.

The machine scouts. It makes the scope readable, fixes what is obviously wrong, and
leaves what it must not touch marked where it stands.

## Criteria

- [`STYLE.md`](./STYLE.md) — functions, files, commentary, tests
- [`DESIGN.md`](./DESIGN.md) — pure functions, immutability, events
- [`LAYERS.md`](./LAYERS.md) — what each layer is for
- [`boundaries.ts`](./boundaries.ts) — which package may import which

Package notes live in each package README when present. Those docs own the rules.
This one owns the workflow.

## Scope order

Dependency order. A module is read after what it imports; comprehension does not
run downhill.

Two things to check before opening a scope:

- Do the module names describe gameplay, or state access? `queries/sequencing` was
  the latter and took six weeks: thirty-six modules whose only statable reason was
  a path through a type. Where a scope looks like that, expect its useful output to
  be a design finding rather than comprehension, and mark it rather than grinding.
- How many local helpers are defined in more than one of its specs? Specs that
  share no vocabulary give no second reading cheaper than the first.

## The scout pass

### Before starting

- Take one scope: a directory, or a diff.
- Record `pnpm test` and `pnpm validate` at the start. A failure already there is
  not the audit's.
- Commit before the read reaches the scope. The read is of history, not of a
  working tree.

### Commentary

Commentary is the point of the pass.

**Never overwrite.** An existing comment is an authored definition of meaning.
Do not remove it, shorten it, or rewrite it. Where it looks wrong, leave it and
mark it.

Where a comment is missing, write one. It will be clarified later; absent is worse
than approximate.

Function JSDoc is the practice here and the IDE reads it; keep writing it. Only 6%
of modules carry a block above the imports, and that is not a gap to fill.

What is thin is in-body commentary: 5,216 lines of JSDoc against 764 lines inside
functions. Add the line that says why the check is there.

A comment has to be legible to someone who does not know this code. Simple, and
about what is happening. Not a reference chain — `Navigates: MeleeResolutionState
-> AttackApplyState -> RetreatState` is accurate and tells a reader nothing.

A comment must match the check the code makes.

### Marks

Anything the pass must not change itself is marked where it stands:

- `TODO(wrong)` — looks incorrect, and the right behaviour is in question
- `TODO(misleading)` — a name, comment, or title that says the wrong thing
- `TODO(composition)` — duplication, a predicate in the wrong layer, a shape that
  repeats

A mark names what is wrong and what would settle it. Marks are the report: they
sit where the work is, so a reader checks one by glancing rather than navigating.

Marks left in a scope are the simplest signal that it is still open. It is a
marker and not a verdict — a mark can outlive a read because you decided to leave
it.

### What it may change

**Tests.** A spec needs config, and the config should be simple to read. Build it
from the shared helpers rather than by hand, and the spec stays about its
assertions.

The helpers exist and are substantially unused. `createGameState` with a
`UnitPlacementSpec` list appears in 8 specs, while 58 place units through
`addUnitToBoard` and 39 write a placement literal. 57 specs hand-build a phase
state that `createCleanupPhaseState` and its siblings already build. 50 lines
assign into state directly, which `DESIGN.md` rules out and `updateCardState` and
the transforms exist to avoid.

So: compose setup from factories, transforms and `@testing`. Extract a fixture used
by a second suite. Delete a duplicate helper. Rewrite a title that states no fact.
Much of this suite was machine-written and readable tests are the point, so the
pass has real latitude here.

Consistency is part of it. Specs that build the same state the same way make the
second one cheaper to read than the first; specs that each invent their own setup
give no reading that carries.

A spec the author can assess at a glance is the goal, and it is also how the author
checks the pass's own work cheaply.

The never-overwrite rule still holds. A spec that reads as authored — a title that
states a real fact, a comment explaining why a case exists, a deliberate value —
gets marked, not rewritten. List any case dropped or merged.

**Structure, without changing behaviour.**

- Split a file so that it has one primary export. Each spec moves with it.
- Name an intermediate. `return` stands on its own line and returns that name.
- Move a predicate to the layer that owns it, as `LAYERS.md` describes.
- Do not refile a directory onto a different axis.

### What it may fix

A fix is allowed when the code is obviously wrong. All of these hold:

- The code contradicts its own comment, its type, or a test, or a rule in the docs.
- The right behaviour is not in question.
- The fix is small, and it does not change any game rule.

A fix gets a failing spec first, and its own commit.

### What it leaves alone

Any change to a game rule. Any change to a thrown message, a branch, a call order,
or a return value that is not an allowed fix. A possible bug that could be a design
decision. Replacing an ad-hoc definition in production code with a shared helper.

Those get a mark, not a change.

### Duplication

Queries and transforms are meant to compose. An ad-hoc walk or change that repeats
a shared helper is a finding.

Search the whole package for the helper. Do not rely on the names in scope. Mark
the duplicate in production code and do not replace it. Two definitions can look
the same and differ on `'miss'`, `'pending'`, or whether they throw — say which
ones you compared and how.

Duplicated test helpers are the exception. Those are extracted, not marked.

### Commits

One kind per commit, in this order where they apply:

1. Refiling and splits
2. Commentary and marks
3. Specs
4. Fixes, one per commit

The split is the read's interface, not bookkeeping. A commentary commit should read
in a minute; a fix commit gets full attention. A behaviour change has nowhere to
hide in a commentary commit, and a production hunk inside one is a diff error, not
a judgement call.

### Before finishing

Run `pnpm test` and `pnpm validate` on the whole repo, not only the scope. A
failure that was not there at the start is the audit's to explain.

If a rewritten spec fails, stop. Name the assertion and the value it now provides.
Do not change production code to make it pass unless that is an allowed fix.

## The human read

Read the commits in order.

Read the scope for what it does. Then write the line the machine could not: why the
module exists, in terms a reader outside this code would follow.

The finding is a module whose reason you cannot state simply, or whose only
statable reason is a path through another type. Say that in place of the reason.

A module with a header and no reason is a module to come back to. Treat it as a
marker, not a verdict: a reason can be missing because nothing needed saying.

Decide each mark. A mark closes as a fix, a comment worth keeping, or a deletion.

Change production code only where the implementation is wrong.

Set a time limit for a file that will not open. When it runs out, write the specific
question you cannot answer in the stuck list, and move on. A stuck question closes
as a comment, a fix, or a known hard spot. An empty stuck list after a slow scope is
a symptom, not a clean bill.

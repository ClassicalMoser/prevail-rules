# Audit process

An audit brings code back in line with the standards in this repo. It runs on one
scope at a time, on the same branch, one scope ahead of the human read.

The machine scouts. It makes the scope readable, fixes what is obviously wrong, and
leaves everything else marked where it stands. The read follows behind and closes
the scope.

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

Headers across most of this repo are sufficient or longer than they need to be, so
the pass does not add `@param` or `@returns` where they are missing. Add the line
inside the function that says why the check is there instead. In-body commentary is
what is thin, and it is what a reader needs.

Some packages are thin on both — `@validation` carries 8% commentary against 14–26%
elsewhere. There, a missing header is worth writing too.

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

**Tests.** Extract a fixture used by a second suite into `@testing`. Delete a
duplicate helper. Rewrite a title that states no fact. Compose factories and
transforms instead of building the same shell by hand. Much of this suite was
machine-written and readable tests are the point, so the pass has real latitude
here.

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
module exists. For a query or a transform that reason is usually about play; for a
sentinel, a factory, or anything in `@application` it is about keeping the code
honest, and that is a complete answer.

The finding is a module whose reason you cannot state at all, or whose only
statable reason is the shape of another type. Say that in place of the reason.

A module with a header and no reason is a module to come back to. Treat it as a
marker, not a verdict: a reason can be missing because nothing needed saying.

Decide each mark. A mark closes as a fix, a comment worth keeping, or a deletion.

Change production code only where the implementation is wrong.

Set a time limit for a file that will not open. When it runs out, write the specific
question you cannot answer in the stuck list, and move on. A stuck question closes
as a comment, a fix, or a known hard spot. An empty stuck list after a slow scope is
a symptom, not a clean bill.

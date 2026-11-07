# Handoff — audit scout pass

**State:** `main` at `b1e0ad5`, one commit ahead of `origin/main`. 358 spec
files, 1,894 tests, green in 12s. `pnpm validate` clean — lint, format,
typecheck and the self-proof check.

This is the scout pass of [`AUDIT_PROCESS.md`](./AUDIT_PROCESS.md), run at the
size the repo turned out to need. It is not a new phase and it is not a narrower
one: **everything the scout pass already expects stays in scope.** Earlier drafts
of this file cut it down to a test-readability pass, which dropped refiling,
splits, index work and the whole source track. Those are back.

## The point

This is a game. Every module should make gameplay sense, or at least be
traceable to it without difficulty. That is the standard the whole pass serves,
and a change that does not serve it is noise.

`AUDIT_PROCESS.md` puts it as the read being for comprehension — the author
understands a scope well enough to change it unaided — and the scout pass
existing to make that reading cheap.

## The two invariants

- **Source behaviour does not change.** Not a thrown message, not a branch, not
  a call order, not a return value. The one exception is the narrow fix rule in
  track 4.
- **Test expectations do not change.** Setup gets rebuilt; an assertion keeps
  its meaning. An expected value stays a literal, because one built from the
  same fixture as its setup agrees with the fixture instead of checking the code.

Everything below happens inside those two.

## Four tracks, applied per file

1. Refiling and splits
2. Source commentary and marks
3. Specs
4. Fixes

**Work a directory; approve a file.** The scope you take on is a directory, in
the order below. The gate is per file: a file is done when all four tracks are
done on it, commentary included, and checked against `STYLE.md` — and you do
that check yourself, before moving to the next file, rather than leaving every
judgment to the read that follows. Say per file what you checked and what you
could not resolve.

That is harder than it looks, and it is what `3845d55` missed. A file left
half-converted is not partial progress: it has to be opened again from scratch
by whoever touches it next, and nothing can be said about it until then. Of the
90 files that commit touched, 74 are in that state and 16 are finished.
Finishing 16 files is worth more than advancing 90.

**Self-approval is not self-certification.** Checking a file against the style
guide means reading what you wrote as a reader would, not asserting that you
followed the rules. The commentary clause is the one that needs it: every
comment has to name something that happens in the game, and a comment you
cannot defend that way is one to rewrite or drop before the file is called
done.

**Commits stay small, one kind each.** `AUDIT_PROCESS.md` sets the order, and
small commits are worth keeping for their own sake: each one is a thing that can
be understood, reverted or bisected on its own. The hard rule inside it is that
a behaviour change never rides along in a mechanical commit — a production hunk
inside a commentary or formatting commit is a diff error rather than a
judgement call.

---

### Track 1 — Refiling and splits

Structure only, no behaviour change.

- **Split a module that has more than one primary export,** per `STYLE.md`. Each
  spec moves with it. **106 modules carry two or more value exports**; 29 of
  those are in live scopes, and 77 sit under closed boxes (46 in `events`, 17 in
  `entities`, 6 in `game`, 3 each in `utils` and `sampleValues`, 2 in
  `ruleValues`).
- **Reorganize and comment the indexes.** 128 index files, 3,388 lines, 352
  comment lines between them — and that total is almost entirely two layers. An
  index is the layer's table of contents and the cheapest place to say what the
  layer is for.
- **Name an intermediate.** `return` stands on its own line and returns that
  name.
- **Move a predicate to the layer that owns it,** as `LAYERS.md` describes.
- **Do not refile a directory onto a different axis.** That is a design
  decision, not a scout change.

Index commentary by live scope. A barrel has no function bodies, so the 25%
in-body quota does not apply to it — these are top-level comments saying what the
layer holds, and the question is whether the layer's purpose is stated at all,
not what fraction of lines says it:

| Scope         | Indexes | Lines | Comment lines |
| ------------- | ------: | ----: | ------------: |
| `factories`   |       7 |   136 |        **39** |
| `queries`     |      27 |   618 |       **156** |
| `legality`    |      12 |   190 |             1 |
| `transforms`  |      17 |   240 |             0 |
| `testing`     |       5 |   107 |             0 |
| `procedures`  |       6 |    26 |             0 |
| `expected`    |       5 |    19 |             0 |
| `validation`  |       3 |    19 |             0 |
| `application` |       5 |    39 |             0 |

`factories` and `queries` are the scopes the human read has passed, and they are
the only two that say anything. `legality` has 190 lines of re-exports and one
comment. Every scope the read has not reached is silent about what it is for.

The multi-export counts under closed boxes are recorded, not acted on. In
`events` and `entities` a module that groups a type with its literal and its
guard may be idiomatic rather than a violation — that is a question for whoever
reopens those, and `AUDIT.md`'s rule holds: closed boxes stay closed.

---

### Track 2 — Source commentary and marks

**Commentary is the point of the pass**, in the doc's own words. The machine
adds and clarifies; it does not restructure behaviour to suit a comment.

**The 25% is an in-body quota, and what counts as in-body depends on what the
module declares.** In a struct the in-body commentary _is_ the JSDoc, written per
member inside the braces. For a function that would make no sense, because its
JSDoc sits above the signature, outside the body — there the quota is the line
inside the body that says why a check is there. A header block above any
declaration, struct or function, is the module saying what it is, and does not
count toward the quota.

**`pnpm check:commentary` reports these numbers per layer**, and `STYLE.md`
carries the definition beside the 25%. It renders no verdict, it gates nothing,
and it is in neither `validate` nor CI. Run it to see where a layer stands
before and after working on it.

That is deliberate, and an earlier draft of this file had it wrong. It recorded
a floor per layer and failed when a layer fell below it, on the reasoning that
`3845d55` rewrote 14,170 lines and added no commentary with every check still
green. The floor was the wrong answer: a comment that restates the line beneath
it raises the number and makes the file worse, so a gate on density can be
satisfied by exactly what `STYLE.md` calls worse than silence. A floor also
treats authored commentary as a number to defend rather than meaning someone
wrote.

Commentary quality is not mechanizable. It belongs in the docs and in the human
read, with judgment. What the machines gate is what is objective — imports,
types, formatting, and whether a spec proves itself — and `validate` now runs in
CI, which it did not before.

**The denominator is lines inside bodies, not lines in the file.** Three drafts
of this handoff got the numbers wrong by measuring in-body comments against whole
files, which mixes a numerator restricted to bodies with a denominator full of
imports, header blocks, signatures and closing braces. For a struct that skew is
enormous: `entities` reads as 11% against its files and **46%** against its
bodies. Blank lines make no difference either way — at most one point — so the
only choice that matters is the one above.

So: **in-body comment lines ÷ in-body code lines**, header blocks excluded from
both. If that definition is worth keeping, it belongs in `STYLE.md` beside the
number, because the number alone has now been misread three times.

Measured that way, **source is at 9%** (1,590 against 14,460) and **the specs are
at 1%** (382 against 29,647).

**And the standard is not an aspiration — three scopes already clear it:**

| Scope      | In-body comments | In-body code | Density |
| ---------- | ---------------: | -----------: | ------: |
| `entities` |              248 |          284 | **46%** |
| `game`     |              192 |          467 | **29%** |
| `events`   |              355 |          892 | **28%** |
| `utils`    |                7 |           50 |     12% |
| `queries`  |              233 |        1,853 |     11% |
| `expected` |              102 |          775 |     11% |
| `legality` |              223 |        1,866 |     10% |

Those three are the declaration layers, where a member costs one line of code and
earns three of documentation. The engine layers below them are the gap.

**A density figure cannot tell you whether commentary is any good**, so do not
work to one. Two examples of the voice to write in:

- `entities/board/waterCover.ts` — a struct. Eight edges documented inside the
  interface and again inside the Zod object, each saying what `true` means for
  that edge, with a header explaining why water is not a terrain type.
- `queries/card/calculateInitiative.ts` — a function, and the voice to match.
  Two comments in the whole body, both stating a rule rather than an operation:
  `// Lower initiative value wins` above a comparison of two card values, and
  `// Tie: current holder keeps it` above the fallback.

The second is the one to study, and what makes it readable is not a comment
every three lines — it is that both comments are in the game's vocabulary. Two
lines of that beat twenty naming the calls beneath them.

**This governs what you write, not what is already there.** Commentary in the
files is authored and the never-overwrite rule covers it: a comment that reads
thin to you may carry a distinction you have not met yet. Leave it, and mark it
if you must. Do not go looking for comments to improve.

**The audit is what moves this number.** The scopes the human read has passed run
10% to 11% — `queries`, `legality`, `expected` — against 2% to 3% for the scopes
it has not: `transforms` 3%, `procedures` 2%, `validation` 2%, `testing` 0%. Three
to five times, by the same hands, on the same kind of code.

A comment traces the code to the gameplay it serves and makes that link obvious.
`Navigates: MeleeResolutionState -> AttackApplyState -> RetreatState` is
accurate and still does not say which retreat this finds or why the game needs
one at this point.

A comment must match the check the code makes.

#### Header JSDoc is a separate requirement, and a short one

Every function and every struct wants a JSDoc block above it, for the IDE hover
and to state intent. That requirement stands on its own: **it is not discharged
by in-body commentary, and it does not discharge the quota.** A fully documented
header on an uncommented body still fails the quota, and a well-commented body
with no header still fails this.

Coverage is already good — **836 of 932 exported declarations carry one, 89%**.
The 96 that do not are 44 `const`, 20 `interface`, 18 `function` and 14 `type`,
and filling them is cheap.

**Length is the actual problem.** Of 1,598 blocks the median is one line, but
**201 run past eight lines** and the longest is 32. A three-paragraph tooltip is
an undesirable pattern: it is not what a hover is for, and it is where prose goes
to look like documentation without being placed near the code it explains. The
worst offenders:

| Lines | Module                                              |
| ----: | --------------------------------------------------- |
|    32 | `queries/unitPresence/getPlayerUnitWithPosition.ts` |
|    32 | `entities/unitPresence/unitPresence.ts`             |
|    28 | `queries/card/calculateInitiative.ts`               |
|    28 | `legality/unitMovement/getLegalRetreats.ts`         |
|    25 | `procedures/cards/generateResolveRallyEvent.ts`     |

**Do not shorten them.** An earlier draft of this file said to relocate that
prose into the bodies, which was wrong twice over: `STYLE.md` says in as many
words that a shorter header is not a cleanup, and cutting authored prose out of
a header is overwriting it, which the never-overwrite rule forbids. Leave every
long header exactly where it is.

What the 201 are good for is a hint about where the bodies are bare. A header
that grew to 32 lines usually did so because the explanation had nowhere else to
go, so those modules are the ones whose bodies most want the in-body line — and
writing it is additive, with the header untouched. The rule going forward is for
new headers only: a few lines saying what the thing is and why it exists, never
three paragraphs.

Note where the first one leads: `getPlayerUnitWithPosition` carries the longest
header in the repo and is also an open finding in `AUDIT.md` for returning the
secondary unit without checking its side. The header grew while the behaviour
stayed wrong, which is the argument for the rule that a comment must match the
check the code makes.

The specs do not have this problem — 371 blocks, median 3 lines, one over eight.
They have the opposite one.

`AUDIT_PROCESS.md` adds that file-level blocks above the imports sit at 6% of
modules "and that is not a gap to fill." Leave that alone.

One gap inside a closed box, recorded rather than acted on: `ruleValues/traits.ts`
lists all fifteen traits as a bare tuple with no per-trait documentation, while
`'phalanx'`, `'warband'`, `'shock'` and `'skirmisher'` each carry real gameplay
meaning. The file's two JSDoc blocks cover the derived type and the schema, not
the values.

#### The mark list

Marked where it stands, not fixed. `AUDIT_PROCESS.md` puts replacing an ad-hoc
definition in production code with a shared helper firmly in "what it leaves
alone."

**Bypassing a factory, a query or a transform is the top of the list.** The same
six-point order that the spec track _applies_ is the order the source track
_marks against_. Measured candidates in source, excluding specs and indexes:

| Scope        | `facing:` | `...state` | drills | Reading                                                 |
| ------------ | --------: | ---------: | -----: | ------------------------------------------------------- |
| `queries`    |        32 |          0 |      7 | above `@factories`, so the factory was available        |
| `testing`    |        24 |         20 |     10 | the fixture layer, and at 0% commentary                 |
| `legality`   |        11 |          0 |     23 | heaviest drilling outside `transforms`                  |
| `transforms` |         3 |         33 |     16 | the spreads are its job; the 16 drills are the question |
| `procedures` |         3 |          0 |      9 |                                                         |
| `validation` |         0 |          0 |      4 |                                                         |

These are candidates to look at, not findings. A `facing:` in a type literal or
a destructuring is not a bypass, and a transform spreading state is a transform
doing its work. Say which ones you compared.

**Duplicated or extractable behaviour is the other half.** Queries and
transforms are meant to compose; an ad-hoc walk that repeats a shared helper is
a finding. Search the whole package for the helper rather than trusting the
names in scope, and when two definitions look alike, say how they differ — two
can agree everywhere except on `'miss'`, `'pending'`, or whether they throw.
Duplicated **test** helpers are the exception: those get extracted, not marked.

**A comment that contradicts the signature is a fix, not a mark.** It meets the
bar in `AUDIT_PROCESS.md` exactly: the code contradicts its own comment, the
right answer is not in question, and nothing about behaviour changes.
Never-overwrite guards meaning that is in doubt — not a `@param` naming a
parameter that demonstrably is not there. Correct those where you find them, and
keep whatever the stale tag asserted if it is still true: move the claim into
the description rather than deleting it along with the tag.

Five were found and corrected that way already, so the shape is on record:

| Module                                                                 | Was                                                       |
| ---------------------------------------------------------------------- | --------------------------------------------------------- |
| `expected/expectedEvent/composable/getExpectedReverseEvent.ts`         | `@param _gameState`, takes `reverseState` only            |
| `transforms/.../completePhase/applyCompleteResolveMeleePhaseEvent.ts`  | `@param _event`, takes `state` only and documented second |
| `procedures/resolveAttack/generateCompleteMeleeResolutionEvent.ts`     | `@param state`, takes `eventNumber`                       |
| `procedures/resolveAttack/generateCompleteRangedAttackCommandEvent.ts` | `@param state`, takes `eventNumber`                       |
| `legality/unitMovement/exploreUnitMoves.ts`                            | `MoveResult` members documented with `@param`             |

The first two were the instructive ones. Neither merely named an absent
parameter; each explained why it was there — `_gameState` as "required for
consistency, engagement check handled by caller", `_event` as "present for
`applyGameEffectEvent` dispatch". Both claims were true about the function and
false about its signature, so both moved into the description and only the tag
went. The last was `@param` on an interface, which the IDE shows nowhere; its
three members now carry the author's own wording verbatim, relocated inside the
braces where the in-body rule counts it.

**A missing `@param` is a different thing and is not a contradiction.** 34
functions in `factories` and `procedures` take `eventNumber` and do not document
it, and 41 event interfaces in `events` declare an `eventNumber` member with no
JSDoc on it. The first is a documentation gap in those scopes, the second is
in-body commentary work. Neither is a fix, and both wait their turn in the order.

**Scripted detection of this needs reading before acting.** The scan that found
the five reported eight, and three were the script pairing a JSDoc with the
wrong function — a private helper sitting above the exported one, or a signature
truncated at a nested `)`. `createTestUnit`, `validateExpectedChoice` and
`updateAttackApplySubstep` all document their parameters correctly. Check every
hit against the signature before touching it.

Marks use the doc's three kinds, each naming what is wrong and what would settle
it:

- `TODO(wrong)` — looks incorrect, and the right behaviour is in question
- `TODO(misleading)` — a name, comment or title that says the wrong thing
- `TODO(composition)` — duplication, a predicate in the wrong layer, a shape
  that repeats

**Marks are the report.** They sit where the work is, so the read checks one by
glancing rather than navigating, and marks left in a scope are the simplest
signal it is still open. A mark is a marker, not a verdict — it can outlive a
read because you decided to leave it.

---

### Track 3 — Specs

Three things, and the setup one is the largest piece of work in the repo.

- **Names mostly need rewriting.** An `it` title states the fact the test
  proves. Name for the moment in the game, not the chain of states a lookup
  passes through: `createStateWithRearEngagementRoutAwaitingPenalty` names the
  plumbing.
- **Setup mostly needs reconfiguring to the minimalist baseline** — the six
  points below, applied in order.
- **Extensive commentary, saying which gameplay behaviour or rule is under
  test.** The specs are at **1%** — 382 in-body comment lines against 29,647 of
  in-body code — and no spec scope is above 2%. This is the point that actually
  produces comprehension and the one no substitution helps with: `3845d55`
  rewrote 14,170 lines and added none of it.

**This is where most of the writing in the pass lives.** Source is at 9% on
14,460 in-body code lines; the specs are at 1% on 29,647. Twice the code at a
ninth the density.

**The target is a third of the code, since commentary adds lines.** A quarter of
the finished body means comments equal to about a third of the code in it. For
the `queries` specs — 6,607 in-body code lines — that is roughly 2,200 lines of
prose against 132 today.

The suite baseline is **358 files, 1,894 tests**, and the count must not drop.
This track changes how a test is expressed, never whether it exists.

---

### Track 4 — Fixes

A fix is allowed only when all of these hold:

- The code contradicts its own comment, its type, a test, or a rule in the docs.
- The right behaviour is not in question.
- The fix is small and changes no game rule.

A fix gets a failing spec first, and its own commit. Everything else — any game
rule change, any possible bug that could be a design decision, any ad-hoc
definition that a shared helper would replace — gets a mark.

If a rewritten spec fails, stop. Name the assertion and the value it now
provides. Do not change production code to make it pass unless it meets the bar
above.

---

## Never overwrite, on either track

An existing comment is an authored definition of meaning. Do not remove it,
shorten it or rewrite it. Where it looks wrong, leave it and mark it. Where one
is missing, write it — absent is worse than approximate.

**This holds for specs too, and earlier drafts of this file left it out.**
`AUDIT_PROCESS.md`:

> A spec that reads as authored — a title that states a real fact, a comment
> explaining why a case exists, a deliberate value — gets marked, not rewritten.
> List any case dropped or merged.

Across 358 mostly machine-written spec files there are authored ones mixed in,
and a mechanical pass is exactly what would flatten them.

## The scope order is the audit's order

From [`src/domain/AUDIT.md`](./src/domain/AUDIT.md), which already runs in
dependency order because comprehension does not run downhill. Box state is that
file's; closed boxes stay closed.

Commentary columns are in-body comment lines over in-body code lines, header
blocks excluded from both, against `STYLE.md`'s 25%. Line counts are whole files,
so the two are not a ratio of each other.

| Scope          | Box      | Src mods | Src lines | Src in-body | Splits | Specs | Spec lines | Spec in-body |
| -------------- | -------- | -------: | --------: | ----------: | -----: | ----: | ---------: | -----------: |
| `utils`        | closed   |        5 |       221 |         12% |      3 |     1 |         71 |           0% |
| `entities`     | closed   |       41 |     2,116 |     **46%** |     17 |     0 |          — |            — |
| `game`         | closed   |       46 |     2,017 |     **29%** |      6 |     0 |          — |            — |
| `events`       | closed   |       50 |     2,981 |     **28%** |     46 |     0 |          — |            — |
| `ruleValues`   | closed   |        3 |       130 |          0% |      2 |     0 |          — |            — |
| `sampleValues` | closed   |        4 |     1,072 |          0% |      3 |     2 |         34 |          12% |
| `factories`    | reopened |       29 |       972 |          6% |      2 |    25 |        941 |           2% |
| `queries`      | open     |      115 |     4,117 |         11% |      2 |   114 |      8,950 |           1% |
| `legality`     | open     |       41 |     3,282 |         10% |      9 |    38 |      5,603 |           1% |
| `expected`     | open     |       18 |     1,292 |         11% |      0 |    18 |      2,736 |           0% |
| `procedures`   | open     |       26 |     1,378 |          2% |      0 |    25 |      2,227 |           1% |
| `transforms`   | open     |       95 |     4,934 |          3% |      2 |    91 |     12,161 |           0% |
| `validation`   | open     |       23 |     2,147 |          2% |      0 |    20 |      3,256 |           0% |
| `testing`      | open     |       23 |     1,845 |          0% |     13 |    21 |      1,244 |           0% |
| `application`  | open     |       26 |     1,010 |          6% |      1 |     3 |        450 |           0% |

A dash is where the measure does not apply: the declaration layers carry no
specs at all.

**Three source scopes clear the quota and every spec scope is at 2% or below.**
`entities` 46%, `game` 29% and `events` 28% are the declaration layers, where a
member costs one line of code and earns three of documentation. Then a clear
band: `queries` 11%, `expected` 11%, `legality` 10% — the scopes the human read
has passed — against `transforms` 3%, `validation` 2%, `procedures` 2% and
`testing` 0%, which it has not. The audit moves this number by three to five
times, which is the best evidence of what the pass is actually for.

So commentary is the largest single piece of work here, and the specs are much
the larger half: 29,647 in-body code lines at 1% against source's 14,460 at 9%.

Three source scopes are the exception and want real prose: **`validation` at
9%**, the lowest live scope; **`testing` at 14%**, which is the fixture layer
every spec reads through; and **`application` at 16%**. `sampleValues` at 3% is
a data catalog in a closed box and mostly being dropped, so leave it.

**The specs are not a reopening of those boxes.** The audit's boxes certify
source directories, and source behaviour does not change here. The spec read is
`AUDIT.md`'s own `## Test suite` section, which is still unchecked and includes
"spot-check colocated tests for packages audited in this pass." Two reads, two
artifacts, same directories.

**Live order:** `factories` (the reopened `game/` and `unitLocation/`, about 45
lines) → `queries` → `legality` → `expected` → `procedures` → `transforms` →
`validation` → `testing` → `application`.

**Start with `factories`.** 29 source modules, 972 lines, 25 specs, 2 splits,
and its indexes are already at 28%. It is the smallest live scope and nearly
clean, which makes it the shape-setting commit set: run all four tracks on it,
read the commits in order, and settle what each track looks like before 114
query specs and 115 query modules go through on the same pattern.

**Two checks before opening any scope,** both from `AUDIT_PROCESS.md`:

- Do the module names describe gameplay, or state access? `queries/sequencing`
  was the latter and took six weeks — thirty-six modules whose only statable
  reason was a path through a type. Where a scope looks like that, expect a
  design finding rather than comprehension, **and mark it rather than grinding.**
  That is where the audit is parked now, and the doc's own prescription was not
  followed.
- How many local helpers are defined in more than one of its specs? Specs that
  share no vocabulary give no second reading cheaper than the first. The table's
  helper counts answer this per scope.

## Why the slice is a scope, not a point

`3845d55` ran one point horizontally across 90 spec files. Good work in itself —
+918/−2,201, suite green, self-proof still zero, assertions left as literals —
and the measurements are why nothing else goes that way:

| Point                    | before |     after |
| ------------------------ | -----: | --------: |
| 1 factory calls          |    860 | **1,209** |
| 1 hand-written `facing:` |    681 |   **339** |
| 2 `...state` spreads     |    196 |       196 |
| 3 state property drills  |    238 |       238 |
| 4 local spec helpers     |    109 |       109 |
| 5 comment lines          |  1,494 |     1,492 |

Five of six unchanged, identically. **74 of the 90 files still carry a point 1
to 4 item**, so they get reopened four more times and their diffs read four more
times. Sixteen are finished.

Two specifics make the case better than the totals:

- **`legality/unitMovement/exploreUnitMoves.test.ts` was skipped** — the single
  heaviest file on that axis, 60 facings and 25 drills — while six lighter files
  in the same directory were half-converted.
- **`canMoveInto.test.ts` shows why horizontal cannot finish a file.** Its ten
  remaining `facing:` fields are all arguments to a local helper:

  ```ts
  const gameState = createGameState([
    { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
  ]);
  ```

  A private unit DSL carrying a `speed` the unit type owns. That is what makes
  the file hard to read, it is a point-4 item, and point 1 could not reach it —
  but point 4 rewrites every line point 1 just touched.

So: one file at a time, all four tracks, and the file is left done — then the
next, until the layer is finished.

## Run `pnpm validate` often

Not once per commit. Often, inside each file, on whatever is half done. It
carries lint, format, typecheck and the self-proof check, and all four answer
questions that get much more expensive once a substitution has been repeated
across a directory:

- A self-proof is cheapest to find in the edit that introduced it. The suite is
  at zero, so any hit belongs to the change in front of you.
- `format` runs as part of it, so formatting drift never lands mixed into a
  substitution diff and muddies the read.
- A substitution that typechecks in one file and not the next means the two
  sites were not the same shape, which is the signal to stop and look rather
  than push the pattern through.

Record `pnpm test` and `pnpm validate` at the start of a scope. A failure
already there is not this pass's. Run both on the whole repo before finishing a
scope, not only on the scope; a failure that was not there at the start is this
pass's to explain.

## The baseline: does the setup path reach the subject?

**This governs the spec track.** The question to ask of a spec's imports is not
whether they respect the layer order. It is whether the spec can **prove
itself**: whether anything it imports ends up calling the function under test.
`boundaries.ts` and [`LAYERS.md`](./LAYERS.md) still say what each layer may
reach for, and the table below repeats it for specs, but for a spec that is a
guide to what is normal, not a constraint to satisfy.

**There is no cycle risk, and an earlier draft was wrong to raise one.** Nothing
imports a spec file, so a spec can never sit on an import cycle — not rarely,
but structurally. A path like
`isFriendlyUnit.test.ts -> addUnitToBoard -> isFriendlyUnit` is a legal DAG, no
boundary violated, lint clean. Cycle detection cannot see it because there is no
cycle to see.

**`pnpm validate` enforces it** (`scripts/selfProof/`). It builds the import
graph from `boundaries.ts` and the imports themselves, resolves each name
through the barrels to the module that declares it, drops type-only edges, and
asks whether any non-subject import reaches the subject. It runs in about a
second.

It found exactly one spec, a real tautology, now fixed (`6749201`).
`getLegalChooseMeleeResolutionEvents.test.ts` asked
`isValidChooseMeleeResolutionEvent` whether each returned option was valid — and
that validator computes the legal options by calling the subject, so the
assertion said every option returned was among the options returned. The three
choices are literals now. The same block also read `space` off the actual value,
which the import graph cannot see; that is gone too.

**The suite is at zero, so any new hit is something this pass introduced.**

What the check cannot see is a single assertion reading its expected value off
the actual one, as that spec also did. That stays a reading job.

Two worked cases, because they land on opposite sides:

- **`@sampleValues` is always safe.** Its only outgoing edge is `@entities`, so
  it can never reach any subject. 78 specs import it across nine layers.
- **`addUnitToBoard` is not.** It imports `@queries` — `getBoardSpace`,
  `getOppositeFacing`, `hasEngagedUnits`, `hasSingleUnit`, `isFriendlyUnit`.
  `removeUnitFromBoard` adds `hasNoUnit` and `isSameUnitInstance`. For the specs
  of **those seven queries**, building a board with that transform makes the
  setup run the subject.

  None of the seven does today — each builds its state literally, which is why
  the check comes back with one hit and not eight. **Leave them that way.** They
  are the specs this pass is most likely to "improve" into uselessness, and the
  check is what tells you if it happens: adding
  `import { addUnitToBoard } from '@transforms'` to `isFriendlyUnit.test.ts`
  takes the count from 1 to 2.

**A `@testing` helper hides the path rather than removing it.** `@testing` may
import every layer, which is what lets a fixture compose anything. It also means
a helper can carry a dependency on the subject without the spec showing it,
which is worse than a direct import, because at the call site there is nothing
to see. `createBoardWithUnits` composes `addUnitToBoard`, so routing those seven
specs through `createGameStateWithUnits` would introduce exactly the self-proof
they currently avoid. Check what a helper composes before substituting it in.

A useful discriminator for `@queries` specs: **55 of the 95 transform modules
import `@queries`**, and the board and apply transforms are among them.
`updatePhaseState` is not — it imports only `@game`, so it writes state without
reading any of it.

| A spec in                       | `@factories` | `@queries` | `@legality` | `@transforms` |
| ------------------------------- | ------------ | ---------- | ----------- | ------------- |
| `@utils`, `@ruleValues`         | no           | no         | no          | no            |
| `@entities`, `@events`, `@game` | no           | no         | no          | no            |
| `@factories`                    | own          | no         | no          | no            |
| `@queries`                      | yes          | own        | no          | **no**        |
| `@legality`                     | yes          | yes        | own         | **no**        |
| `@expected`                     | yes          | yes        | yes         | **no**        |
| `@procedures`                   | yes          | yes        | yes         | **no**        |
| `@validation`                   | yes          | yes        | yes         | **no**        |
| `@transforms`                   | yes          | yes        | yes         | own           |
| `@application`                  | yes          | yes        | **no**      | yes           |

**For a spec, that table is a prompt to think, not a rule to enforce — and an
earlier draft had that wrong too.** 146 specs import `@transforms`, and 109 of
them sit below it: 47 in `@queries`, 25 in `@legality`, 16 in `@validation`, 16
in `@procedures`, 5 in `@expected`. Those are not findings, for three reasons:

- Specs carry `enforceBoundaries: false` **by design**, in the shared config.
  That is a decision someone made, not a gap someone left.
- A spec is in no graph that ships. Not in `dist`, not in a build entry, not in
  `mutate`, and nothing imports it. An upward edge from a spec cannot reach
  production code or put a layer in a cycle.
- The one harm anyone has named is self-proof, and the check measures it
  directly. It says zero across all 109.

So do not restructure a spec to satisfy the table. What the table is good for is
noticing when a spec reaches unusually far for its layer, which is worth a
sentence on why. Especially in `@queries`, where reaching up into `@transforms`
for setup is where self-proof becomes possible at all.

---

## The minimalist setup baseline

The order of preference for anything a spec's setup needs. Applied in track 3;
marked against in track 2.

### 1. Factories

`placed(unit, coordinate, facing)` in `@testing` composes `@factories`'
`createUnitPlacement`. After `3845d55` the factories are called 1,209 times, and
**339 hand-written `facing:` fields remain across 75 files**.

```ts
const unitWithPlacement: UnitWithPlacement = {
  placement: { coordinate: 'E-5', facing: 'north' },
  unit: routedUnit,
};
```

becomes

```ts
const unitWithPlacement = placed(routedUnit, 'E-5', 'north');
```

Heaviest remaining: `legality/unitMovement/exploreUnitMoves.test.ts` (60),
`canEngageEnemy.test.ts` (20), `checkDiagonalMove.test.ts` (18),
`legality/choiceOptions/performRangedAttack/getLegalRangedAttackers.test.ts`
(17), `transforms/stateTransitions/applyChoices/applyPerformRangedAttackEvent.test.ts`
(16).

**Not every remaining site is a `UnitWithPlacement`, and some are not this point
at all.** Some are overrides into a `Partial<…>`; some are a bare
`UnitPlacement` in a field such as a `MoveUnitEvent`'s `to`, which take
`createUnitPlacement(coordinate, facing)`; and some are arguments to a local
helper that point 4 dissolves. Check each site. Do not pattern-replace blind,
and do not force a factory into a call point 4 is about to delete.

Also here: the 16 `create*Event` player-choice factories, and
`createEmptyGameState` / `createCardState` / `createOwnedCardState`. A spec that
casts or hand-writes a choice event uses the factory.

### 2. Transforms

**196 `...state` spreads across 63 spec files**, and **91 `boardState:`
writes**. The canonical bad shape, from `applyResolveRoutEvent.test.ts`:

```ts
let stateWithUnits = {
  ...state,
  boardState: addUnitToBoard(state.boardState, routedUnitWithPlacement),
};
stateWithUnits = {
  ...stateWithUnits,
  boardState: addUnitToBoard(stateWithUnits.boardState, otherUnitWithPlacement),
};
```

Two units, eight lines, the state respread twice. `@transforms/pureTransforms`
already exports `addUnitToBoard`, `removeUnitFromBoard`, `addCommanderToBoard`,
`removeCommanderFromBoard`, `updatePhaseState`, `markPhaseAsComplete`,
`addCompletedPhase` and the card movers. No spec should write a
`{ ...state, … }` literal where one of those applies.

`@testing` has the composed version of the commonest case:
`createGameStateWithUnits`, `createGameStateWithSingleUnit` and
`createGameStateWithEngagedUnits`. Reach for those when they read better than
the two transform calls, which below `@transforms` they usually do — **because
they read better, not to tidy a layer.** Those three compose `addUnitToBoard`,
which reads seven queries, so substituting them into a `@queries` spec can hand
that spec its own subject.

### 3. Queries

`@queries` exports **37 state-reading getters**. Specs read nested state by
property path **238 times**, concentrated in a few paths:

| Hand-drilled path                | Hits | The query that owns it                                                                                      |
| -------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------- |
| `.currentPhaseState`             | 112  | `getCurrentPhaseState`, or the per-phase getters                                                            |
| `.routState`                     | 41   | `getRoutStateFromRally` / `FromAttackApply` / `FromRearEngagement` / `FromMeleeResolutionByInitiative`      |
| `.currentCommandResolutionState` | 30   | `getCurrentCommandResolutionState`                                                                          |
| `.currentMeleeResolutionState`   | 20   | `getMeleeResolutionState`                                                                                   |
| `.retreatState`                  | 16   | `findRetreatState`, `getMeleeRetreatState` / `FromRangedAttack` / `FromAttackApply` / `FromFrontEngagement` |
| `.engagementState`               | 13   | `getEngagementStateFromMovement`, plus the front / flank / rear variants                                    |
| `.attackApplyState`              | 12   | `getMeleeAttackApplyState` / `FromRangedAttack`                                                             |
| `.reverseState`                  | 12   | `getReverseStateFromAttackApply` / `FromMeleeResolutionByInitiative`                                        |

Two directions, both of them this point:

- **Reading.** Assert through the getter that owns the value, not a property
  chain. A chain is a second route to the same fact and goes stale silently.
- **Reaching.** Do not rebuild a nested state a getter can hand you. Build the
  state once, then look up the slice.

**The exception.** `STYLE.md`: read it through the query that owns it _unless
that query is the subject under test_, and below `@queries` there is no such
query — there, read the field the subject writes. So `getCurrentPhaseState`'s own
spec drills, and a `@transforms` or `@factories` spec reads the field directly.
Do not make a spec assert through its own subject; that proves nothing.

`getLegalRetreats` lives in `@legality`, so a `@queries` spec cannot call it.
See point 4.

### 4. Fixtures, for what the first three leave

**109 local helper definitions across 81 spec files**, 56 named `create*`, and
30 `createStateWith*` definitions under 13 names sitting inside `describe`
blocks. The other 277 spec files define none.

Do this **after** 1 to 3 on the same file, once those have shown what is
actually left. Each of these helpers is a factory call, two transform calls and a
query read done by hand, every one walking the same chain and respreading the
state at each step:

```
createEmptyGameState(mode)
  → addUnitToBoard, respread into { ...state, boardState }
  → create<X>ResolutionState(state, { substep })
  → create<Y>PhaseState(state, { resolution })
  → updatePhaseState(state, phaseState)
```

Add `src/domain/testing/situations/` for the assembled situation, once 1 to 3
have shown what each one needs. `@testing` already exports 19 phase and substep
helpers and 8 board helpers, so check those first — the gap is a name for the
whole situation, not new primitives.

**A local helper that invents engine-owned values is the worst case.**
`canMoveInto.test.ts`'s `createGameState([{ coord, facing, player, speed }])` is
a private unit shape carrying a `speed` the unit type owns. Helpers of this kind
are why point 1 leaves 339 facings standing: those sites are not placements,
they are arguments to a DSL. Replace the DSL with real units through the
factories and the facings go with it.

**One shared fixture is doing a query's job and must stop.**
`testing/phaseStateHelpers/substepStates.ts` defaults `createRetreatState`'s
`legalRetreatOptions` to E-4 and E-6 facing north. `@legality`'s
`getLegalRetreats(unitWithPlacement, gameState)` computes them. 18 specs call
`createRetreatState`; 10 touch `legalRetreatOptions`, and most already pass an
explicit override, which is correct and stays. Make the parameter required, per
the project's explicitness rule. `substepStates.test.ts:20` asserts the default
has length 2 — that assertion goes with the default, being the fixture agreeing
with itself.

Four sites in three files bypass the substep helpers and inline a raw literal —
`createStateWithRearEngagementRoutAwaitingPenalty` in
`applyResolveRoutEvent.test.ts` writes a `routState: { … }` object directly.
Route those through `createRoutState`.

### 5. Commentary

Covered in track 3. The gameplay rule under test, stated in the body.

### 6. Naming

Covered in track 3. Two names are already findings in `AUDIT.md` and are
decisions rather than cleanups — read them before renaming, and note both land
in `testing`, late in the order:

- `createUnitWithPlacement` fabricates the unit through `createTestUnit`, which
  its name does not say. 34 specs call it.
- `createTestUnit` accepts `cost`, `limit` and `morale` and ignores all three,
  so a spec that asks for a limit gets whatever the sample unit carries.

---

## Boundary edges opened, already done

Two edges in `boundaries.ts` were missing rather than withheld. Both are now
open and `pnpm validate` is clean.

- **`@procedures` may import `@factories`.** `@factories` sits below `@queries`,
  which `@procedures` already imported, so the transitive dependency existed and
  only the direct edge was missing — it had never been needed, so nobody had
  noticed. A procedure that builds an event may now reach the factory for it.
- **`@sampleValues` imports `@entities` as values, not types only.** It needs
  the schemas, not just the shapes. Its only importer is `@testing` (five
  modules) plus the domain barrel, and it has no other outgoing edge, which is
  what makes it cycle-proof.

## Get the samples out of the root barrel

Independent of the scope order, and blocked on the consumers rather than on this
repo.

`@sampleValues` is a database surrogate. Nothing in it belongs in this package's
production surface, and no consumer should reach it either:
`src/domain/index.ts:582-588` re-exports `blackMiniStarterArmy`,
`blackTinyStarterArmy`, `tempCommandCards`, `tempUnits`, `whiteMiniStarterArmy`
and `whiteTinyStarterArmy`, so every consumer of `/domain` gets stand-in data
alongside the engine, and 62 consumer specs have grown to depend on it.

**Nothing uses a sample outside a spec** — 78 spec files here, 25 in the client,
37 in the server, zero production modules anywhere. Consumers use four symbols:
`tempCommandCards` (104 references), `tempUnits` (88), `whiteTinyStarterArmy`
(25) and `blackTinyStarterArmy` (4).

A `./sampleValues` subpath was briefly added and has been reverted, because a
consumer's tests should not reach this package's sample data by any route. The
shape they actually need is small: the dominant pattern across those 62 files is
`tempUnits[0]` and `tempCommandCards[0]`, which is not a need for this catalog
at all. It is a need for one valid unit type and one valid command card. A local
builder states what the test cares about, where sample index 0 only happens to
carry it.

Only **12 of the 62** want the catalog as a collection — 8 client, 4 server,
including `get-command-card-unit-ids`, `command-card-project-ops`,
`replace-command-card-unit-ids-with-names`, `select-random-player-choice`,
`validateArmyDraft` and `assignUnitSupportSelection`. Those need a set of cards,
which a builder makes by mapping over initiatives.

### The server is most of the way there

`prevail-server/src/testing/game-session-armies.ts` already defines
`unitType(overrides)`, `commandCard(initiative, index)`,
`commandSet(perInitiative)` and `miniArmy` — exactly the right builders, but
only `army`, `miniArmy` and `standardArmy` are in
`prevail-server/src/testing/index.ts`. Export `unitType`, `commandCard` and
`commandSet`, then replace `tempUnits[0]` with `unitType()` and
`tempCommandCards[0]` with `commandCard(1, 0)`. Where a spec asserts on a cost,
a morale or a trait, pass it as an override so the test says what it depends on.

### The client has no fixtures at all

There is no `src/testing` in `prevail-client`. Add one, with the same two
builders, written for the client's own needs rather than copied. The 25 client
spec files then stop importing from this package's samples.

### Then this package

Delete the `@sampleValues` block at `src/domain/index.ts:582-588`. Nothing
inside this package is affected: all 78 specs here already import
`@sampleValues`, and no module in `src` imports the domain root barrel at all,
because reaching it from inside would be an ancestor import and the lint stops
that even in specs. The consumers are the only thing holding this step.

`@testing` is not exported either, and this does not change that.

While you are in `package.json`: the `exports` map declares `"."` →
`./dist/index.d.ts`, but there is no `src/index.ts` and tsdown has no root
entry, so that condition points at a file the build never writes. Anything
importing the bare package name resolves to nothing. Worth removing or giving a
real entry.

## Keep the legal samples, drop the rest

Decided: what is legal stays and gets used, and what is not goes. Surveyed
against the schemas after the move of the army rules into `@legality`.

**Keep `miniStarterArmy`, and invoke it.** `armySchemaForMode('mini')` accepts
both sides. Nothing calls it outside the barrel, and the one spec here that
needs an army — `application/useCases/requestGameStateSnapshot.test.ts` — builds
a local `placeholderArmy` instead. That is the invocation, and it lands with
`application`, last in the order.

**Drop `tinyStarterArmy`,** both sides and its spec. It is illegal for mini: it
names seven cards, one of them `'Rally'`, which is not among the samples, and a
silent `.filter(card => card !== undefined)` leaves six where mini requires
eight. Its spec asserts only that the ids are well formed, so it passes while
the value it guards is unusable.

**Drop the five command cards that fail `commandCardSchema`,** leaving twenty:

| Card               | Fails on                                     |
| ------------------ | -------------------------------------------- |
| Strike             | `unitSupport.count`                          |
| Evade              | `roundEffect.modifiers`, `unitSupport.count` |
| Volley             | `roundEffect.modifiers`, `unitSupport.count` |
| Charge             | `roundEffect.modifiers`, `unitSupport.count` |
| Quincunx Formation | `roundEffect.modifiers`                      |

`miniStarterArmy` names none of the five, so it survives the cut untouched.

**The ordering matters.** `tempCommandCards` begins Strike, Evade, Volley,
Charge — so its **first four entries are all illegal**, and `tempCommandCards[0]`
is Strike. `[0]` is the dominant pattern across the consumer suites. Around
sixty consumer specs are built on a command card that does not parse, which is
the strongest argument yet for giving them their own builders. Dropping the five
also shifts every index after it.

So: consumers off the samples first, then these drops, then the barrel block.
The other order breaks sixty specs on values they should not have been using.

## Still open

- The audit is suspended at `queries/sequencing/combatOutcomes`, `queries/unit`
  and `queries/unitPresence`, with findings already written against them in
  `src/domain/AUDIT.md`. `factories/game` and `factories/unitLocation` are
  marked reopened, about 45 lines.
- The stuck list in `AUDIT.md` is empty. After a slow scope that is a symptom
  rather than a clean bill.

## Mutation testing

Stryker runs on TypeScript 5 beside the project's TypeScript 7. The cron
generates one job per boundary from `boundaries.ts`, then merges the shard
reports with `aggregateResultsByModule`. `ignoreStatic` is false. `entities`,
`events` and `game` are excluded from `mutate`, which is sound because the
behaviour that was hiding in them has moved out to `queries`, `legality` and
`factories` where mutation still watches it. Per-test timeout is 20s and
`timeoutMS` 60000, so a Timeout now signals a real hang rather than a budget
shortfall — which matters, because Stryker scores a Timeout as Killed.

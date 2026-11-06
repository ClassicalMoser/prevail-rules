# Handoff — test readability overhaul

**State:** `main` clean and in sync with `origin/main` at `a6c8c12`. 358 spec
files, 1,894 tests, green in 12s. `pnpm validate` clean — lint, format,
typecheck and the self-proof check.

This is the work the audit is waiting on. The audit stalled at
`queries/sequencing` because the specs there were unreadable, and the same shape
repeats across the suite.

**The slice has changed.** The first draft of this handoff ordered the work by
point: factories everywhere, then transforms everywhere, and so on. `3845d55`
ran point 1 that way, and what it produced is the reason the rest does not go
that way. Read the next section before starting.

## Why the slice is a layer, not a point

`3845d55` is good work. 90 spec files, +918/−2,201, suite green, self-proof
still at zero, and the substitution is the right shape with assertions left as
literals. Measured across the whole suite, before it and after it:

| Point                    | before |     after |
| ------------------------ | -----: | --------: |
| 1 factory calls          |    860 | **1,209** |
| 1 hand-written `facing:` |    681 |   **339** |
| 2 `...state` spreads     |    196 |       196 |
| 3 state property drills  |    238 |       238 |
| 4 local spec helpers     |    109 |       109 |
| 5 comment lines          |  1,494 |     1,492 |

Five of the six points are unchanged — not approximately, identically. 14,170
lines of test code were rewritten, and those files carry 117 line comments
between them, 0.8%.

**74 of the 90 touched files still carry a point 1, 2, 3 or 4 item.** Sixteen
are finished. The other 74 get opened again at transforms, again at queries,
again at fixtures, again at commentary — and their diffs get read four more
times, which is the opposite of what this pass is for. Comprehension comes from
reading a file once and knowing it is done.

Two specifics make the case better than the totals do.

**`legality/unitMovement/exploreUnitMoves.test.ts` was skipped.** It is the
single heaviest file in the suite on that axis — 60 hand-written facings and 25
property drills — and it is not in the commit, while six lighter files in the
same directory were half-converted.

**`legality/unitMovement/canMoveInto.test.ts` shows why a horizontal sweep
cannot finish a file.** Its ten remaining `facing:` fields are not point-1
leftovers. Every one is an argument to a local helper:

```ts
const gameState = createGameState([
  { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
]);
```

A bespoke mini-DSL for units, carrying a `speed` the engine owns. That is what
makes the file hard to read, it is a point-4 item, and point 1 could not reach
it — but point 4 will rewrite every line point 1 just touched. There are 109
such helpers in 81 spec files, 56 of them named `create*`.

So: **one file at a time, all six points in order, and the file is left done.**

## What "done" means for a file

Walk the six points in order on a single file, then do not open it again:

1. Every value a factory builds comes from the factory.
2. Every state change comes from a transform.
3. Every state read comes from the query that owns it, unless that query is the
   subject.
4. What is left over, and only that, is a `@testing` fixture.
5. The body carries gameplay commentary at `STYLE.md`'s 25%.
6. Names say the moment in the game.

Then `pnpm validate` clean, and `pnpm test` still at 358 files and 1,894 tests.

A layer is finished when every spec under it is finished. One commit per layer,
except `queries`, `legality` and `transforms`, which are too big for one — those
commit per directory.

## The order is the audit's order

From `src/domain/AUDIT.md`. Layers with no specs (`entities`, `events`, `game`,
`ruleValues`) are not in the pass.

| #   | Layer         | Specs | `facing:` | spreads | drills | helpers |  lines | `//` |
| --- | ------------- | ----: | --------: | ------: | -----: | ------: | -----: | ---: |
| 1   | `factories`   |    25 |         2 |       0 |      4 |       0 |    941 |   1% |
| 2   | `queries`     |   114 |        34 |       2 |      4 |       2 |  8,950 |   1% |
| 3   | `legality`    |    38 |       167 |      14 |     95 |      15 |  5,603 |   1% |
| 4   | `expected`    |    18 |        23 |      11 |      3 |      12 |  2,736 |   0% |
| 5   | `procedures`  |    25 |         7 |      42 |     25 |      15 |  2,227 |   0% |
| 6   | `transforms`  |    91 |        73 |     107 |     64 |      49 | 12,161 |   0% |
| 7   | `validation`  |    20 |        21 |      14 |      9 |      16 |  3,256 |   0% |
| 8   | `testing`     |    21 |        11 |       4 |     29 |       0 |  1,244 |   0% |
| 9   | `application` |     3 |         1 |       2 |      5 |       0 |    450 |   0% |

Plus two specs in `sampleValues` and one in `utils`, which the sample work below
covers. 358 in all.

**Why this order rather than easiest-first or heaviest-first:**

- It is the audit's order, and the audit is what this pass exists to unblock.
  The audit is parked at `queries/sequencing/combatOutcomes`, `queries/unit` and
  `queries/unitPresence`. Finishing step 2 hands it back exactly the three
  directories it stopped on.
- It is dependency order, so each point's tools are themselves read before the
  layer that leans on them. Point 1's factories are read at step 1; point 3's
  queries at step 2.
- It keeps the test pass one layer ahead of the human read, so every layer
  arrives at that read already legible.

**Start with `factories`.** 25 specs, 941 lines, 2 facings, 4 drills, no local
helpers at all. It is nearly clean, which makes it the shape-setting commit: do
it whole, read the diff end to end, and settle what "done" looks like there
before 114 query specs go through on the same pattern.

`legality` and `transforms` hold most of the remaining work — 240 of the 339
facings, 121 of the 196 spreads, 159 of the 238 drills, 64 of the 109 helpers.
They are steps 3 and 6, and they stay there. Taking them early would mean
rebuilding each spec against factories and queries that have not been read yet.

## Run `pnpm validate` often

Not once per commit. Often, inside each file, on whatever is half done. It
carries lint, format, typecheck and the self-proof check, and all four answer
questions that get much more expensive once a substitution has been repeated
across a directory:

- A self-proof is cheapest to find in the edit that introduced it. The suite is
  at zero, so any hit belongs to the change in front of you.
- `format` runs as part of it, so formatting drift never lands mixed into a
  substitution diff and muddies the read.
- A substitution that typechecks in one file and not the next means the two sites
  were not the same shape, which is the signal to stop and look rather than push
  the pattern through.

`pnpm test` is the other half, and the baseline is 358 files, 1,894 tests. The
count must not drop: this pass changes how a test is expressed, never whether it
exists.

## The baseline: does the setup path reach the subject?

**This governs every point below.** The question to ask of a spec's imports is
not whether they respect the layer order. It is whether the spec can **prove
itself**: whether anything it imports ends up calling the function under test.
`boundaries.ts` and [`LAYERS.md`](./LAYERS.md) still say what each layer may
reach for, and the table below repeats it for specs, but for a spec that is a
guide to what is normal, not a constraint to satisfy.

**There is no cycle risk, and an earlier draft of this note was wrong to raise
one.** Nothing imports a spec file, so a spec can never sit on an import cycle —
not rarely, but structurally. A path like
`isFriendlyUnit.test.ts -> addUnitToBoard -> isFriendlyUnit` is a legal DAG, no
boundary violated, lint clean. Cycle detection cannot see it because there is no
cycle to see. Self-proof and circularity are different problems and only one of
them exists here.

**`pnpm validate` now enforces it** (`scripts/selfProof/`). It builds the import
graph from `boundaries.ts` and the imports themselves, resolves each name
through the barrels to the module that declares it, drops type-only edges, and
asks whether any non-subject import reaches the subject. Nothing to keep in step
by hand, and it runs in about a second.

It found exactly one spec, a real tautology, and it is fixed (`6749201`).
`getLegalChooseMeleeResolutionEvents.test.ts` asked
`isValidChooseMeleeResolutionEvent` whether each returned option was valid — and
that validator computes the legal options by calling the subject, so the
assertion said every option returned was among the options returned. The three
choices are literals now. The same block also read `space` from the actual
value, which the import graph cannot see; that is gone too.

**The suite is at zero, so any new hit is something this pass introduced.**

So: before reaching out of order, say what in the spec needs it and why — then
let the check answer whether it closes the loop. What the check cannot see is a
single assertion reading its expected value off the actual one, as that spec
also did. That stays a reading job.

Two worked cases, because they land on opposite sides:

- **`@sampleValues` is always safe.** Its only outgoing edge is `@entities`, so
  it can never reach any subject. 78 specs import it across nine layers; every
  one is fine, whatever the table says.
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
they currently avoid. Check what a helper composes before substituting it in,
and let `pnpm check:selfProof` confirm it.

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

`@entities`, `@events` and `@game` carry "no functions, no tests" in
`boundaries.ts`, so no spec should live there at all.

**For a spec, that table is a prompt to think, not a rule to enforce — and an
earlier draft of this note had that wrong too.** 146 specs import `@transforms`,
and 109 of them sit below it: 47 in `@queries`, 25 in `@legality`, 16 in
`@validation`, 16 in `@procedures`, 5 in `@expected`. The first draft called
those 109 findings and said to record them. They are not findings, for three
reasons:

- Specs carry `enforceBoundaries: false` **by design**, in the shared config.
  That is a decision someone made, not a gap someone left.
- A spec is in no graph that ships. It is not in `dist`, not in a build entry,
  not in `mutate`, and nothing imports it. An upward edge from a spec cannot
  reach production code or put a layer in a cycle.
- The one harm anyone has actually named is self-proof, and the check now
  measures it directly. It says zero across all 109.

So do not restructure a spec to satisfy the table. What the table is good for is
noticing when a spec reaches unusually far for its layer, which is worth a
sentence on why — that is the whole of it. Especially in `@queries`, where
reaching up into `@transforms` for setup is where self-proof becomes possible at
all.

---

## 1. Factories

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

Heaviest remaining, all of them in step 3 and step 6:
`legality/unitMovement/exploreUnitMoves.test.ts` (60),
`legality/unitMovement/canEngageEnemy.test.ts` (20),
`legality/unitMovement/checkDiagonalMove.test.ts` (18),
`legality/choiceOptions/performRangedAttack/getLegalRangedAttackers.test.ts`
(17),
`transforms/stateTransitions/applyChoices/applyPerformRangedAttackEvent.test.ts`
(16).

**Not every remaining site is a `UnitWithPlacement`, and some are not point 1 at
all.** Some are overrides into a `Partial<…>`; some are a bare `UnitPlacement`
in a field such as a `MoveUnitEvent`'s `to`, which take
`createUnitPlacement(coordinate, facing)` from `@factories`; and some, as in
`canMoveInto.test.ts`, are arguments to a local helper that point 4 dissolves.
Check each site. Do not pattern-replace blind, and do not force a factory into a
call that point 4 is about to delete.

Also in scope: the 16 `create*Event` player-choice factories and
`createEmptyGameState` / `createCardState` / `createOwnedCardState`. A spec that
casts or hand-writes a choice event uses the factory.

---

## 2. Transforms

Specs hand-roll the immutable updates the transforms own: **196 `...state`
spreads across 63 files**, and **91 `boardState:` writes**. The canonical bad
shape, from `applyResolveRoutEvent.test.ts`:

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

`@testing` already has the composed version of the commonest case:
`createGameStateWithUnits`, `createGameStateWithSingleUnit` and
`createGameStateWithEngagedUnits` compose `createEmptyGameState` with
`addUnitToBoard`. Reach for those when they read better than the two transform
calls, which below `@transforms` they usually do.

**Reach for them because they read better, not to tidy a layer.** Those three
compose `addUnitToBoard`, which reads seven queries, so substituting them into a
`@queries` spec can hand that spec its own subject. An `@transforms` import that
the check passes is fine where it is clearer.

---

## 3. Queries

`@queries` exports **37 state-reading getters**. Specs read nested state by
property path **238 times**, and the heavy paths are concentrated:

| Hand-drilled path                | Hits | The query that owns it                                                                                          |
| -------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------- |
| `.currentPhaseState`             | 112  | `getCurrentPhaseState`, or the per-phase getters                                                                |
| `.routState`                     | 41   | `getRoutStateFromRally` / `FromAttackApply` / `FromRearEngagement` / `FromMeleeResolutionByInitiative`          |
| `.currentCommandResolutionState` | 30   | `getCurrentCommandResolutionState`                                                                              |
| `.currentMeleeResolutionState`   | 20   | `getMeleeResolutionState`                                                                                       |
| `.retreatState`                  | 16   | `findRetreatState`, `getRetreatStateFromMelee` / `FromRangedAttack` / `FromAttackApply` / `FromFrontEngagement` |
| `.engagementState`               | 13   | `getEngagementStateFromMovement`, plus the front / flank / rear variants                                        |
| `.attackApplyState`              | 12   | `getAttackApplyStateFromMelee` / `FromRangedAttack`                                                             |
| `.reverseState`                  | 12   | `getReverseStateFromAttackApply` / `FromMeleeResolutionByInitiative`                                            |

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

The layer baseline applies here too, which is why step 1 has only four drills in
scope — `@queries` is above `@factories`. Almost all 238 sites sit in `@queries`
and above. The one place the point does not reach: `getLegalRetreats` lives in
`@legality`, so a `@queries` spec cannot call it. See point 4.

---

## 4. Fixtures, for what the first three leave

**109 local helper definitions across 81 spec files**, 56 of them named
`create*`, and 30 `createStateWith*` definitions under 13 names sitting inside
`describe` blocks. The other 277 spec files define none.

Do this point **after** 1 to 3 on the same file, once those have shown what is
actually left. In `@transforms` and `@application` they do most of the work and
little residue remains. Further down, a named `@testing` helper usually beats
five lines of transform calls in a spec whose subject is nowhere near them — not
because the layer table says so, but because the spec then reads as the
situation it is about instead of the plumbing that builds it.

These helpers are not missing abstractions in themselves — each is a factory
call, two transform calls and a query read, done by hand. Every one walks the
same chain, threading the state and respreading it at each step:

```
createEmptyGameState(mode)
  → addUnitToBoard, respread into { ...state, boardState }
  → create<X>ResolutionState(state, { substep })
  → create<Y>PhaseState(state, { resolution })
  → updatePhaseState(state, phaseState)
```

The state is passed three times. Add `src/domain/testing/situations/` for the
assembled situation, once points 1 to 3 have shown what each one actually needs.
`@testing` already exports 19 phase and substep helpers and 8 board helpers, so
check those first — the gap is a name for the whole situation, not new
primitives. A situation helper may import any layer, which is the point.

**A local helper that invents engine-owned values is the worst case, and
`canMoveInto.test.ts` has one.** `createGameState([{ coord, facing, player,
speed }])` is a private unit shape carrying a `speed` the unit type owns.
Helpers of this kind are why point 1 leaves 339 facings standing: those sites
are not placements, they are arguments to a DSL. Replace the DSL with real units
through the factories and the facings go with it.

**One shared fixture is doing a query's job and must stop.**
`testing/phaseStateHelpers/substepStates.ts` defaults `createRetreatState`'s
`legalRetreatOptions` to E-4 and E-6 facing north. `@legality`'s
`getLegalRetreats(unitWithPlacement, gameState)` computes them, returning a
`Set<UnitPlacement>`. 18 specs call `createRetreatState`; 10 touch
`legalRetreatOptions`, and most already pass an explicit override, which is
correct and stays. Make the parameter required, per the project's explicitness
rule, so no spec inherits two options it never asked for.
`substepStates.test.ts:20` asserts the default has length 2 — that assertion
goes with the default. It is the fixture agreeing with itself.

`getLegalRetreats` is in `@legality`, so only `@legality` and above may call it
directly. `@testing` may, which is where a helper that needs computed retreat
options belongs.

Four sites in three files bypass the substep helpers entirely and inline a raw
literal — `createStateWithRearEngagementRoutAwaitingPenalty` in
`applyResolveRoutEvent.test.ts` writes a `routState: { … }` object directly.
Route those through `createRoutState`.

---

## 5. Commentary

**323 line comments, 0.9% of 37,673 spec lines**, against `STYLE.md`'s 25%
in-body standard. The 1,169 JSDoc lines do not count toward it.

Decided: the 25% binds spec bodies as it binds source. This is the point that
actually produces comprehension, and it is the one no substitution helps with —
`3845d55` rewrote 14,170 lines and added none of it.

**The target is a third of the body, not a quarter of today's file.** Commentary
adds lines, so 25% of the finished file puts the comment count at about one
third of the non-comment lines. For `queries` that is roughly 2,950 lines of
prose against 90 today.

Additive only. Never overwrite an existing human comment — the standing
invariant in `AUDIT_PROCESS.md`. A comment traces the code to the gameplay it
serves: what happens in the game, and why the rules want it. Where something
reads as wrong rather than merely unclear, leave a
`TODO(wrong|misleading|composition)` mark instead of changing the meaning.

---

## 6. Naming

Name for the moment in the game, not the chain of states a lookup passes
through. `createStateWithRearEngagementRoutAwaitingPenalty` names the plumbing.
An `it` title states the fact the test proves.

Two names are already recorded as findings in `src/domain/AUDIT.md` and are
decisions, not cleanups — read them before renaming:

- `@testing`'s `createUnitWithPlacement` fabricates the unit through
  `createTestUnit`, which its name does not say. 34 specs call it.
- `@testing`'s `createTestUnit` accepts `cost`, `limit` and `morale` and ignores
  all three, so a spec that asks for a limit gets whatever the sample unit
  carries.

Both live in `@testing`, which is step 8 — the renames can land there, once
every caller has been read.

---

## Out of scope

Source code does not change. Assertions keep their meaning; only their
expression gets simpler. An assertion's expected value stays a literal — one
built from the same fixture as its setup agrees with the fixture instead of
checking the code.

## Boundary edges opened, already done

Two edges in `boundaries.ts` were missing rather than withheld. Both are now
open, and `pnpm validate` is clean.

- **`@procedures` may import `@factories`.** `@factories` sits below `@queries`,
  which `@procedures` already imported, so the transitive dependency existed and
  only the direct edge was missing — it had never been needed, so nobody had
  noticed. A procedure that builds an event may now reach the factory for it.
- **`@sampleValues` imports `@entities` as values, not types only.** It needs the
  schemas, not just the shapes. Its only importer is `@testing` (five modules)
  plus the domain barrel, and it has no other outgoing edge, which is what makes
  it cycle-proof.

## Get the samples out of the root barrel

Independent of the layer pass, and blocked on the consumers rather than on this
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
consumer's tests should not reach this package's sample data by any route. They
build their own values instead, and the shape they actually need is small: the
dominant pattern across those 62 files is `tempUnits[0]` and
`tempCommandCards[0]`, which is not a need for this catalog at all. It is a need
for one valid unit type and one valid command card. A local builder states what
the test cares about, where sample index 0 only happens to carry it.

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
`tempCommandCards[0]` with `commandCard(1, 0)`. Where a spec asserts on a cost, a
morale or a trait, pass it as an override so the test says what it depends on.

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

`@testing` is not exported either, and this does not change that. If a
consumer's tests ever want these fixtures, that is its own decision and its own
subpath, not a side effect of this.

While you are in `package.json`: the `exports` map declares `"."` →
`./dist/index.d.ts`, but there is no `src/index.ts` and tsdown has no root entry,
so that condition points at a file the build never writes. Anything importing
the bare package name resolves to nothing. Worth removing or giving a real
entry.

## Keep the legal samples, drop the rest

Decided: what is legal stays and gets used, and what is not goes. Surveyed
against the schemas today, after the move of the army rules into `@legality`.

**Keep `miniStarterArmy`, and invoke it.** `armySchemaForMode('mini')` accepts
both sides. Nothing calls it outside the barrel, and the one spec in this
package that needs an army —
`application/useCases/requestGameStateSnapshot.test.ts` — builds a local
`placeholderArmy` instead. That is the invocation: a legal army now exists, so no
spec needs to invent one, and a game-level test has something to start from. It
lands in step 9.

**Drop `tinyStarterArmy`,** both sides and its spec. It is illegal for mini: it
names seven cards, one of them `'Rally'`, which is not among the samples, and a
silent `.filter(card => card !== undefined)` leaves six where mini requires
eight. Its spec asserts only that the ids are well formed, so it passes while the
value it guards is unusable.

**Drop the five command cards that fail `commandCardSchema`,** leaving twenty:

| Card               | Fails on                                     |
| ------------------ | -------------------------------------------- |
| Strike             | `unitSupport.count`                          |
| Evade              | `roundEffect.modifiers`, `unitSupport.count` |
| Volley             | `roundEffect.modifiers`, `unitSupport.count` |
| Charge             | `roundEffect.modifiers`, `unitSupport.count` |
| Quincunx Formation | `roundEffect.modifiers`                      |

`miniStarterArmy` names none of the five, so it survives the cut untouched.

**The ordering matters, and here is why.** `tempCommandCards` begins Strike,
Evade, Volley, Charge — so its **first four entries are all illegal**, and
`tempCommandCards[0]` is Strike. `[0]` is the dominant pattern across the
consumer suites. Around sixty consumer specs are built on a command card that
does not parse, which is the strongest argument yet for giving them their own
builders. Dropping the five also shifts every index after it.

So: consumers off the samples first, then these drops, then the barrel block.
Doing it the other way round breaks sixty specs on values they should not have
been using.

## Still open, not part of this task

- The audit is suspended at `queries/sequencing/combatOutcomes`, `queries/unit`
  and `queries/unitPresence`, with four findings already written against them in
  `src/domain/AUDIT.md`. `factories/game` and `factories/unitLocation` are marked
  reopened, about 45 lines.

## Mutation testing

Stryker runs on TypeScript 5 beside the project's TypeScript 7. The cron
generates one job per boundary from `boundaries.ts`, then merges the shard
reports with `aggregateResultsByModule`. `ignoreStatic` is false. `entities`,
`events` and `game` are now excluded from `mutate`, which is sound because the
behaviour that was hiding in them has moved out to `queries`, `legality` and
`factories` where mutation still watches it. Per-test timeout is 20s and
`timeoutMS` 60000, so a Timeout now signals a real hang rather than a budget
shortfall — which matters, because Stryker scores a Timeout as Killed.

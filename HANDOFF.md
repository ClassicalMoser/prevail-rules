# Handoff — test readability overhaul

**State:** `main` clean and in sync with `origin/main`. 358 spec files, 1,894
tests, green in 12s. Typecheck, lint and format clean.

This is the work the audit is waiting on. The audit stalled at
`queries/sequencing` because the specs there were unreadable, and the same shape
repeats across the suite.

## The one rule this pass applies

Every change below is an instance of a single order of preference. For anything
a spec needs, in this order:

1. **A factory** builds a value from raw inputs.
2. **A transform** changes an existing state.
3. **A query** reads a state out of a state. Look it up; do not rebuild it.
4. **A fixture** in `@testing` does only what none of the first three can.
5. **Commentary** says what is happening in the game and why the rules want it.
6. **Naming** says it in the game's words, not the code's.

Work the points in order, one commit each. Measurements below are from `main`
today.

## The baseline: does the setup path reach the subject?

**This governs every point below.** A spec's layer sets what it may reach for;
`boundaries.ts` and [`LAYERS.md`](./LAYERS.md) are the authority, and the table
follows. But the table is the cheap check, not the real one. The real one is
whether the spec can **prove itself**: whether anything it imports ends up
calling the function under test.

**There is no cycle risk, and an earlier draft of this note was wrong to raise
one.** Nothing imports a spec file, so a spec can never sit on an import cycle —
not rarely, but structurally. A path like
`isFriendlyUnit.test.ts -> addUnitToBoard -> isFriendlyUnit` is a legal DAG, no
boundary violated, lint clean. Cycle detection cannot see it because there is no
cycle to see. Self-proof and circularity are different problems and only one of
them exists here.

**`pnpm check:selfProof` now enforces it** (`scripts/checkSelfProvingSpecs.ts`).
It builds the import graph from `boundaries.ts` and the imports themselves,
resolves each name through the barrels to the module that declares it, drops
type-only edges, and asks whether any non-subject import reaches the subject.
Nothing to keep in step by hand. Run it after every commit in this pass.

It flags exactly one spec today, and it is a real tautology:
`legality/choiceOptions/getLegalChooseMeleeResolutionEvents.test.ts:65` asserts
`isValidChooseMeleeResolutionEvent(o, state).result` is true for each option
`o` the subject returned — and `isValidMeleeResolutionEvent.ts:19` computes
`getLegalChooseMeleeResolutionEvents(state)` and checks membership. The
assertion is "every option the subject returned is among the options the
subject returned." It holds for any implementation. Fixing it means naming the
legal engagements as a literal; which engagements those are is a rules
question, so leave it for the human read unless told otherwise.

So: before reaching out of order, say what in the spec needs it and why — then
let the check answer whether it closes the loop.

Two worked cases, because they land on opposite sides:

- **`@sampleValues` is always safe.** Its only outgoing edge is `@entities`, so
  it can never reach any subject. 78 specs import it across nine layers; every
  one is fine, whatever the table says.
- **`addUnitToBoard` is not.** It imports `@queries` — `getBoardSpace`,
  `getOppositeFacing`, `hasEngagedUnits`, `hasSingleUnit`, `isFriendlyUnit`.
  `removeUnitFromBoard` adds `hasNoUnit` and `isSameUnitInstance`. For the
  specs of **those seven queries**, building a board with that transform makes
  the setup run the subject.

  None of the seven does today — each builds its state literally, which is why
  the check comes back with one hit and not eight. **Leave them that way.**
  They are the specs this pass is most likely to "improve" into uselessness,
  and the check is what tells you if it happens: adding
  `import { addUnitToBoard } from '@transforms'` to `isFriendlyUnit.test.ts`
  takes the count from 1 to 2.

**`@testing` launders the layer, not the proof.** `@testing` may import every
layer, which is why it is the licensed route from a lower-layer spec to a
higher-layer capability. But that also means a `@testing` helper can carry a
dependency on the subject without the spec showing it, which is worse than a
direct import because it is invisible at the call site.
`createBoardWithUnits` composes `addUnitToBoard`, so routing those seven specs
through `createGameStateWithUnits` would introduce exactly the self-proof they
currently avoid. Check what a helper composes before substituting it in, and
let `pnpm check:selfProof` confirm it.

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

**The suite already reaches upward, and the lint does not catch it.** Spec files
get `enforceBoundaries: false`, so only the ancestor and circular checks still
run on them. 146 specs import `@transforms`; **109 of them sit below it** — 47 in
`@queries`, 25 in `@legality`, 16 in `@validation`, 16 in `@procedures`, 5 in
`@expected`. Too large to unwind inside this pass, and most of it is probably
harmless by the test above. The instruction is narrower and firm: **add none,
and do not route a spec through a helper whose path reaches its subject.**
Record the 109 in `src/domain/AUDIT.md` as a finding for the human read, worth
sorting by whether each one can actually close a loop.

Baseline for `pnpm validate` after each commit: 358 files, 1,894 tests. The
count must not drop except for the single assertion named under point 4.

---

## 1. Factories

`placed(unit, coordinate, facing)` in `@testing` composes `@factories`'
`createUnitPlacement`. It is used **32 times in 6 files**. Hand-rolled
`placement: { … }` literals: **339 across 72 files** — 205 on one line, 132
spread over several.

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

Heaviest: `queries/attack/getMeleeSupportValue.test.ts` (39),
`legality/commanderMovement/exploreCommanderMoves.test.ts` (22),
`queries/line/getLineSegmentContainingUnit.test.ts` (19),
`validation/gameState/eachUnitPresentOnce.test.ts` (18),
`transforms/pureTransforms/sequencing/updateReverseState.test.ts` (14).

**Not all 339 are a `UnitWithPlacement`.** Some are overrides into a
`Partial<…>`; some are a bare `UnitPlacement` in a field such as a
`MoveUnitEvent`'s `to`. Those take `createUnitPlacement(coordinate, facing)`
from `@factories`. Check each site; do not pattern-replace blind.

Also in scope: the 16 `create*Event` player-choice factories and
`createEmptyGameState` / `createCardState` / `createOwnedCardState`. A spec that
casts or hand-writes a choice event uses the factory.

---

## 2. Transforms

Specs hand-roll the immutable updates the transforms own: **190 `...state`
spreads**, and **79 `boardState:` rebuilds across 30 files**. The canonical bad
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

**But only specs in `@transforms` and `@application` may call them directly.**
Everywhere below, the same spread goes through a `@testing` helper instead —
`createGameStateWithUnits`, `createGameStateWithSingleUnit` and
`createGameStateWithEngagedUnits` already exist and already compose
`createEmptyGameState` with `addUnitToBoard`. A `@queries` spec that writes
`createEmptyGameState('standard')` and then respreads `boardState` is doing by
hand, backward across a layer, what one `@testing` call does legitimately. That
is the substitution for those 47 files, not an `@transforms` import.

---

## 3. Queries

This is the point the earlier draft understated. `@queries` exports **37
state-reading getters**. Specs read nested state by property path **256 times
across 52 files**, and only **32 spec files import `@queries` at all**.

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

**The exception, and Cursor must honour it.** `STYLE.md`: read it through the
query that owns it _unless that query is the subject under test_, and below
`@queries` there is no such query — there, read the field the subject writes. So
`getCurrentPhaseState`'s own spec drills, and a `@transforms` or `@entities`
spec reads the field directly. Do not make a spec assert through its own
subject; that proves nothing.

The layer baseline applies here too, and it is why `@factories` and `@game`
specs are not in scope for this point — `@queries` is above them. Almost all 256
drill sites sit in `@queries` and above, so most of this stands as written. The
one place it does not: `getLegalRetreats` lives in `@legality`, so a `@queries`
spec cannot call it. See point 4.

---

## 4. Fixtures, for what the layer rule leaves

30 `createStateWith*` definitions under 13 names sit inside `describe` blocks;
in total **3,382 lines of helper definitions across 120 spec files** (the other
238 define none).

Do this point **after** 1 to 3. Its size depends on the layer, and this reverses
what an earlier draft of this note said. In `@transforms` and `@application`,
points 1 to 3 do most of the work and little residue is left. **Below
`@transforms`, a `@testing` helper is the only legitimate way for a spec to
reach a state that a transform builds** — so for the 47 `@queries` specs, the 25
in `@legality` and the rest, the fixture is not a leftover. It is the fix. Build
it rather than letting those specs keep importing upward.

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
assembled situation, once points 1 to 3 have shown you what each one actually
needs. `@testing` already exports 19 phase and substep helpers and 8 board
helpers, so check those first — the gap is a name for the whole situation, not
new primitives. A situation helper may import any layer, which is the point.

**One fixture is doing a query's job and must stop.**
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

**322 in-body comment lines, 0.8% of 38,940 spec lines**, against `STYLE.md`'s
25% in-body standard with JSDoc not counting toward it.

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
- **`@sampleValues` imports `@entities` as values, not types only.** It needs
  the schemas, not just the shapes. Its only importer is `@testing` (five
  modules) plus the domain barrel, and it has no other outgoing edge, which is
  what makes it cycle-proof.

## Get the samples out of the root barrel

Nothing in `@sampleValues` belongs in this package's production surface.
`src/domain/index.ts:582-588` re-exports `blackMiniStarterArmy`,
`blackTinyStarterArmy`, `tempCommandCards`, `tempUnits`, `whiteMiniStarterArmy`
and `whiteTinyStarterArmy`, so every consumer of `/domain` gets stand-in data
alongside the engine.

**Nothing uses a sample outside a spec** — 78 spec files here, 25 in the client,
37 in the server, and zero production modules in any repo. Consumers use exactly
four symbols: `tempCommandCards` (104 references), `tempUnits` (88),
`whiteTinyStarterArmy` (25) and `blackTinyStarterArmy` (4).

Removing the re-export breaks 62 consumer specs the moment it lands, so it goes
in three steps and the order matters.

- **Step 1 is done** (`79968b2`). `./sampleValues` is now its own build entry
  and package export, verified resolving from the client:
  `import { tempUnits } from '@classicalmoser/prevail-rules/sampleValues'`.
  Purely additive; nothing broke.
- **Step 2 — the consumers.** Point all 62 spec files at the new subpath: 25
  client test files, 37 server test files. Most import samples in the same
  statement as real domain symbols, so this is splitting an import rather than
  swapping a specifier. `pnpm validate` in each repo. The client and server
  depend on this package by `link:`, so `pnpm build` here first.
- **Step 3 — this package.** Delete the `@sampleValues` block from
  `src/domain/index.ts` and point this repo's own 78 specs at `@sampleValues`
  directly, which they may already do. Then `/domain` carries engine only.

`@testing` is deliberately not exported, and this does not change that. If
consumers' tests later want the fixtures, that is a second subpath and a
separate decision.

While you are in `package.json`: the `exports` map declares `"."` →
`./dist/index.d.ts`, but there is no `src/index.ts` and tsdown has no root
entry, so that condition points at a file the build never writes. Worth either
removing or giving a real entry.

## Still open, not part of this task

- `tinyStarterArmy` is illegal and pinned there by a spec that checks only its
  ids: it still asks for `'Rally'`, which is not among the 25 sample cards, and
  silently filters it out to six cards where mini needs eight. ~20 client specs
  depend on it. `miniStarterArmy` is legal and proved so against
  `armySchemaForMode('mini')`, but has no callers outside the barrel.
- 5 of the 25 sample command cards fail `commandCardSchema`. `miniStarterArmy`
  routes around them rather than settling whether the samples or the schema is
  wrong.
- The audit is suspended at `queries/sequencing/combatOutcomes`, `queries/unit`
  and `queries/unitPresence`, with four findings already written against them in
  `src/domain/AUDIT.md`. `factories/game` and `factories/unitLocation` are
  marked reopened, about 45 lines.

## Mutation testing

Stryker runs on TypeScript 5 beside the project's TypeScript 7. The cron
generates one job per boundary from `boundaries.ts`, then merges the shard
reports with `aggregateResultsByModule`. `ignoreStatic` is false. `entities`,
`events` and `game` are now excluded from `mutate`, which is sound because the
behaviour that was hiding in them has moved out to `queries`, `legality` and
`factories` where mutation still watches it. Per-test timeout is 20s and
`timeoutMS` 60000, so a Timeout now signals a real hang rather than a budget
shortfall — which matters, because Stryker scores a Timeout as Killed.

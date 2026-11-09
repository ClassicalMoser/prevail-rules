# Domain audit

The author personally reads and comprehends every line of code in this repo. This file tracks that reading. The process is [`AUDIT_PROCESS.md`](../../AUDIT_PROCESS.md).

This audit requires the human read on every directory. The read is by file, not by
commit. Marks in the files are what the read decides; the open findings below are
an index, not the reading path. A box is checked only after that read. A restart
opens a closed box only by saying so here.

**Last updated:** 2026-11-08

**Restart.** `entities`, `game`, and `events` stay closed. Every other checked box is open again. `utils` and `ruleValues` closed 2026-11-07, `sampleValues` 2026-11-08; scout is at `factories`.

**Scout baseline (2026-11-07, before `sampleValues`):** `pnpm test` 379 files / 1993 tests passed; `pnpm validate` clean.

**Scout baseline (2026-11-08, before `factories`):** `pnpm test` 379 files / 1995 tests passed; `pnpm validate` clean.

---

## Progress order

Audit in this order (dependencies flow downward):

1. Declarations: `utils` → `entities` → `game` → `events` → `ruleValues` / `sampleValues` / `factories`
2. Read / write engines: `queries` → `legality` → `expected` → `procedures` → `transforms` → `validation`
3. Support: `testing`
4. Above domain: `application/`
5. Suite: full `*.test.ts` run + coverage skim

---

## Domain packages

### `utils/` (`@utils`)

- [x] `utils/` — closed 2026-11-07
  - [x] Root modules (`assertExact`, `validationResult`, `stateSentinels`, `throwIfMissing`, `randomSource`)

### `entities/` (`@entities`)

- [x] `entities/` — conventions pass (README, declaration order, enum `AssertExact` trim, army composition → `@legality`)
  - [x] `army/`
  - [x] `attackType/`
  - [x] `board/`
  - [x] `card/`
  - [x] `engagementType/`
  - [x] `gameModes/`
  - [x] `line/`
  - [x] `player/`
  - [x] `unit/`
  - [x] `unitLocation/`
  - [x] `unitPresence/`

### `game/` (`@game`)

- [x] `game/` — structural split + polish (visibility on `CardState`, `commitment/`, phase enum asserts stripped)
  - [x] `cardState/`
  - [x] `commitment/`
  - [x] `game/`
  - [x] `gameState/`
  - [x] `phases/`
  - [x] `roundState/`
  - [x] `substeps/`
    - [x] `commandResolution/`
    - [x] `meleeResolution/`
    - [x] `rallyResolution/`
    - [x] `combatOutcomes/`
    - [x] `engagement/`

### `events/` (`@events`)

- [x] `events/`
  - [x] `expectedEvent/`
  - [x] `gameEffects/`
  - [x] `playerChoices/`
  - [x] Root modules (`eventType.ts`, `eventTypeLiterals.ts`, …)

### `ruleValues/` (`@ruleValues`)

- [x] `ruleValues/` — closed 2026-11-07
  - [x] Root modules (`ruleValues`, `traits`, `gameEffectTypes`, …)

### `sampleValues/` (`@sampleValues`)

- [x] `sampleValues/` — closed 2026-11-08
  - [x] Root modules (`tempCommandCards`, `tempUnits`, `miniStarterArmy`, …)

### `factories/` (`@factories`)

- [ ] `factories/` — scout complete 2026-11-08 (awaiting human read)
  - [ ] `board/` — split to one empty-board export per file
  - [ ] `game/` — reopened: `createOwnedCardState` and `createCardState` arrived
    ```
    after the read
    ```
  - [ ] `unit/`
  - [ ] `unitLocation/` — new: `createUnitPlacement`

### `queries/` (`@queries`)

Target layout mirrors `entities/` and `game/` nouns. Retire `boardSpace/`, `cards/`, and `equivalence/`. `sequencing/` keeps turn position only; substep narrowers follow `game/substeps`.

Walk folders in IDE order (alphabetical).

- [ ] `queries/` — scout (adversarial review) 2026-11-08; marks in place, awaiting human read
  - [ ] `attack/` — `applyAttackValue`, `getMeleeSupportValue`
  - [ ] `board/` — spaces, `diagonalIsClear`, `getCommanderSpace`
    - [ ] `adjacency/`
    - [ ] `areas/`
    - [ ] `steps/` — forward, forward to the edge, rearward
  - [ ] `card/` — owned and hidden slices, command match, initiative, commitment modifiers, modifier and restriction equality
  - [ ] `engagement/` — front, flank, rear, plus movement engagement getters
  - [ ] `facings/`
  - [ ] `gameOver/` — empty hand, unpayable rout discard, then the composed check
  - [ ] `line/` — `canJoinLine` (who qualifies) and `getLineSegmentContainingUnit` (the unbroken rank); windows of up to eight are chosen by the ends in `@legality` (S18)
  - [ ] `player/` — `getOtherPlayer`, `hasInitiative`
  - [ ] `sequencing/` — current phase, step, initiative, event number, event stream
    - [ ] `combatOutcomes/`
    - [ ] `commandResolution/`
    - [ ] `meleeResolution/`
    - [ ] `rallyResolution/`
  - [ ] `unit/` — stats, friendliness, support match, units on board, unit identity
  - [ ] `unitPresence/` — position, enemy in the space, at a placement

### `legality/` (`@legality`)

- [ ] `legality/`
  - [ ] `army/`
  - [ ] `choiceOptions/`
  - [ ] `commanderMovement/`
  - [ ] `game/`
  - [ ] `unitMovement/` — turning, path, terrain (2026-10-12 notes)

### `expected/` (`@expected`)

- [ ] `expected/`
  - [ ] `expectedEvent/`

### `procedures/` (`@procedures`)

- [ ] `procedures/`
  - [ ] `cards/`
  - [ ] `completePhase/`
  - [ ] `defenseResult/`
  - [ ] `movement/` — path on the mover (2026-10-12 notes)
  - [ ] `resolveAttack/`
  - [ ] Root modules (`procedureRegistry`, …)

### `transforms/` (`@transforms`)

- [ ] `transforms/`
  - [ ] `initializations/`
  - [ ] `pureTransforms/`
  - [ ] `stateTransitions/`

### `validation/` (`@validation`)

- [ ] `validation/`
  - [ ] `game/`
  - [ ] `gameState/`
  - [ ] `playerChoice/`

### `testing/` (`@testing`)

- [ ] `testing/` — helpers / fixtures align with current `@game` / `@entities` types
  - [ ] `bootstrapGameState/`
  - [ ] `createBoard/`
  - [ ] `phaseStateHelpers/`
  - [ ] `testHelpers/`
  - [ ] Root helpers (`createEmptyGameState`, `unitHelpers`, …)

---

## Application (above domain)

Import boundary: application may use `@validation` (and domain barrels), not `@legality` directly.

- [ ] `src/application/`
  - [ ] `composable/`
  - [ ] `ports/`
  - [ ] `process/`
  - [ ] `useCases/`
  - [ ] `utils/`

---

## Test suite

Colocated `*.test.ts` under `src/domain/**` and `src/application/**` (see `vitest.config.ts`). Depth inventory: `[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)`.

- [ ] Full suite green (`pnpm test` / `npm test`)
- [ ] Coverage skim (`pnpm test:coverage`) — note thin modules; no need to update percentage tables here
- [ ] Spot-check colocated tests for packages audited in this pass (especially after type / barrel moves)
- [ ] `@testing` still the only home for shared fixtures; no new inline mega-helpers in specs

---

## Open findings

Index only. Prefer the mark in the file. Each entry stays here until the human
read closes it.

### `queries/sequencing`

- Closed 2026-11-07. `getAwaitingRoutDiscardState` and the absence-message set in
  `getWinnerFromUnpayableRoutDiscard` are both gone. The walk and the question are
  separate now: `findRoutLocation` descends, `isAwaitingRoutDiscard` asks.
- `findRoutLocation` knows the four parents that hold a rout. `updateRoutState`
  descends to the same places to write, and the retreat-held one is written
  through `updateRetreatRoutState` instead. Two descents that have to agree, and
  nothing makes them.
- Three exports have no production caller: `getCurrentStep`,
  `getIsFirstPlayerForResolveRallyStep`, `getRallyResolutionState`.

### `queries` (scout 2026-11-08)

Marked in place. Highest weight first:

- `generateResolveMeleeEvent` (`procedures`): melee Defence commitments fixed in S14.
- `isEngagementFromFront`: front/flank/rear cover six of eight facings; 135° throws in `generateStartEngagementEvent`. `TODO(wrong)`.
- `getNextMeleeRoutState` and `getNextStepForResolveRally`: fixed in S13 (a paid rout is passed over; a non-resolve step throws).
- Seven more sequencing exports with no production caller (`rout/index.ts`).
- Line rule exists twice: `queries/line` (no caller) and `getLegalLineEndsForIssueCommand`.
- Duplicates: inspiration range, units-on-board walk, melee defender-to-slot ternary (7 copies), next-open-apply selection (3 variants), `getOtherPlayer` hand-rolled.
- Catch-to-false outside `legality`: `isAtPlacement`, `generateResolveRetreatEvent`.

Not marked; for the read:

- Melee/rally specs name a colour where the slot comes from the default `'black'` initiative (`getMeleeAttackApplyState`, `findRoutLocation`, `findRoutState`, `getNextMeleeRetreatStateAwaitingMove`, others). Some build states the game cannot reach.
- `getMeleeSupportValue` vs RULEBOOK.md's support example (D-4/E-5): the example looks inconsistent with back-space exclusion. Unverified.
- `engagement/engagement.ts` holds four exports; a split is due.
- Path-only modules (design finding): the `get…From…` field readers, the `…RoutState` / `…RetreatState` / `…ReverseState` descents, the five phase getters, `getCurrentInitiative`, `getCurrentEventStream`; outside sequencing, `getSpacesAhead`, `hasUnitInSet`, `setWithoutUnit` (no callers), `isSameUnitType` / `isSameInstanceNumber` (internal only).

### `legality`

- Twenty catches across fifteen files. Five wrap a whole function body; the rest
  are scoped to a single call.
- Four of the five discarded the fault entirely, so any error inside became a
  legal answer about the game. Three remain, all in `unitMovement/`, each
  with a `TODO(wrong)`: `canEngageEnemy`, `canMoveInto`, `canMoveThrough`.
  The fourth, `isLegalMove`, was removed in S8 (2026-11-09): a move's path is
  judged by `traceMovePath`, which throws and leaves the catch to validation.
- The fifth, `isValidLine`, kept the message in `errorReason`, so a fault there
  was reported rather than answered; it was removed in S18 (the line rule is now
  one segment query). That is the shape the others should take if they keep the
  catch at all.

### `transforms`

- Marked in `updateRoutState.ts` as `TODO(wrong)`. A rout held by a retreat can
  be opened and can have its penalty worked out, and then cannot be paid:
  `applyChooseRoutDiscardEvent` hands it to `updateRoutState`, which throws for
  it. A zero penalty also closes the nested rout without closing its retreat,
  which `getExpectedRetreatEvent` then refuses. Related to the two descents in
  `queries/sequencing`, above.

### `factories` and `testing`

Each is marked in its file.

- `createInitialGameState` (`factories`): four mode cases that call the same function.
- `createEmptyGameState` (`factories`): re-keys the board factories by size, as `coordinateLayoutMap` does for layouts. Its round-state comment calls the round completed; the round is the first one to be played.
- `createCommitToMeleeEvent` (`factories`): a stray fragment in the `@param` tag.

- `UnitPlacement` (`entities`): a `unit` prefix on a coordinate and a facing.
- `AssignUnitSupportEvent` (`events`): one of five fields documented.
- `createUnitWithPlacement` (`testing`): fabricates the unit through
  `createTestUnit`, which its name does not say.
- `createTestUnit` (`testing`): accepted `cost`, `limit` and `morale` and
  ignored all three. Closed 2026-11-09: they narrow the catalog like the stats.

### Movement (settled 2026-11-08)

The design document exists now: the decisions live in `RULEBOOK.md` (§5.1.4, §5.2, §6.3.2; appendix A2, A11, A3), and the work is cut in `SLICES.md`, Cluster 2.

1. A flexibility spend turns 45° or 180° (A2; slice S3).
2. The move event carries the path atomically, as deltas; the mover advances along it; movement stats sample once at move-start (A11, §5.1.4; slice S8).
3. Terrain stays deferred this pass; the stub in `getCurrentUnitStat` keeps its mark (A3).

---

## Stuck list

Questions from the human read that did not resolve in time. See `[AUDIT_PROCESS.md](../../AUDIT_PROCESS.md)`.

_None yet._

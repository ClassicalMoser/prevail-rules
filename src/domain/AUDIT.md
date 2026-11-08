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

- [ ] `queries/`
  - [ ] `attack/` — `applyAttackValue`, `getMeleeSupportValue`
  - [ ] `board/` — spaces, `diagonalIsClear`, `getCommanderSpace`
    - [ ] `adjacency/`
    - [ ] `areas/`
    - [ ] `steps/` — forward, forward to the edge, rearward
  - [ ] `card/` — owned and hidden slices, command match, initiative, commitment modifiers, modifier and restriction equality
  - [ ] `engagement/` — front, flank, rear, plus movement engagement getters
  - [ ] `facings/`
  - [ ] `gameOver/` — empty hand, unpayable rout discard, then the composed check
  - [ ] `line/` — segment, index, windows of at most 8, then `getLinesFromUnit` (`isValidLine` lives in `@legality`)
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

### `legality`

- Twenty catches across fifteen files. Five wrap a whole function body; the rest
  are scoped to a single call.
- Four of the five discard the fault entirely, so any error inside becomes a
  legal answer about the game. All four are in `unitMovement/` and each carries
  a `TODO(wrong)`: `canEngageEnemy`, `canMoveInto`, `canMoveThrough`,
  `isLegalMove`.
- The fifth, `isValidLine`, keeps the message in `errorReason`, so a fault there
  is reported rather than answered. That is the shape the other four should take
  if they keep the catch at all.

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
- `createTestUnit` (`testing`): accepts `cost`, `limit` and `morale` and ignores
  all three.

### Movement (not settled)

Revisit in `legality/unitMovement`, `procedures/movement`, and the movement transforms. Move this to the design document when that exists.

1. A flexibility spend turns 45° or 180°, not an arbitrary amount.
2. Keep a canonical path on the moving unit, written by hand or generated, for engagement and animation. The mover currently stays on its start hex while the target is stored beside it, so the move is only half-applied.
3. Terrain rules have firmed up and are not in the code yet. `getCurrentUnitStat` carries a terrain step that adds nothing until they are.

---

## Stuck list

Questions from the human read that did not resolve in time. See `[AUDIT_PROCESS.md](../../AUDIT_PROCESS.md)`.

_None yet._

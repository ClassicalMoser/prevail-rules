# Domain audit

The author personally reads and comprehends every line of code in this repo. This file tracks that reading. The process is [`AUDIT_PROCESS.md`](../../AUDIT_PROCESS.md).

This audit requires the human read on every directory. The read is by file, not by commit.

---

## Progress order

Audit in this order (dependencies flow downward):

1. Declarations: `utils` → `ruleValues` → `entities` → `events` → `game` → `sampleValues` / `factories`
2. Read / write engines: `queries` → `legality` → `expected` → `procedures` → `transforms` → `validation`
3. Support: `testing`
4. Above domain: `application/`
5. Suite: full `*.test.ts` run + coverage skim

---

## Domain packages

### `utils/` (`@utils`)

- [x] `utils/` — closed 2026-11-07; reopened 2026-11-12, changed since the read; closed again 2026-11-13
  - [x] Root modules (`assertExact`, `validationResult`, `stateSentinels`, `throwIfMissing`, `randomSource`)
  - [x] Arrived after the first read: `failFromFault`, `findIllegal` (was `findRefusal`), `haveSameMembers`, `literal`, `openChoice`

### `ruleValues/` (`@ruleValues`)

- [x] `ruleValues/` — closed 2026-11-07; reopened 2026-11-12, changed since the read; closed again 2026-11-13
  - [x] Root modules (`ruleValues`, `traits`, `gameEffectTypes`, …)
  - [x] Arrived after the read: `commitmentModifiers`

### `entities/` (`@entities`)

- [x] `entities/` — conventions pass (README, declaration order, enum `AssertExact` trim, army composition → `@legality`); reopened 2026-11-12, changed since the read; closed again 2026-11-13
  - [x] `army/`
  - [x] `attackResult/`
  - [x] `attackType/`
  - [x] `board/`
  - [x] `card/`
  - [x] `engagementType/`
  - [x] `gameModes/`
  - [x] `player/`
  - [x] `unit/`
  - [x] `unitLocation/`
  - [x] `unitPresence/`

### `events/` (`@events`)

- [x] `events/` — reopened 2026-11-12, changed since the read
  - [x] `expectedEvent/`
  - [x] `gameEffects/`
  - [x] `playerChoices/`
  - [x] Root modules (`eventType.ts`, `eventTypeLiterals.ts`, …)

### `game/` (`@game`)

- [ ] `game/` — structural split + polish (visibility on `CardState`, `commitment/`, phase enum asserts stripped); reopened 2026-11-12, changed since the read
  - [ ] `cardState/`
  - [ ] `commitment/`
  - [ ] `game/`
  - [ ] `gameState/`
  - [ ] `phases/`
  - [ ] `roundState/`
  - [x] `substeps/`
    - [x] `commandResolution/`
    - [x] `meleeResolution/`
    - [x] `rallyResolution/`
    - [x] `combatOutcomes/`
    - [x] `engagement/`

### `sampleValues/` (`@sampleValues`)

- [ ] `sampleValues/` — closed 2026-11-08; reopened 2026-11-12, changed since the read
  - [ ] Root modules (`tempCommandCards`, `tempUnits`, `miniStarterArmy`, …)

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
  - [ ] `board/` — spaces, `diagonalIsClear`, `findCommanderSpace`; `getSpacesApart` and `getGridPosition` arrived after the scout, and `unit/unitMatchesInspirationRange` was rewritten on them
    - [ ] `adjacency/`
    - [ ] `areas/`
    - [ ] `steps/` — forward, forward to the edge, rearward
  - [ ] `card/` — owned and hidden slices, command match, initiative, commitment modifiers, modifier and restriction equality
  - [ ] `engagement/` — front, flank, rear, plus movement engagement getters
  - [ ] `facings/`
  - [ ] `gameOver/` — empty hand, unpayable rout discard, then the composed check
  - [ ] `line/` — `canJoinLine` (who qualifies) and `getLineSegmentContainingUnit` (the unbroken rank); windows of up to eight are chosen by the ends in `@legality` (S18)
  - [ ] `player/` — `getOtherPlayer`, `hasInitiative`
  - [ ] `sequencing/` — current phase, step, initiative, event stream
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

- [ ] `expected/` — `findExpectedEvent` answers `undefined` for a finished game; `getExpectedEvent` insists
  - [ ] `expectedEvent/`

### `procedures/` (`@procedures`)

- [ ] `procedures/`
  - [ ] `cards/`
  - [ ] `sequencing/`
  - [ ] `defenseResult/`
  - [ ] `movement/` — path on the mover (2026-10-12 notes)
  - [ ] `resolveAttack/`
  - [ ] Root modules (`procedureRegistry`, …)

### `transforms/` (`@transforms`)

- [ ] `transforms/`
  - [ ] `pureTransforms/`
  - [ ] `stateTransitions/`

### `validation/` (`@validation`)

- [ ] `validation/` — one catch per entry point, through `failFromFault`; per-choice validators throw
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

Colocated `*.test.ts` under `src/domain/**` and `src/application/**` (see `vitest.config.ts`).

- [ ] Full suite green (`pnpm test` / `npm test`)
- [ ] Coverage skim (`pnpm test:coverage`) — note thin modules; no need to update percentage tables here
- [ ] Spot-check colocated tests for packages audited in this pass (especially after type / barrel moves)
- [ ] `@testing` still the only home for shared fixtures; no new inline mega-helpers in specs

---

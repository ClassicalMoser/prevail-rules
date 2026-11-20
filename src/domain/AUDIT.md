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
  - Arrived and read 2026-11-20: `boardSizes`, `boardLabels`, `boardCoordinates`, `boardLayouts` (moved from `entities/board/`, with each size now stated by its depth and frontage), and `gameModes` (moved from `entities/gameModes/`, its entry schema removed)

### `entities/` (`@entities`)

- [x] `entities/` — conventions pass (README, declaration order, enum `AssertExact` trim, army composition → `@legality`); reopened 2026-11-12, changed since the read; closed again 2026-11-13
  - Arrived after the read: `attackResult/`, `unitLocation/moveDelta`; `board/groundCover` (scaffold, replacing `terrainTypes` and `waterCover`)
  - Removed after the read: `line/` (nothing used it; lines are `LegalLine` in `@legality`)
  - Moved out 2026-11-20: the board vocabulary (`board/smallBoard/`, `standardBoard/`, `largeBoard/`, `boardCoordinates`) and `gameModes/` to `@ruleValues`, re-exported from the barrels; read. Arrived and read: `board/gridPosition`
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

- [ ] `events/` — reopened 2026-11-12, changed since the read
  - Scouted again 2026-11-13: every choice and effect says when it comes, its rule, and who writes and reads it. No marks left.
  - Scanned again 2026-11-20: every name in the comments resolves; every choice names the enumerator that offers it and every effect its own generator and apply, in matching folders; every § cited points at the rule it describes. Six marks from before still hold. Four new marks: `setupUnit.ts` (file name, and §3.5.4 cited for §3.5.1/§3.5.3), `resolveFlankEngagement.ts` ("beside" for "in" the defender's space), `completeUnitMovement.ts` (only a front engagement waits).
  - Changed 2026-11-20, for the next read: a front engagement sets the engaging unit down in the defender's space at `startEngagement`, as a rear one does; `startEngagement` records `engagingSpeed`, sampled where the move began, and the front engagement compares against it. `completeUnitMovement` sets nobody down; its mark is settled by the change.
  - Settled 2026-11-20: `resolveFlankEngagement.ts` now says the attacker is set down in the defender's space; its mark is gone.
  - Settled 2026-11-20: `resolveMelee` names each result for the unit that takes it, `attackResultOnWhiteUnit` and `attackResultOnBlackUnit`; its mark is gone.
  - Settled 2026-11-20: `gameEffects/index.ts` links the `applyEffects` README for the design notes and no longer points at another module's header; a document for fuller context is fine (author).
  - Arrived after the read, among others: `roundEnd`, `openRetreatFromEngagement`, `completeRangedAttack`, `chooseMovingUnit`, `chooseShooter`, `commitToRangedDefense`
  - Changed after the read, for the next one: `ProjectedEvent` and its schema in `eventType.ts`; events carry no number, order is the place in the round; a rout discard carries its full cards.
  - Changed 2026-11-20, for the next read: events name units by who they are, not where they stand. `chooseMovingUnit.unit`, `chooseShooter.unit`, `performRangedAttack.targetUnit` and `supportingUnits` are `UnitInstance`; `startEngagement.defenderWithPlacement` is `defendingUnit`; `moveCommander.from` is gone. Where each stands is read from the game state's index.
  - [x] `expectedEvent/`
  - [ ] `gameEffects/`
  - [ ] `playerChoices/`
  - [ ] Root modules (`eventType.ts`, `eventTypeLiterals.ts`, …)

### `game/` (`@game`)

- [ ] `game/` — structural split + polish (visibility on `CardState`, `commitment/`, phase enum asserts stripped); reopened 2026-11-12, changed since the read
  - Changed after the read, for the next one: a game state is four named visibility variants over a shared base, not a type argument (`gameState/`); round state is split into authoritative and seen (`roundState/`); a `Game` holds the authoritative state only.
  - Arrived 2026-11-20, for the next read: `gameState/gameStateIndex` — every state view carries `index`, where every unit and commander is by name, kept by the writers and checked by `refineGameStateIndex`. Its finders, writers and refine live in `@queries/gameStateIndex`, `@transforms` and `@legality/game`.
  - [ ] `cardState/`
  - [ ] `commitment/`
  - [ ] `game/`
  - [ ] `gameState/`
  - [ ] `phases/`
  - [ ] `roundState/`
  - [ ] `substeps/`
    - [ ] `commandResolution/`
    - [ ] `meleeResolution/`
    - [ ] `rallyResolution/`
    - [ ] `combatOutcomes/`
    - [ ] `engagement/`

### `sampleValues/` (`@sampleValues`)

- [ ] `sampleValues/` — closed 2026-11-08; reopened 2026-11-12, changed since the read
  - [ ] Root modules (`tempCommandCards`, `tempUnits`, `miniStarterArmy`, …)
  - Arrived after the read: `cardsAtInitiative`, `standardStarterArmy`

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

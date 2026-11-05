# Domain audit

The author personally reads and comprehends every line of code in this repo. This file tracks that reading. The process is [`AUDIT_PROCESS.md`](../../AUDIT_PROCESS.md).

This audit requires the human read on every directory. A box is checked only after that read. Closed boxes stay closed.

**Last updated:** 2026-11-04

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

- [x] `utils/`
  - [x] Root modules (`assertExact`, `validationResult`, `serializationSentinels`, `throwIfMissing`, …)

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

- [x] `ruleValues/`
  - [x] Root modules (`ruleValues`, `traits`, `gameEffectTypes`, …)

### `sampleValues/` (`@sampleValues`)

- [x] `sampleValues/`
  - [x] Root modules (`tempCommandCards`, `tempUnits`, `tinyStarterArmy`, …)

### `factories/` (`@factories`)

- [x] `factories/`
  - [x] `board/`
  - [ ] `game/` — reopened: `createOwnedCardState` and `createCardState` arrived
        after the read
  - [x] `unit/`
  - [ ] `unitLocation/` — new: `createUnitPlacement`

### `queries/` (`@queries`)

Target layout mirrors `entities/` and `game/` nouns. Retire `boardSpace/`, `cards/`, and `equivalence/`. `sequencing/` keeps turn position only; substep narrowers follow `game/substeps`.

Walk folders in IDE order (alphabetical).

- [ ] `queries/`
  - [x] `attack/` — `applyAttackValue`, `getMeleeSupportValue`
  - [x] `board/` — spaces, `diagonalIsClear`, `getCommanderSpace`
    - [x] `adjacency/`
    - [x] `areas/`
    - [x] `steps/` — forward, forward to the edge, rearward
  - [x] `card/` — owned and hidden slices, command match, initiative, commitment modifiers, modifier and restriction equality
  - [x] `engagement/` — front, flank, rear, plus movement engagement getters
  - [x] `facings/`
  - [x] `gameOver/` — empty hand, unpayable rout discard, then the composed check
  - [x] `line/` — segment, index, windows of at most 8, then `getLinesFromUnit` (`isValidLine` lives in `@legality`)
  - [x] `player/` — `getOtherPlayer`
  - [ ] `sequencing/` — current phase, step, initiative, event number, event stream
    - [ ] `combatOutcomes/`
    - [x] `commandResolution/`
    - [x] `meleeResolution/`
    - [x] `rallyResolution/`
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

Each finding stays here until the human read closes it.

### `queries/sequencing`

- `getAwaitingRoutDiscardState` throws when the slice it selected is absent. `getWinnerFromUnpayableRoutDiscard` catches only those absence messages, because the win check runs on states where no rout slice is open. Any other throw propagates.

### `queries/unit` and `queries/unitPresence`

- `getCurrentUnitStat` still has a terrain step that adds nothing.
- `getPlayerUnitWithPosition` returns the secondary unit without checking its side when the primary is not the asked side.
- `hasEnemyUnit` treats any engagement as an enemy for both players and does not compare the two sides.
- `matchesUnitRequirements` requires every listed trait. An older note said "at least one". The comment now matches the code. Confirm that the code is right.
- One `matchesUnitRequirements` case expected `true` under a title that said it returns false. The title now matches the assertion. Confirm the fact.
- The command-modifier case titled as a missing `modifiers` field sets that list to `[]`. The `?? []` branch is not what that case builds.

### `factories` and `testing`

- `AssignUnitSupportEvent` documents one of its five fields. Every other player
  choice event documents all of them. `entities` and `events` are closed, so
  this is recorded rather than filled in.

- `UnitPlacement` carries a `unit` prefix for a value that is a coordinate and a
  facing, with nothing unit-specific in it. Renaming the entity reaches every
  layer, so it is recorded rather than done.
- `@testing`'s `createUnitWithPlacement` fabricates the unit through
  `createTestUnit`, which its name does not say. `createTestUnitWithPlacement`
  would match `createTestUnit` and `createTestCard`. 34 specs call it, so the
  rename is its own decision.
- `@testing`'s `hiddenCards` was written and removed in the same pass. Production
  derives a hidden card state through `toHiddenCardState` and
  `projectGameForVisibility` and never constructs one, so a builder for it would
  be a second authority on a value the engine computes — the same shape of
  problem as `createRetreatState` inventing `legalRetreatOptions`.
- `@testing`'s `createTestUnit` accepts `cost`, `limit` and `morale` and
  ignores all three. A spec that asks for a limit gets whatever the sample unit
  carries.

### `sampleValues`

- 5 of the 25 sample command cards fail `commandCardSchema`. `Strike`,
  `Evade`, `Volley` and `Charge` have a unit support count of 0 where the
  schema asks for at least 1. `Evade`, `Volley`, `Charge` and
  `Quincunx Formation` have no round effect modifiers where the schema asks
  for one. Either the samples or the schema is wrong. An army holding any of
  them fails `armySchema`.

### Movement (not settled)

Revisit in `legality/unitMovement`, `procedures/movement`, and the movement transforms. Move this to the design document when that exists.

1. A flexibility spend turns 45° or 180°, not an arbitrary amount.
2. Keep a canonical path on the moving unit, written by hand or generated, for engagement and animation. The mover currently stays on its start hex while the target is stored beside it, so the move is only half-applied.
3. Terrain rules have firmed up and are not in the code yet.

---

## Stuck list

Questions from the human read that did not resolve in time. See [`AUDIT_PROCESS.md`](../../AUDIT_PROCESS.md).

_None yet._

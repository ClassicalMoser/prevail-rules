# Domain audit

Running checklist for a **manual, end-to-end conventions audit** of the rules engine (declarations, schema-first, import boundaries, barrels, commentary, colocated tests). Work **up the dependency tree**; check a box only when that package (or subdirectory) has been walked and brought in line.

**Not** the per-module unit-test inventory — that remains `[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)`. Suite health for this audit means: relevant tests still pass, coverage gaps noted, and `@testing` helpers match current types.

**Criteria (shared):** see `[entities/README.md](./entities/README.md)` (schema-first, declaration order, enum `AssertExact` skip, `.strict()`, barrels). Package-specific notes live in each package README when present.

**Last updated:** 2026-09-29

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
  - [x] `typeGuards/`
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
  - [x] `typeGuards/`

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
  - [x] `game/`
  - [x] `unit/`

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
  - [ ] `engagement/` — front, flank, rear, plus movement engagement getters
  - [ ] `facings/`
  - [ ] `gameOver/`
  - [ ] `line/` — `getLinesFromUnit`, `isValidLine`
  - [ ] `player/` — `getOtherPlayer`
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
  - [ ] `unitMovement/`

### `expected/` (`@expected`)

- [ ] `expected/`
  - [ ] `expectedEvent/`

### `procedures/` (`@procedures`)

- [ ] `procedures/`
  - [ ] `cards/`
  - [ ] `completePhase/`
  - [ ] `defenseResult/`
  - [ ] `movement/`
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
  - [ ] `entityTypeGuards/`
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

## Notes / blockers

_Add short dated notes as the audit proceeds._

- 2026-09-20 — `entities` + `game` closed for this pass. Next: `events` (or `utils` if wanting a true bottom-up start).

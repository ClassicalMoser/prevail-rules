# Domain audit

Running checklist for a **manual, end-to-end conventions audit** of the rules engine (declarations, schema-first, import boundaries, barrels, commentary, colocated tests). Work **up the dependency tree**; check a box only when that package (or subdirectory) has been walked and brought in line.

**Not** the per-module unit-test inventory — that remains `[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)`. Suite health for this audit means: relevant tests still pass, coverage gaps noted, and `@testing` helpers match current types.

**Criteria (shared):** see `[entities/README.md](./entities/README.md)` (schema-first, declaration order, enum `AssertExact` skip, `.strict()`, barrels). Package-specific notes live in each package README when present.

**Last updated:** 2026-09-20

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
  - [ ] `typeGuards/`

### `events/` (`@events`)

- [ ] `events/`
  - [ ] `expectedEvent/`
  - [ ] `gameEffects/`
  - [ ] `playerChoices/`
  - [ ] Root modules (`eventType.ts`, `eventTypeLiterals.ts`, …)

### `ruleValues/` (`@ruleValues`)

- [ ] `ruleValues/`
  - [ ] Root modules (`ruleValues`, `traits`, `gameEffectTypes`, …)

### `sampleValues/` (`@sampleValues`)

- [ ] `sampleValues/`
  - [ ] Root modules (`tempCommandCards`, `tempUnits`, `tinyStarterArmy`, …)

### `factories/` (`@factories`)

- [ ] `factories/`
  - [ ] `unit/`

### `queries/` (`@queries`)

- [ ] `queries/`
  - [ ] `boardSpace/`
  - [ ] `cards/`
  - [ ] `engagement/`
  - [ ] `equivalence/`
  - [ ] `facings/`
  - [ ] `gameOver/`
  - [ ] `sequencing/`
  - [ ] `unit/`
  - [ ] `unitPresence/`
  - [ ] Root-level query modules (e.g. `applyAttackValue`, `calculateInitiative`, `getLine`, …)

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

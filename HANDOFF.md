# Handoff — test readability overhaul

**State:** `main` clean and in sync with `origin/main`. 358 spec files, 1,894
tests, green in 12s. Typecheck, lint and format clean.

This is the work the audit is waiting on. The audit stalled at
`queries/sequencing` because the specs there were unreadable, and the same
shape repeats across the suite. Measured on `main` today:

- 38,940 spec lines across 358 files.
- 3,382 of them (8.7%) are helper definitions living inside spec files — 170
  definitions across 120 files. The other 238 files define none.
- 322 in-body comment lines, 0.8% of spec lines, against `STYLE.md`'s standard
  of 25% in-body (JSDoc not counting toward it).

Do the four tasks in order, one commit each, mechanical before semantic, so
the diff stays readable. `pnpm validate` after each. The test count must not
drop except for the single assertion named in task 2.

---

## 1. Put every unit on the board with `placed()`

The biggest win and the cheapest. `@testing`'s `placed(unit, coordinate, facing)`
already exists and composes `@factories`' `createUnitPlacement`. It is used 32
times in 6 files. Meanwhile there are **339 hand-rolled `placement: { … }`
literals across 72 files** — 205 written on one line, 132 spread over several:

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

Heaviest files: `queries/attack/getMeleeSupportValue.test.ts` (39),
`legality/commanderMovement/exploreCommanderMoves.test.ts` (22),
`queries/line/getLineSegmentContainingUnit.test.ts` (19),
`validation/gameState/eachUnitPresentOnce.test.ts` (18),
`transforms/pureTransforms/sequencing/updateReverseState.test.ts` (14).

**Not every one of the 339 is a `UnitWithPlacement`.** Some are overrides into a
`Partial<…>`, and some are a bare `UnitPlacement` in a field such as a
`MoveUnitEvent`'s `to`. Those take `createUnitPlacement(coordinate, facing)`
from `@factories` instead. Check each site; do not pattern-replace blind.

Expect roughly a thousand lines of setup to disappear.

---

## 2. Stop `createRetreatState` inventing legal retreat options

`testing/phaseStateHelpers/substepStates.ts` defaults `legalRetreatOptions` to
E-4 and E-6 facing north. `STYLE.md` now says no fixture supplies a value the
engine computes — run the function that computes it. A spec that asserts on
retreat options while inheriting this default is agreeing with the fixture.

18 specs call `createRetreatState`; 10 touch `legalRetreatOptions`. Most already
pass an explicit override, which is correct and stays. Make the parameter
required, per the project's explicitness rule, so no spec can inherit two
options it did not ask for. `substepStates.test.ts:20` asserts the default has
length 2 — that assertion goes with the default.

---

## 3. Name the situations the specs keep rebuilding

30 `createStateWith*` definitions under 13 distinct names sit inside `describe`
blocks. They do **not** duplicate `@testing` primitives — `@testing` already
exports 19 phase and substep helpers and 8 board helpers, and these local
helpers compose them. What is missing is one level up: a name for the assembled
game situation.

Every one of them walks the same chain, threading the state by hand and
re-spreading it at each step:

```
createEmptyGameState(mode)
  → addUnitToBoard, re-spread into { ...state, boardState }
  → create<X>ResolutionState(state, { substep })
  → create<Y>PhaseState(state, { resolution })
  → updatePhaseState(state, phaseState)
```

The state is passed three times. 206 specs call `createEmptyGameState`, 130 call
`updatePhaseState`, 58 call `addUnitToBoard`.

Add `src/domain/testing/situations/`, one helper per combat situation, each
taking the units it positions and returning the `GameState`. The 13 local names
collapse to roughly six: ranged-attack apply, melee apply (taking the routing
player), rear engagement, and the retreat / rout / reverse substeps hanging off
them.

Name them for the moment in the game, not for the state chain. `STYLE.md`: a
reader who knows the game but not the rest of the codebase should follow it.
`Navigates: MeleeResolutionState -> AttackApplyState -> RetreatState` is the
kind of name to avoid.

Four sites in three files bypass the helpers altogether and inline a raw substep
literal — `createStateWithRearEngagementRoutAwaitingPenalty` in
`applyResolveRoutEvent.test.ts` writes a `routState: { … }` object directly.
Route those through `createRoutState`.

---

## 4. Commentary

0.8% to the `STYLE.md` standard. Additive only. Never overwrite an existing
human comment — that is the standing invariant in `AUDIT_PROCESS.md`. Where
something reads as wrong rather than unclear, leave a
`TODO(wrong|misleading|composition)` mark instead of changing the meaning.

---

## Rules this pass must keep

From `STYLE.md` and `AUDIT_PROCESS.md`:

- Setup only. An assertion's expected value stays a literal. A value built from
  the same fixture as the setup agrees with the fixture instead of checking the
  code.
- No factory, transform or fixture supplies a value the engine computes.
- Read an asserted value through the query that owns it, unless that query is
  the subject under test. Below `@queries` there is no such query; read the
  field the subject writes.
- A helper stays in a spec only when its meaning is strictly limited to the
  module under test. That case is rare.
- Explicitness over inference, everywhere.
- Source code is not in scope. Assertions keep their meaning; only their
  expression gets simpler.

---

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
reports with `aggregateResultsByModule`. `ignoreStatic` is false.
`entities`, `events` and `game` are now excluded from `mutate`, which is sound
because the behaviour that was hiding in them has moved out to `queries`,
`legality` and `factories` where mutation still watches it. Per-test timeout is
20s and `timeoutMS` 60000, so a Timeout now signals a real hang rather than a
budget shortfall — which matters, because Stryker scores a Timeout as Killed.

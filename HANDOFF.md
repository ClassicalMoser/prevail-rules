# Handoff

**State:** 21 commits on `main`, unpushed. 350 spec files, 1,863 tests, typecheck,
lint and format clean. `git push` from this repo.

## Done

- `AUDIT_PROCESS.md` rewritten as a run-ahead scout pass: inline `TODO(wrong|
misleading|composition)` marks instead of a separate report, commentary additive
  only, specs judged by composition rather than volume, assertion values stay
  literal. `AUDIT_FINDINGS.md` holds the measurements behind it — a dated
  snapshot, not a dashboard.
- Three value-fixture families moved to `@factories`, because production wants
  them: `createUnitPlacement`; `createOwnedCardState` / `createCardState` (which
  `createEmptyGameState` now composes instead of inlining twenty lines); and all
  sixteen `create*Event` player-choice factories (the client builds choice events
  in 80 files, the server in 8).
- `@testing` keeps only `placed`, which composes a factory. `placement`,
  `ownedCards`, `cardState`, `hiddenCards` and `withCards` were deleted — the
  first three were factories misfiled, the last two duplicated a transform.
- `MeleeModifier`, `MovementModifier`, `RangedAttackModifier` exported from
  `@events`; they allow different members and indexing the event hid that.
- All 49 event literals in the domain read `eventType, choiceType, player,
eventNumber`, then particulars. The 13 that didn't are factory calls now.
- Fixed in `prevail-client` (pushed): a spectator saw a facedown card as known,
  and `gameStorage` accepted a cross-visibility update. Engine is seedable;
  `Math.random` only in its wrapper.

## Next

1. **The situation tier.** 29 helpers are redefined across 53 specs — 75
   definitions, 1,169 lines. `createStateWith{Melee|RangedAttack}{Apply|Retreat|
Rout|Reverse}` (8 names, 23 copies), phase-step positioners (7 names, 18
   copies), visibility projections (3 names, 6 copies). These are compositions, so
   they belong in `@testing`, not `@factories`.
2. **Resume the audit at `queries/unit` and `queries/unitPresence`** — next in
   dependency order, small, and `AUDIT.md` already holds four findings against
   them. First real run of the revised process.
3. `factories/game` and `factories/unitLocation` are marked reopened in
   `AUDIT.md`: modules arrived after the read. ~45 lines.

## Blockers

- **No legal playable army exists.** `tinyStarterArmy` ships 6 command cards
  where Mini requires 8 (4 initiatives x 2), asks for 7 by name, and `'Rally'`
  is not among the 25 in `tempCommandCards`. Blocks any game-level test.

## Mutation testing (no longer blocked)

Stryker runs on TypeScript 5 beside the project's TypeScript 7. The cron
generates one job per boundary from `boundaries.ts` and the exclusions in
`stryker.config.json`, then merges the shard reports with
`aggregateResultsByModule` — a new boundary is covered without editing the
workflow. `ignoreStatic` is false, so static mutants are tested.

Cost tracks staticness rather than size: `game` is about an hour, because it is
almost entirely module-level schema construction and every mutant there forces
a whole-suite run. `queries`, `transforms` and `validation` together are 5-10
minutes, since `coverageAnalysis: perTest` narrows a mutant in a function body
to the tests that cover it. So mutation over the rule-bearing code is cheap
enough to run per audit scope.

Open findings live in `src/domain/AUDIT.md`.

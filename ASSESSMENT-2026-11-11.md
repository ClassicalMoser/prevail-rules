# Current state — 2026-11-11

What is still open in `prevail-rules`, and nothing else. It replaces the
working assessment of the past week, whose run logs, scout reports and closed
findings are in version control (the last commit before this rewrite). It was
written from that assessment and the code, not from a new full scan, so it
lists what is known to be open, not everything that could be found.

The gate: `pnpm validate` clean and `pnpm test` passing.

## Where the engine stands

A game can be played from start to finish through the four engines
(ENGINES.md): `startNewGame` places both armies in reserve and deals their hands;
round 0 is setup, White first (White holds the initiative going into round
one, §3.3.2), then Black, each placing its whole army in one `setupUnits`; a
`roundEnd` effect then begins round 1; each round runs its five phases and ends
with `roundEnd`; the game ends when a hand is empty, a rout cannot be paid, or an
army is gone (§11). Every event stream, round 0's included, is opened when its
round begins and flushed when the next begins.

The design rules new work follows are in [`DESIGN.md`](./DESIGN.md) (layers, faults,
events and rounds) and [`src/domain/ENGINES.md`](./src/domain/ENGINES.md).

## Open: design questions for the author's walk

These are the author's, and are left for the read.

1. **The five `TODO(…)` marks in the code.**
   - The empty-board lookup by size in `createEmptyGameState` could belong to
     `@factories/board`.
   - `getMeleeAttackApplyState`'s `player` is the defender; the defender-to-slot
     ternary is written in several writers.
   - A rally's rout slot has no `'bypassed'` (`getRoutStateFromRally`).
   - The rout getters `findRoutLocation` replaced (`rout/index.ts`).
   - `@testing`'s `createUnitWithPlacement` fabricates its unit
     (`testing/testHelpers/unitWithPlacement.ts`).
2. **Route readers the game no longer calls.** `getMeleeRetreatState`,
   `getRangedAttackRetreatState`, `getRangedAttackRoutState`, `getMeleeRoutState`,
   `getRearEngagementRoutState`, `getRoutStateFromRally`, `getNextMeleeRoutState`
   and `getMeleeReverseState` belong to the combatOutcomes reader model (its
   README), but nothing in the game calls them now that the routers and the
   state-naming queries answer. The same question as the rout getters' TODO:
   delete each, or name the caller it waits for.
3. **Unwired integrity checks.** `eachCardPresentOnce` has no caller, and
   `eachUnitPresentOnce` is not run where a game is loaded. Both are meant for
   periodic integrity checks not yet built.
4. **`LegalPlayerChoiceOptions`** is a hand-kept union, tied to the choice types
   only through the options router's return type.
5. **`completeMovementCommand`** still re-runs `getLegalMoveUnits` in its
   transform and keeps the movers that can move. The expected engine asks for it
   only when nobody can, so the filter never keeps anyone; the ranged twin lost the
   same filter when a shot got its own effect. Movement has no skip rule, so this
   is dead code rather than a rule divergence.
6. **`getEngagementEndFacing`** answers `undefined` when there is nothing to
   engage, so by the find/get rule it is a `find`.
7. **Setup beyond the bare board.** Round 0 is the bare-board deployment
   (§3.5.4). The full sequence (bid, scenario, veto, Black deploying first while
   White keeps the initiative) is not built (RULEBOOK appendix A5). The author's
   idea of storing each round's length and dropping the round number is not
   built either.

## Open: applies that find facts (study 2026-11-14)

Decided 2026-11-14: an apply reads only where the game is, which slot it writes, and what the state holds by identity. Rule derivations move out, next-step decisions move to the expected engine (new effects where needed), and behaviour does not change. A line order carries its full unit list, checked by validation.

1. **Rule derivations inside applies.** Done 2026-11-14: a line order lists its units (`getLineBetweenEnds` left the apply), and completing a Move order no longer asks `getLegalMoveUnits`. Reread and found not to be rule questions: `hasEnemyUnit` in `applyMoveUnitEvent` reads who stands at the destination, and the units losing support in `applyAssignUnitSupportEvent` are the fixed consequence of §10.4.6.
2. **Next-step decisions inside applies** (branching on a condition of the state). Done 2026-11-14:
   - Units left to act: `applyCompleteUnitMovementEvent` and `applyCompleteRangedAttackEvent` only clear their part; the expected engine asks for `completeMovementCommand` or `completeRangedAttackCommand`.
   - Both cards chosen: the expected engine asks for `revealCards` on the `chooseCards` step; the `revealCards` step is gone.
   - A unit already placed by a rear engagement: `applyCompleteUnitMovementEvent` reads the movement's record of where the mover stands.

   Waiting, because each needs a new effect type in `ruleValues/gameEffectTypes.ts`, which is closed:
   - Orders left: `commandsLeft.length > 0` in `applyIssueCommandEvent`. The expected engine would ask for an effect that begins carrying out the orders once none are left to issue.
   - A fallen commander's move skipped: `getMoveCommandersStepFrom` in `applyCompletePlayCardsPhaseEvent` and `applyMoveCommanderEvent` (§4.2.8). The expected engine would ask for an effect that passes over the move of a player whose commander is lost.

   Allowed, since they branch on the event or the slot: a zero penalty closes the rout; no retreat paths means the defender stands; a retreat from a front engagement also ends it; what `settleRout` closes; the cleanup step after a rally (`getNextStepForResolveRally` maps one step to the next).

3. **Validation inside applies.** Done 2026-11-14: the chosen retreat is no longer looked up among those offered; the move, retreat and issue applies read their destination and spent order through `getPlacementAfterPath` and `getMatchingCommand`, which throw as faults; only the issuing player may stop is gone.
4. **Uncertain.** `getAttackApplyAwaitingOpen` and `getAttackApplyToClose` pick a melee slot by resolution order, which follows the initiative. `findRetreatAwaitingRout` finds its slot by "no legal retreat path".

## Deferred: style, until just ahead of the walk

The author runs these during the walk, once implementation holds still.

- Many spec titles begin with "should" or "given".
- In-body commentary is well under STYLE's 25%, most of all in transforms,
  procedures, application and specs (`pnpm check:commentary`).
- `as never` / `as unknown` casts in specs, each to be checked for the STYLE
  comment.
- Spec rework generally.

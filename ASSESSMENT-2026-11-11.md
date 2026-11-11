# Current state — 2026-11-11

What is still open in `prevail-rules`, and nothing else. It replaces the
working assessment of the past week, whose run logs, scout reports and closed
findings are in version control (the last commit before this rewrite). It was
written from that assessment and the code, not from a new full scan, so it
lists what is known to be open, not everything that could be found.

The gate: `pnpm validate` clean and `pnpm test` passing (2454 tests).

## Where the engine stands

A game can be played from start to finish through the four engines
(ENGINES.md): `startNewGame` places both armies in reserve and deals their hands;
round 0 is setup, White first (White holds the initiative going into round
one, §3.3.2), then Black, each placing its whole army in one `setupUnits`; a
`roundEnd` effect then begins round 1; each round runs its five phases and ends
with `roundEnd`; the game ends when a hand is empty, a rout cannot be paid, or an
army is gone (§11). Every event stream, round 0's included, is opened when its
round begins and flushed when the next begins.

The design has settled on these, and new work follows them:

- **One source for each fact.** An event names a unit by identity and carries
  only what the state does not already hold: a result the procedure measured
  (an `AttackResult`, retreat paths, a penalty, a facing). Which slot an effect
  writes to is the state's to say, through a `@queries` reader
  (`findRoutLocation`, `getRetreatAwaitingRout`, `getAttackApplyToClose`,
  `getAttackApplyAwaitingOpen`, `getMeleeCombatants`), never a context field
  on the event.
- **Layers.** Only a query walks the state; only a transform writes it; an
  event apply composes queries and transforms. No block is inlined, least of
  all one written elsewhere too.
- **Faults.** Asking a question that should not be asked throws a clear,
  specific message. There is no soft second guard behind the gate's owner, and
  only the validation entry point catches.
- **Choices too large to list** are offered a part at a time (`OpenChoice`),
  and the validator walks the offers.

## Open: design questions for the author's walk

These are the author's, and are left for the read.

1. **The six `TODO(…)` marks in the code.**
   - `UnitPlacement` is not specific to a unit (`entities/unitLocation/unitPlacement.ts`).
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

## Deferred: style, until just ahead of the walk

The author runs these during the walk, once implementation holds still.

- 700 of 2402 spec titles begin with "should" or "given".
- In-body commentary is 13% of source lines against STYLE's 25% (transforms and
  procedures 8%, application 7%) and 4% in specs (`pnpm check:commentary`).
- 28 `as never` / `as unknown` casts in specs, each to be checked for the
  STYLE comment.
- Spec rework generally.

## Open: a rule question

- **Does a routing unit carry out its retreat first?** §7.5.3 says a unit that
  reaches Rout "may ignore its own retreat and reverse"; §7.5.6 says a unit
  going to rout stays on the board until the rout stage, so the unit engaged with
  it does not reverse. The attack-apply factory always bypasses a routing unit's
  retreat and reverse. In a melee that decides whether the opponent may turn
  about (§7.5.5), whether a commander with the routing unit goes back with it
  (§9.1.8), and whether a unit whose retreat is impossible routs early in the
  retreat stage, which changes who pays Morale first (§11.2). Options: it always
  ignores them (the code; §7.5.3's "may" becomes "does"); the routing side
  chooses (a new player choice in the retreat stage); or it always falls back
  first.

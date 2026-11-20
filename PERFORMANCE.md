# Performance

What the engine costs to run, where that cost comes from, and the work
proposed against it. Measured 2026-11-19 on the author's machine. Nothing
here changes a rule, except where an item says so.

The design comes first. The architecture is pure functions; any state lives
in function or closure scope, never module scope. A table built once from
constants alone, such as each board size's layout with its spaces, is a constant
and is allowed. A cache of anything a game can change is not, however much
time it would save.

## How it was measured

Bot games from `pnpm bot:games`, with the sample starter armies and the
default temperament on both sides. Fixed seeds give the same games each run,
so a change that leaves play alone leaves every winner and round count the
same. Engine costs were taken by replaying those games and timing each engine
call on its own, the bot's thinking excluded.

## Where things stand

A bot game, start to finish, at the median:

| Board    | Before the tables | After the tables |
| -------- | ----------------- | ---------------- |
| Standard | 3.8 s             | 1.3 s            |
| Mini     | 320 ms            | 147 ms           |

Board geometry now reads definitions in `@entities` instead of handling
strings. Each size's layout (`coordinateLayoutMap` in `@ruleValues`) is its
depth, its frontage and the spaces they make, listed row by row; and one table, `positionByCoordinate`, gives every space's
row and column, the same on every board it is on because the sizes nest.
Before, every step split a space's name into row and column and built the
next name as a string. That string work was over a third of a bot game.
`getBoardCoordinates`, `findGridPosition`, `getGridPosition`,
`findCoordinateAtPosition` and `findForwardSpace` read these, and depend on
`@entities` alone.

How it got there is a lesson. The tables were first built in `@factories`
as a separate grid beside the layout: a second table describing the same
board, and a declaration in the wrong layer. Folding them into the layout
left the layout duplicating its own lookups, and duplicating the list of
spaces `@entities` already declared for each size. A layout is a definition,
not a built value, so it is now defined where the sizes are, from the lists
already there.

Of what remains, about nine tenths is the bot deciding. The bot is not the
author's design and will likely be replaced, so its own costs are not pursued.
What matters is what any bot will bind against: the engine.

## What the engine costs

The engine loop alone, with a bot that chooses instantly: about **140 ms per
standard game** (about 980 events) and **36 ms per mini game** (about 370).

Pure transitions are cheap:

| Step                                      | Per call |
| ----------------------------------------- | -------- |
| `applyEvent`, a whole new state           | 7.5 µs   |
| `generateEventFromProcedure`              | 10 µs    |
| `projectGameStateForVisibility`, one seat | 1 µs     |
| `findExpectedEvent`                       | 17 µs    |

Copying on every change is not what costs. A new state every 7.5 µs is about
130,000 imagined positions a second on one thread, and every one of them is
safe to share, keep or discard. That is what purity buys a look-ahead.

The cost is enumeration, the search for what is legal:

| Per decision, standard board            | Cost   |
| --------------------------------------- | ------ |
| `getLegalUnitMoves`, one unit's endings | 510 µs |
| Offering `moveUnit`                     | 680 µs |
| Offering `moveCommander`                | 400 µs |
| Validating `moveCommander`              | 360 µs |
| Validating `moveUnit`                   | 170 µs |

Validation is legality by membership, so for a choice offered whole it costs
about what offering it did. For a bot in a seat, playing through the same
interface as a player, that is about 100 µs a choice and of no consequence.
Inside a bot's own look-ahead it applies events without validating, as game
effects are applied.

## Findings

- **Move endings repeat.** `getLegalUnitMoves` returns about 300 endings per
  unit, of which about 128 are distinct spaces and facings. The rest reach the
  same ending by a wasteful path, such as turning left and back. The walk
  remembers a position by space, facing and the Speed and Flexibility left,
  so arriving with less left counts as new and is explored again. Nothing in
  the rules reads what is left after a move ends (§6.3.2 compares full Speed),
  so a position reached with no more of either left can never lead anywhere
  new.
- **A commander's move is slow for what it is.** At most 81 spaces lie within
  4, yet offering the move costs 400 µs. Two causes, neither a rule.
  `exploreCommanderMoves` remembers a space by the distance left, so it visits
  a space once for each distance it arrives with: 164 visits from mid-board
  for 81 spaces. And each diagonal step asks `diagonalIsClear`, which builds
  three neighbour sets to find two corner spaces (0.57 µs a call, 332 calls
  from mid-board).
- **Small sets built on every call.** The adjacency helpers gather their
  answer into a new set through `filterUndefinedSpaces`, which spreads,
  filters and copies. A space's neighbours are distinct by geometry, so the
  set guards nothing, and for a handful of items an array is cheaper to build
  and to scan. Sets stay right where duplicates are a real risk or the
  collection is large.
- **Finding a unit walks the board.** `findPositionOfUnit` and
  `findCommanderSpace` read every space to answer one question, and nearly
  every stat read asks both, to check a round effect's inspiration range
  (§4.3.7). A per-board cache in module scope was tried and reverted: a
  hidden second copy of where units stand, shared by every game in the
  process and, with test isolation off, by every spec. If an index comes
  back, a pure function derives it and the caller that asks many questions of
  one board passes it down.

## Suspended

Proposed and suspended 2026-11-19, in this order. Each is one commit, with a
failing spec first wherever behaviour changes.

1. `diagonalIsClear` reads its two corner spaces by position (`findGridPosition`,
   `findCoordinateAtPosition`): the origin's
   row with the target's column, and the target's row with the origin's.
   Same answers, about twenty times cheaper. Unit movement and melee support
   ask it too.
2. `exploreCommanderMoves` visits each space once, keeping the most distance
   left. A commander has no facing and no other resource, so arriving with
   more left is never worse. Same answers.
3. **A rule:** a move never returns to a position, the same space and facing,
   that it has already held (proposed RULEBOOK §5.2.4). Coming back where you
   were does nothing a shorter move could not. It prunes the walk by rule, and
   it makes `[turnLeft, turnRight]` illegal. RULEBOOK wording first, then a
   spec that fails, then the move walk and the validator.
4. The move offer lists one entry per ending, with its most direct path. This
   is for a simpler offer, not for validation: an inefficient legal path is
   still legal, and is still accepted. Check first that nothing reads the
   duplicates.
5. The adjacency helpers stop building sets they do not need. At the read of
   `queries/`, one helper at a time, keeping what their callers ask of them.

## Waiting on these

- **Placements on events.** Five events carry a position the board already
  holds: `chooseMovingUnit.unit`, `chooseShooter.unit`,
  `performRangedAttack.targetUnit` and `supportingUnits`,
  `startEngagement.defenderWithPlacement`, and `moveCommander.from`. DESIGN
  says a unit is named by identity and where it stands is read from the board.
  The judgment on removing them waits on what a lookup of where a unit stands
  costs, since each removal is a lookup in its place.
- **Integer positions.** Integers as indexes into the list of space names
  change no meaning, and geometry already works that way inside
  geometry.
  Replacing the names themselves is out.

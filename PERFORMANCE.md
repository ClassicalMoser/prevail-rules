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

| Board    | Before the tables | After the tables | Now (2026-11-20) |
| -------- | ----------------- | ---------------- | ---------------- |
| Standard | 3.8 s             | 1.3 s            | 484 ms           |
| Mini     | 320 ms            | 147 ms           | 72 ms            |

"Now" is after every item under "Done 2026-11-20". Of a standard game's
484 ms, the engine is about 40 ms; the rest is the bot deciding.

Board geometry now reads definitions in `@ruleValues` instead of handling
strings. Each size's layout (`coordinateLayoutMap` in `@ruleValues`) is its
depth, its frontage and the spaces they make, listed row by row; and one table, `positionByCoordinate`, gives every space's
row and column, the same on every board it is on because the sizes nest.
Before, every step split a space's name into row and column and built the
next name as a string. That string work was over a third of a bot game.
`getBoardCoordinates`, `findGridPosition`, `getGridPosition`,
`findCoordinateAtPosition` and `findForwardSpace` read these, and depend on
`@ruleValues` alone.

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
- **Finding a unit walked the board** (answered by item 7 below). `findPositionOfUnit` and
  `findCommanderSpace` read every space to answer one question, and nearly
  every stat read asks both, to check a round effect's inspiration range
  (§4.3.7). A per-board cache in module scope was tried and reverted: a
  hidden second copy of where units stand, shared by every game in the
  process and, with test isolation off, by every spec. If an index comes
  back, a pure function derives it and the caller that asks many questions of
  one board passes it down.

## Done 2026-11-20

What was suspended on 2026-11-19, taken up in order. Where the answers
could have changed, they were checked against the old code on every
position of real bot games.

1. **The two corners of a diagonal are read by position.**
   `getDiagonalCornerSpaces` takes the origin's row with the target's
   column, and the target's row with the origin's; `diagonalIsClear` and the
   mover's `checkDiagonalMove` both use it. 0.57 µs to 0.10 µs a call.
2. **A commander's walk goes out a ring at a time,** each space explored
   once. The same spaces at 20,418 positions. Offering a commander's move:
   400 µs to 83 µs, checking it 360 µs to 76 µs. Its offer now lists the
   spaces in board order (`listInBoardOrder`), an order that means nothing.
3. **A rule, RULEBOOK §5.2.4:** a move may not bring a unit back to a
   position it has held. Every move state carries the positions held, and
   the turn and step options refuse a repeat, so offers, validation and
   retreats all keep it. No ending is lost: the same places to end at 914
   moves.
4. **One way to each ending, the plainest, in board order.**
   `getLegalUnitMoves` keeps the fewest turns, then the fewest steps;
   `listMovesInBoardOrder` writes the offer down. A longer legal path is
   still accepted when submitted. Endings per unit: 295 to 122, the same
   places at 845 moves.

5. **A neighbourhood's spaces are gathered straight into one set**
   (`getSpacesInDirections`), used by the five adjacency helpers;
   `filterUndefinedSpaces` is gone. Same answers.
6. **A move's endings are ranked once** for listing in board order. Offering
   a move: about 750 µs back to 644 µs.

7. **Where every piece is, by name: the game state's `index`.** It
   answers the finding above that finding a unit walks the board, inside
   the design: the index is part of the state, not a cache beside it. It
   sits beside the board and the reserve, routed and lost lists, which stay
   the record. `index.units` files each unit under
   `side-<type id>-<number>` as a space, `'reserved'` or `'routed'`;
   `index.commanders` files each side's commander as a space, `'reserved'`
   or `'lost'`. Which way a unit faces stays in its space.
   - _Kept by the writers, one entry at a time._ Every change to where a
     piece is happens through one complete writer: `deployUnit`,
     `moveUnitOnBoard`, `moveUnitIntoEngagement`, `routUnit`,
     `deployCommander`, `moveCommanderOnBoard` (and `carryRidingCommander`
     through it) and `defeatCommander`. Each changes the board, the lists and
     that one piece's entry in the same new state, so no state is half
     written. Deploying and routing are one write each, so no state holds a
     unit in two places. The board-level steps (`addUnitToBoard`,
     `removeUnitFromBoard`, `addEngagingUnitToBoard`, `addCommanderToBoard`,
     `removeCommanderFromBoard`) are shared parts of those writers and work
     on a bare board, which has no index to leave behind. Nothing in play
     replaces a whole board, so `updateBoardState` is gone; a spec that
     builds one uses `replaceBoard` in `@testing`, which derives the whole
     index, as a whole new board calls for.
   - _Checked when read from outside._ `refineGameStateIndex`, in
     `legalGameSchema` and `legalGameStateSchema`, refuses an index that
     disagrees with the record, and a piece the record holds in two places.
   - _Read by the finders._ `findPositionOfUnit`, `getPositionOfUnit`,
     `getUnitWithPlacementOnBoard`, `findCommanderSpace` and
     `getCommanderSpace` take the state and read the index; so do the two
     line queries.

   One unit's endings: 245 µs to 145 µs. Offering a move: 294 µs to 189 µs.
   The engine loop: 52 ms to 38 ms per standard game. `applyEvent` is
   unchanged at 2 µs. A median bot game: 613 ms to 484 ms, the same twenty
   games to the round on both boards.

   A first version rebuilt the whole index from the board on every write,
   because the piece writers returned boards and only the state-level
   `updateBoardState` saw a state; it doubled `applyEvent` and let a state
   exist whose board had moved ahead of its index. It was replaced the
   next day.

## Where a move's enumeration goes now

Listing one unit's endings (`getLegalUnitMoves`) costs about 140 µs. A
profile with V8's inlining off, so each function keeps its own time:

| Part                                                             | Share |
| ---------------------------------------------------------------- | ----- |
| The walk itself (`walkMoveEndings`, its own time)                | 25%   |
| A step (`getStepOption`), with the two below                     | 27%   |
| A diagonal step's corners (`checkDiagonalMove`)                  | 13%   |
| Passing a friend (`canMoveThrough`), of which its Flexibility 7% | 12%   |
| Turns (`getTurnOptions`)                                         | 13%   |
| Whether the move may end here (`findMoveEnding`)                 | 13%   |
| Refusing a position held before (`isPositionHeld`)               | 6.5%  |
| The plainest path per ending (`getSmallestMovePerEnding`)        | 6%    |
| The mover's stats, once at the start (`createMoveContext`)       | 4%    |

Two candidates were weighed and dropped. Reading each friend's Flexibility
once per walk would save at most its 7%. Keying the walk's arrivals by
space then facing, and changing each list in place, saved about 5%, partly
within noise, for bookkeeping much harder to read; most of the walk's own
time is its recursion, not its keys. Nothing left stands out, and the
optimization work closes here.

## Waiting on these

- **Terrain on the walk.** When terrain lands, a move's Speed depends on
  the worst ground it touches (§5.5.1): the highest terrain threshold and
  the lowest speed limit among its spaces. That is a property of the path,
  so each point of the walk carries the two worst values seen so far, and a
  step folds in its new space's, rather than re-reading the path. The
  walk's rule that a later arrival no better than an earlier one is not
  walked again must then compare the ground seen as well: an earlier
  arrival outdoes a later one only if it has seen no worse ground on both
  counts.

- **Placements on events.** Five events carry a position the board already
  holds: `chooseMovingUnit.unit`, `chooseShooter.unit`,
  `performRangedAttack.targetUnit` and `supportingUnits`,
  `startEngagement.defenderWithPlacement`, and `moveCommander.from`. DESIGN
  says a unit is named by identity and where it stands is read from the board.
  The judgment on removing them waited on what a lookup of where a unit
  stands costs. With the index (item 7) a lookup is one entry and one space,
  so it no longer stands in the way.
- **Integer positions.** Integers as indexes into the list of space names
  change no meaning, and geometry already works that way inside
  geometry.
  Replacing the names themselves is out.

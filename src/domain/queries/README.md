# Queries

Import as `@queries`.

Pure reads. A query looks at a `GameState` (or a smaller value) and returns something about it. It does not write.

A query reports what is already the case. What a player may do is `@legality`. What happens next is `@expected`. 

Folders follow the game nouns, in the same order as the directory: `attack`, `board`, `card`, and so on. Substep readers under `sequencing/` follow `game/substeps`.

Failure modes are per function. Do not assume every getter throws, or that every getter returns `undefined`. The table in [`validation/README.md`](../validation/README.md#contrast-with-queries) is the worked example: `getBoardSpace` throws when the coordinate is absent, and `getForwardSpace` returns `undefined` when the step leaves the board.

## Where to look

- `board/` — a space, its neighbors, front / flank / rear, areas, one step forward or back (`getBoardSpace`, `getAdjacentSpaces`, `getFrontSpaces`, `getFlankingSpaces`, `getBackSpaces`, `getSpacesAhead`, `getSpacesBehind`, `getForwardSpace`, `getRearwardSpace`)
- `facings/` — opposite, left, right, adjacent, orthogonal
- `unit/` and `unitPresence/` — a unit's stats, friendliness, and position (`getPlayerUnitWithPosition`)
- `line/` — lines that include a unit (`getLinesFromUnit`)
- `sequencing/` — the phase, step, and substep currently in progress

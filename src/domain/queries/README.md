# Queries

Import as `@queries`.

Pure reads. A query looks at a `GameState` (or a smaller value) and returns something about it. It does not write.

A query reports what is already the case. What a player may do is `@legality`. What happens next is `@expected`.

Folders follow the game nouns, in the same order as the directory: `attack`, `board`, `card`, and so on. Phase readers under `sequencing/` follow `game/phases`. Substep readers follow `game/substeps`.

A `find*` is total: it answers `undefined` for an absence, which is an ordinary answer — a step that leaves the board, a commander who has fallen, no winner yet. A `get*` insists: it throws when what it names is not there. [`sequencing/combatOutcomes/README.md`](./sequencing/combatOutcomes/README.md) sets the split out in full. The table in [`validation/README.md`](../validation/README.md#contrast-with-queries) is the worked example: `getBoardSpace` throws when the coordinate is absent, and `findForwardSpace` returns `undefined` when the step leaves the board. The `getLegal*` enumerators and the `getExpected*` builders are not readers and keep the conventions in their own layers' READMEs.

## Where to look

- `board/` — a space, its neighbors, front / flank / rear, areas, one step forward or back (`getBoardSpace`, `getAdjacentSpaces`, `getFrontSpaces`, `getFlankingSpaces`, `getBackSpaces`, `getSpacesAhead`, `getSpacesBehind`, `findForwardSpace`, `findRearwardSpace`)
- `facings/` — opposite, left, right, adjacent, orthogonal
- `unit/` and `unitPresence/` — a unit's stats, friendliness, and position (`findPlayerUnitWithPosition`)
- `unitLocation/` — whether two placements, or two units with their placements, are the same (`isSamePlacement`, `isSameUnitWithPlacement`)
- `line/` — who may stand in a line (`canJoinLine`) and the unbroken rank through a unit (`getLineSegmentContainingUnit`)
- `sequencing/` — the phase, step, and substep currently in progress

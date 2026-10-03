# Testing

Import as `@testing`.

A fixture does what a factory and a transform cannot. How a spec uses one is [`STYLE.md`](../../../STYLE.md).

- `createBoard` — boards, including a facing row
- `createUnitInstance` and `unitHelpers` — units
- `testHelpers` — cards, `updateCardState`, and line coordinate readers
- `phaseStateHelpers` — phase and substep shells
- `bootstrapGameState` — a game far enough along to exercise a phase

`updateCardState` replaces the whole card state and is for fixtures only. A production write of one player's cards is `updatePlayerCardState` in `@transforms`.

Only tests may import this layer. Production code does not.

Entity `typeGuards` specs live in `entityTypeGuards/` rather than next to the entity modules. Other tests are colocated with the code they exercise.

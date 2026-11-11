# Testing

Import as `@testing`.

A fixture does what a factory and a transform cannot. How a spec uses one is [`STYLE.md`](../../../STYLE.md).

- `createBoard` — boards, including a facing row
- `createUnitInstance` and `unitHelpers` — units
- `testHelpers` — cards, `updateCardState`, and line coordinate readers
- `phaseStateHelpers` — phase and substep shells
- `bootstrapGameState` — a game far enough along to exercise a phase
- `scenario` — a playable game (units and hands), the phase a rule is met in, and `applyEffectsUntilChoice` to run the engines until a player must decide; for specs that play a rule through end to end rather than hand-building each state it passes through

Catalog entries are fungible. A test must not depend on a particular one —
use `createTestCard` / `createTestUnit`, or a row reached only by the trait or
stat the case needs (`getUnitByTrait` / `getUnitByStatValue`). Specs that need
the catalog as a list import it from `@sampleValues`.

`updateCardState` replaces the whole card state and is for fixtures only. A production change of one player's cards is `updatePlayerCards` in `@transforms`, which reads the seat.

Only tests may import this layer. Production code does not.

Packages built on these rules test against the same fixtures and catalogs. They import `@classicalmoser/prevail-rules/testing` and `@classicalmoser/prevail-rules/sampleValues`, which are separate from the main entry so production bundles stay free of stand-in values.

Tests are colocated with the code they exercise.

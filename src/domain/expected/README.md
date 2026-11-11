# Expected

Import as `@expected`.

Decides the next event from the current state: which effect or which player's choice. `findExpectedEvent` is the entry: it answers `undefined` when the game is over. `getExpectedEvent` is its twin for callers that insist on an answer, and throws then. Phase-specific readers live under `expectedEvent/`.

When a legality list is empty, this layer may branch on that fact. It does not apply events.

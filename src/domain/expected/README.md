# Expected

Import as `@expected`.

Decides the next event from the current state: which effect or which player's choice, and the event number. `getExpectedEvent` is the entry. Phase-specific readers live under `expectedEvent/`.

When a legality list is empty, this layer may branch on that fact. It does not apply events.

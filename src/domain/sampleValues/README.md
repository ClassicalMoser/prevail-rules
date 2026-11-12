# Sample values

Import as `@sampleValues`.

Stand-in catalogs until a real source of cards and units exists. This layer may
import types from `@entities`. It does not import their values.

- `tempCommandCards`
- `tempUnits`
- `cardsAtInitiative` — the first sample cards at an initiative, which the starter armies are built from, so each holds the same count at every value (§3.1.7)
- `miniStarterArmy` — a starter army each side may bring to a mini game
- `standardStarterArmy` — a starter army each side may bring to a standard game

Production code does not import samples. Consuming packages reach them as `@classicalmoser/prevail-rules/sampleValues`, for their own test fixtures. `@testing` helpers and specs may.
Entries are fungible: a test must not depend on a particular one. Walk the
array, or reach a row by the trait or stat the case needs
(`getUnitByTrait` / `getUnitByStatValue`) — never by name.

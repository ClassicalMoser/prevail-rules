# Sample values

Import as `@sampleValues`.

Stand-in catalogs until a real source of cards and units exists. This layer may
import types from `@entities`. It does not import their values.

- `tempCommandCards`
- `tempUnits`
- `miniStarterArmy` — a starter army each side may bring to a mini game

Production code does not import samples. `@testing` helpers and specs may.
Entries are fungible: a test must not depend on a particular one. Walk the
array, or reach a row by the trait or stat the case needs
(`getUnitByTrait` / `getUnitByStatValue`) — never by name.

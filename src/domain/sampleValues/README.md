# Sample values

Import as `@sampleValues`.

Stand-in catalogs until a real source of cards and units exists. This layer may
import types from `@entities`. It does not import their values.

- `tempCommandCards`
- `tempUnits`
- `miniStarterArmy` — a starter army each side may bring to a mini game

Only `@testing` imports this layer. Specs reach catalog entries through `@testing`
(prefer `createTestCard` / `createTestUnit` when the test does not depend on a
particular entry). Production code does not import samples.

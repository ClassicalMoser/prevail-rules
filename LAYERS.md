# Layers

Each directory is one layer. Import edges are enforced from [`boundaries.ts`](./boundaries.ts). Longer notes stay in the layer README.

| Layer | Import | Role |
| --- | --- | --- |
| [Utils](./src/domain/utils/README.md) | `@utils` | Shared helpers. No domain schemas. |
| [Rule values](./src/domain/ruleValues/README.md) | `@ruleValues` | Rule constants. Type imports only from the layers it lists. |
| [Entities](./src/domain/entities/README.md) | `@entities` | Declarations: schemas and types. |
| [Events](./src/domain/events/README.md) | `@events` | Player choices and game effects. |
| [Game](./src/domain/game/README.md) | `@game` | Composed game, round, phase, and substep state. |
| [Factories](./src/domain/factories/README.md) | `@factories` | Build a value from raw inputs. |
| [Sample values](./src/domain/sampleValues/README.md) | `@sampleValues` | Stand-in cards and units until a real catalog exists. |
| [Queries](./src/domain/queries/README.md) | `@queries` | Read the current state. |
| [Legality](./src/domain/legality/README.md) | `@legality` | Enumerate what a player may do. |
| [Expected](./src/domain/expected/README.md) | `@expected` | Decide the next event. |
| [Procedures](./src/domain/procedures/README.md) | `@procedures` | Build a game-effect event from the state. |
| [Validation](./src/domain/validation/README.md) | `@validation` | Accept or reject. Never throws. |
| [Transforms](./src/domain/transforms/README.md) | `@transforms` | Apply an event and return the next state. |
| [Testing](./src/domain/testing/README.md) | `@testing` | Shared fixtures. Tests only. |
| [Application](./src/application/README.md) | `@application` | Run a game. No rules of its own. |

The four engines are written up in [`src/domain/ENGINES.md`](./src/domain/ENGINES.md).

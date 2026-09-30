# Design

How the rules engine is shaped. Package layout is in [`src/domain/README.md`](./src/domain/README.md).

## Pure functions

Domain logic is pure functions:

- No side effects (no I/O, no mutations)
- Same input always produces the same output
- Easy to test and reason about

## Immutability

State is immutable:

- Events are immutable objects
- A state transition returns a new state
- The event stream can be replayed

## Type safety

TypeScript and Zod are both strict.

- `isolatedDeclarations` is on. An exported function has an explicit return type, and an exported schema is annotated (`z.ZodType<T>`).
- Manual types and schemas stay aligned (`AssertExact` where the entity docs require it).
- No type assertions (`as`, `!`) and no `@ts-ignore`. A test of an unreachable case is the exception, only in a test file, and the line carries a comment.
- No overloads unless one signature cannot express the return.

Schema-first declaration order is in [`src/domain/entities/README.md`](./src/domain/entities/README.md).

## Layers

Each package is one layer. Who may import whom is [`boundaries.ts`](./boundaries.ts). What each layer is for is [`LAYERS.md`](./LAYERS.md). The four engines are [`src/domain/ENGINES.md`](./src/domain/ENGINES.md).

Application composes those engines and does not contain rules. It does not import `@legality`.

## Validation

Queries and validation are separate:

- A query extracts data and documents whether it throws, returns `undefined`, or both
- Validation never throws. It returns `ValidationResult` with an `errorReason` on failure
- Validation wraps a throwing getter in try/catch. `undefined` from a directional query is a normal negative case

See [`src/domain/validation/README.md`](./src/domain/validation/README.md).

## Events

State changes go through events:

- Events are the record of what happened
- They can be logged and replayed

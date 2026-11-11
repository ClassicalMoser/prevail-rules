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

### Who reads and who writes

- **Only a query walks the state.** Reading a nested slot (a phase, then its resolution, then an engagement, an apply, a rout) is a `@queries` reader, never a walk written inline in a transform, validator, enumerator or sequencer.
- **Only a transform writes the state.** Writing a slot is a pure transform in `@transforms`; nothing else spreads state by hand.
- **An event apply composes and delegates.** An `apply*Event` reads through queries and writes through pure transforms. It does not build nested state itself.
- **A block is not inlined**, and never one that is written elsewhere too. Extract it once and call it. Before adding a helper, search the whole package for one that already does the job.
- **A value is declared once.** Entities hold no functions. A fact a table states (which board a mode is played on, what a commitment accepts) is one table, in `@entities`, `@game` or `@ruleValues`, read by indexing where it is used, with no second copy or lookup function in a lower layer. `@ruleValues` imports nothing from the domain, so it cannot form a cycle with `@entities`, which imports its values.
- **`@testing` delegates to production.** A fixture starts from the factory or transform that builds the same thing in play and overrides only what a spec varies.

## Faults and absence

- **`find` and `get`.** A `find*` is total: it answers `undefined` when what it names is absent and absence is an ordinary answer in the game (no winner yet, a step off the board, nobody routing). A `get*` insists and throws when the thing is not there. This holds for every reader, enumerator and sequencer, not only `@queries`.
- **A question that should not be asked throws**, with a message naming what was missing. When one layer owns a gate (the expected engine asks for a choice only while it is owed), a function downstream asked outside that gate throws; it does not answer `[]`, `null` or `undefined`. A soft second guard would hide a fault in the first. An empty answer is for a fair question with nothing to offer.
- **Throws are granular and are not caught on the way up.** The only catch is at a validation entry point, where a fault becomes a refusal (see Validation). A refactor keeps every thrown message as specific as it was, or makes it more so.

## Validation

Queries and validation are separate:

- A query extracts data and documents whether it throws, returns `undefined`, or both
- A validation entry point never throws. It returns `ValidationResult` with an `errorReason` on failure
- Beneath an entry point nothing catches: a getter or enumerator that throws is left to throw, and the entry point catches once (`failFromFault`) and keeps the message. `undefined` from a total query is a normal negative case

See [`src/domain/validation/README.md`](./src/domain/validation/README.md).

## Events

State changes go through events:

- Events are the record of what happened
- They can be logged and replayed

What an event carries:

- **One choice per decision.** Where a rule has a player decide several things in turn, each is its own player-choice event, in the rulebook's order. A couple of consecutive decisions by the same player that belong together may share one event (a shot's target and supporters; a move's path and the commander riding with it). A choice type does not serve two different moments or players.
- **A unit is named by identity.** Where it stands, and its stats, are read from the board.
- **An event carries what the state does not already hold**: what a procedure measured or decided (an attack's result, the retreats a unit may make, a Morale penalty, the facing a reverse leaves) or what a player chose. It does not repeat units, placements or locations the state holds, and it does not say which slot its effect writes to: the apply asks the state through a query, so the event and the state cannot disagree.
- **A choice too large to list whole** is offered a part at a time (`OpenChoice`), as [`ENGINES.md`](./src/domain/ENGINES.md) describes.

Rounds:

- **Round 0 is setup.** The side holding the initiative, White at the start (RULEBOOK §3.3.2), places its whole army, then the other side; a `roundEnd` effect then begins round 1.
- **The event that ends a round belongs to the round it ends.** A round's log is the cursor for replay and undo, so each round's log starts empty, round 1's included.

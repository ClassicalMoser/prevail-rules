# Domain

The rules engine. It is the source of truth for Prevail, shared by browser clients, a web server, later clients, and anything else that needs the same rules. Import the packages in [`LAYERS.md`](../../LAYERS.md). Each layer README says what that package owns.

## Purpose

Pure functions. A function takes a game state and an event (a player choice or a game effect) and returns the next state, or a rejection.

- Testable in isolation
- Portable across JavaScript runtimes
- No hidden state or side effects
- Types checked at compile time, shapes checked with Zod

How those functions are shaped is [`DESIGN.md`](../../DESIGN.md). The call entries (`applyEvent`, `validatePlayerChoice`, and the rest) are [`ENGINES.md`](./ENGINES.md).

## Above this layer

Phase order, initiative, combat and the flow of a round are the domain's own:
the expected engine says what comes next, a procedure builds each effect the game
owes, and the transform engine applies it ([`ENGINES.md`](./ENGINES.md)). The
domain does not store games, talk to clients, or run a session. That work sits on
top of it, in `src/application`:

1. **Event sourcing.** Persist the event stream, one per round, replay it, validate before persisting, and snapshot for speed.
2. **Commands.** Turn a user action into a domain event, validate it, queue it, and check who may send it.
3. **Read model.** Projections of the current state, a cache of legal moves, board views, and history.
4. **Client interface.** Accept events, serve the current state and queries, and push updates.
5. **Persistence.** Save and load a game, its event stream, and its snapshots, and migrate when the schema changes.
6. **Errors.** Validate before execution, check the state after, recover, and log the change.

## Related

- [`LAYERS.md`](../../LAYERS.md) — what each layer is for
- [`STYLE.md`](../../STYLE.md) — code shape, commentary, tests
- [`DESIGN.md`](../../DESIGN.md) — pure functions, immutability, events
- [`ENGINES.md`](./ENGINES.md) — transform, validation, expected, and procedure engines
- [`entities/README.md`](./entities/README.md) — schema-first types
- [`validation/README.md`](./validation/README.md) — `ValidationResult`
- [`AUDIT.md`](./AUDIT.md) — conventions audit checklist

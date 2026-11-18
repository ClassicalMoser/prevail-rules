# Infra

Default infrastructure: adapters that implement the ports in [`../ports`](../ports). They are not ports themselves; a host may supply its own.

- `mathRandom` — the random source for live play
- `createInMemoryGameStorage` — games, each with its stream of events, kept in memory, for specs and for games that need not outlast the process
- `createInMemoryEnginePorts` — all of them assembled into `EnginePorts`

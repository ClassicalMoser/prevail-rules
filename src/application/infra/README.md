# Infra

Default infrastructure: adapters that implement the ports in [`../ports`](../ports). They are not ports themselves; a host may supply its own.

- `mathRandom` — the random source for live play
- `createInMemoryGameStorage`, `createInMemoryEventStreamStorage`, `createInMemoryRoundSnapshotStorage` — storage kept in memory, for specs and for games that need not outlast the process
- `createInMemoryEnginePorts` — all of them assembled into `EnginePorts`

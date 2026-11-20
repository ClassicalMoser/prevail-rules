# Game

Composed domain models for a running game. Import as `@game`.

Same declaration-only role as `@entities` (schemas, interfaces, types), but these depend on entity primitives and assemble the sequencing tree. Follow the schema-first pattern in [`../entities/README.md`](../entities/README.md).

Visibility (`authoritative` | `whiteSeen` | `blackSeen` | `spectator`) lives on `CardState` and is threaded on `GameState`. A `Game` is the server's authoritative record; what a seat or a spectator receives is its game state projected for them, not a game. `spectator` hides both hands. Board size stays on `boardState.boardType`. The `index` (`gameState/gameStateIndex.ts`) says where every unit and commander is, by name; it is a convenience beside the board and the lists, which stay the record. Every writer that moves a piece (`deployUnit`, `moveUnitOnBoard`, `routUnit`, `defeatCommander` and the rest, in `@transforms`) changes the board, the lists and that piece's one entry in the same write. `refineGameStateIndex` in `@legality` refuses a state read from outside whose index disagrees with them, comparing it with `deriveGameStateIndex` in `@queries`. Mode army composition is validated in `@legality`, not here.

## Outline

```
Game (authoritative)
  └─ GameState (told apart by `visibility`)
       ├─ AuthoritativeGameState | WhiteSeenGameState | BlackSeenGameState | SpectatorGameState
       ├─ boardState, cardState, reserved/routed units, …
       ├─ index: where every unit and commander is, by name
       └─ RoundState (the same in every view)
            └─ PhaseState (discriminated on phase)
                 └─ step + nested resolution state
                      └─ Substeps (movement, melee, attack apply, engagement, rally, …)
```

## Modules

| Module        | Role                                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `game/`       | The server's game record, authoritative. Shape only; the game rules, including mode ↔ board size, are `refineGameRules` in `@legality` |
| `gameState/`  | Runtime state by visibility, plus ownership helper types                                                                               |
| `cardState/`  | Owned/hidden piles and visibility `CardState` union                                                                                    |
| `roundState/` | Current round slice (phase + event stream)                                                                                             |
| `phases/`     | Phase/step state in play order                                                                                                         |
| `substeps/`   | Nested resolution states (see [`substeps/README.md`](./substeps/README.md))                                                            |
| `commitment/` | Pending / completed / declined commitments (discriminated on `commitmentType`)                                                         |

### `phases/`

`playCards` → `moveCommanders` → `issueCommands` → `resolveMelee` → `cleanup`, plus the `PhaseState` union.

### `substeps/`

Phase-owned roots (`commandResolution/`, `meleeResolution/`, `rallyResolution/`) plus shared `combatOutcomes/` and `engagement/`. See [`substeps/README.md`](./substeps/README.md).

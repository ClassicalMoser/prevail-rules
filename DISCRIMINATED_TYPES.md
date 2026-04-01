# Discriminated Types Migration

## Goal

Replace generic `TBoard` threading with **discriminated unions** on spatial data so narrowing follows **`boardType` on values**, not unused generic parameters. Casts should shrink as the model carries more discriminators.

## Design principle

**Discriminate spatial shapes; de-genericize envelopes that only ferry `TBoard`.**

- **Layer 1:** `UnitPlacement`, `UnitWithPlacement` (atoms).
- **Layer 2:** substeps under issue-commands / resolve-melee (`game/substeps`, `resolveMeleePhase`) plus **`CommandResolutionState`** as `movement | ranged`, each branch `boardType`-discriminated.
- **Layer 3:** spatial **player choices** and **game effects** (coordinates, placements, unit snapshots) — `Standard | Small | Large` variants with root **`boardType`** on the event payload.
- **Layer 4:** pass-through phase/round **envelopes** and **expected-next-action metadata** — no phantom `TBoard` on types that do not use it; **`RoundState`** is **not** generic (**`events`** widened to **`Event<Board, EventType>[]`** — the old per-board event correlation was mostly decorative). **`GameState`** is a **discriminated union** (**`StandardGameState | SmallGameState | LargeGameState`**) on **`boardState.boardType`**; **`GameStateWithBoard<TBoard extends Board>`** is the generic alias for APIs that must thread a single board type. Persistence ports still take wide **`GameState`**; call sites use **`as GameState`** where the value is typed as **`GameStateWithBoard<BoardForGameType<T>>`** (generic `T` does not assign to the union without that assertion).
- **Layer 5 (done):** **`Game`** is a **`gameType`** DU (**`StandardGame | MiniGame | TutorialGame`**); **`BoardForGameType<T>`** is derived from **`GameOfType<T>['gameState']['boardState']`**; **`validateGameBoardMatchesGameType`** + **`gameSchema`** superRefine enforce board size vs **`gameType`**. **`mini`** / **`tutorial`** share **`SmallGameState`**; mode differences stay on **`Game`** variants for later traits. **Later:** broad de-genericization of queries/transforms where it pays off (Layer 6).

**Schemas:** concrete variant → `_schemaObject` → `AssertExact` where honest → export. Per-board families use `z.discriminatedUnion('boardType', …)` on **atoms** and **substeps**. **`playerChoiceEventSchema`** / **`gameEffectEventSchema`** use **nested** `z.discriminatedUnion` on `choiceType` / `effectType` with spatial inner DUs; inner branch objects use explicit `z.ZodObject<…>` where `--isolatedDeclarations` requires it. Some wide compositions (e.g. **`commandResolutionStateSchema`**, **`phaseStateSchema`**) stay **`z.union`** when a flat union is enough or declaration emit is simpler; wide `AssertExact` may be skipped there when inference ≠ manual union.

## What Layer 2 delivered

- **Composable:** `RetreatState`, `ReverseState`, `AttackApplyState` — `Standard | Small | Large` with **matching** nested retreat/reverse (no `RetreatState<TBoard>`).
- **Movement:** `EngagementState`, `MovementResolutionState` — same pattern; movement nests board-aligned engagement.
- **Ranged:** `RangedAttackResolutionState` nests `StandardAttackApplyState | undefined` (etc.) in lockstep with `AttackApplyState`.
- **Melee / phase:** `MeleeResolutionState`, `ResolveMeleePhaseState` — per-board coordinates and attack-apply slots.
- **Envelope:** `CommandResolutionState` = `MovementResolutionState | RangedAttackResolutionState`; distinguish with `commandResolutionType` at runtime.

Removed duplicate `engagementResolutionSubstep.ts` (single `EngagementState` source).

## What Layer 3 delivered

- **Player choices:** `MoveUnitEvent`, `MoveCommanderEvent`, `ChooseMeleeResolutionEvent`, `ChooseRetreatOptionEvent`, `PerformRangedAttackEvent`, `SetupUnitsEvent` — each is a **`boardType`** union with board-aligned coordinates / placements / unit sets.
- **Game effects:** `CompleteIssueCommandsPhaseEvent`, `ResolveMeleeEvent`, `ResolveRangedAttackEvent`, `StartEngagementEvent`, `ResolveFlankEngagementEvent`, `ResolveRetreatEvent`, `ResolveReverseEvent` — same pattern.

Generic aliases `Event<TBoard>` / `MoveUnitEvent<TBoard>` etc. still work via conditional types; runtime validation uses the wide Zod schemas.

## What Layer 4 delivered (phase envelope + expected-event metadata + root state shape)

- **`IssueCommandsPhaseState`** is **not** generic: spatial agreement is in **`CommandResolutionState`** and **`GameState.boardState`**.
- **`PhaseState`** is **not** generic: the union is board-agnostic at the envelope; spatial branches carry their own discriminators.
- **`RoundState`** is **not** generic: **`events: readonly Event<Board, EventType>[]`** (wide log; no compile-time “all events match this board” invariant).
- **`GameState`** = **`StandardGameState | SmallGameState | LargeGameState`**, discriminated by **`boardState.boardType`** (no redundant top-level **`boardType`**). **`GameStateWithBoard<TBoard>`** stays **`GameStateBase & { boardState: TBoard }`** so a naked **`TBoard extends Board`** keeps **`state.boardState`** and **`UnitPlacement<TBoard>`** correlated (a conditional alias like **`MoveUnitEvent<TBoard>`** widens unresolved generics to **`GameState`**). **Traits** (setup, victory, rules) are **not** on **`GameState`** branches — they attach to **`Game`** / **`gameType`** (Layer 5 DU; per-variant traits still optional). **`gameStateSchema`** is **`z.union`** of full per-board state objects; the old **`gameStateSchemaForBoard`** cast helper is removed.
- **`ExpectedPlayerInput`**, **`ExpectedGameEffect`**, **`ExpectedEventInfo`**, and **`ExpectedEvent`** are **not** generic: they only name `actionType` / `choiceType` / `effectType` / `playerSource`; board-shaped payloads remain on real events and state.
- **`updateRemainingCommandsForPlayer`** dropped an unused `<TBoard>` parameter (pure command-set plumbing).

## What Layer 5 delivered

- **`Game`** = **`StandardGame | MiniGame | TutorialGame`** on **`gameType`**; **`GameOfType<T>`** = **`Extract<Game, { gameType: T }>`**; **`GameBase`** holds shared fields.
- **`BoardForGameType<T extends GameType>`** = **`GameOfType<T>['gameState']['boardState']`** (no separate indexed map).
- **`validateGameBoardMatchesGameType`** compares **`boardState`** dimensions to **`getBoardSizeForGameType`**; **`gameSchema`** uses **`z.discriminatedUnion('gameType', …)`** + superRefine.
- Persistence / composables: **`getGameState`** returns **`game.gameState as GameStateWithBoard<BoardForGameType<T>>`** (generic **`T`** does not correlate through **`getGame`**); **`updateGameState`** uses **`as GameState`** for storage and **`GameStateChange`**.

## Intentional seams (current code)

| Area          | What                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layer 2**   | Generic **`GameStateWithBoard<TBoard>`** does not narrow nested phase/command state — transforms use `as PhaseState`, `as MovementResolutionState`, `as MeleeResolutionState`, `as RangedAttackResolutionState`, `as BoardCoordinate<TBoard>` at edges (including after object spreads). Apply builders may use `as RetreatState` / `as AttackApplyState` so nested unions type-check under generic `TBoard`. No `Extract<>` bridges. |
| **Layer 3**   | Some applies still cast `event.unit` / `event.defenderWithPlacement` to `UnitWithPlacement<TBoard>`; `applyMoveCommanderEvent` casts `from` / `to` to `BoardCoordinate<TBoard>`. Procedure generators often return `as unknown as SpatialEffectEvent<TBoard>`. **`applyGameEffectEvent`** casts several spatial-effect applies to **`GameStateWithBoard<TBoard>`** where inference widens to `Board`.                                 |
| **Layer 4–5** | **`updateGameState`** / **`handleNewRound`**: **`as GameState`** when calling storage / **`GameStateChange`** that accept wide **`GameState`**. **`getGameState`**: **`as GameStateWithBoard<BoardForGameType<T>>`** after **`getGame`**. **`GameStateWithBoard`** remains an **intersection** for generic **`TBoard`** correlation (see Layer 4); traits on **`Game`** variants are still future work.                               |
| **Zod**       | Wide `AssertExact` skipped for `commandResolutionStateSchema` / `phaseStateSchema` where inference ≠ manual union.                                                                                                                                                                                                                                                                                                                    |

## Layers

Each layer ends with `tsc` clean and full `npm test`. **Layers 1–5** are complete as a migration milestone; **Layer 6** is ongoing optional cleanup.

| Layer | Scope                                                                                                                | Status      |
| ----- | -------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1     | Placement atoms                                                                                                      | **Done**    |
| 2     | Substeps + `CommandResolutionState` (see Layer 2 above)                                                              | **Done**    |
| 3     | Spatial player choices + spatial game effects (see Layer 3 above)                                                    | **Done**    |
| 4     | Pass-through envelopes; non-generic `RoundState`; wide event log; `GameState` DU + `GameStateWithBoard<T>`           | **Done**    |
| 5     | `Game` as `gameType` DU; `BoardForGameType<T>` from `Game`; `validateGameBoardMatchesGameType`; traits on `Game` TBD | **Done**    |
| 6     | De-genericize queries/transforms incrementally (optional; see below)                                                 | **Backlog** |

## Layer 6 (incremental backlog)

Layers **1–5** are the **planned migration**: spatial and root game shapes are discriminated; persistence and composable seams are documented.

**Layer 6** is **not** a single deliverable. Many domain functions still take **`GameStateWithBoard<TBoard>`** or **`<TBoard extends Board>`** so callers keep compile-time correlation between state, coordinates, and placements. Removing those parameters is **optional** and should happen **small PR by small PR** when a function truly only needs wide **`GameState`** / **`Board`** and tests stay green.

**`BoardForGameType<T>`** remains the right tool for **application** code that keys on **`GameType`**. The “remove **`BoardForGameType`**” line in the target outcome below is a **long-term** aspiration, not a Layer 6 gate.

## Target outcome (end state)

- Spatial mismatches caught via **`boardType`** on real state, not `as` on generics, wherever the model allows.
- Root game/board discrimination; **`BoardForGameType` removed** when types match.
- **`AssertExact`** only where schema output honestly matches the hand-written type.

**Not promised after Layer 3:** zero `as` globally or removal of every `TBoard` parameter — that is Layers 4–6.

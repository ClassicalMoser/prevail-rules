# Discriminated Types Migration

## Goal

Replace generic `TBoard` threading with **discriminated unions** on spatial data so narrowing follows **`boardType` on values**, not unused generic parameters. Casts should shrink as the model carries more discriminators.

## Design principle

**Discriminate spatial shapes; de-genericize envelopes that only ferry `TBoard`.**

- **Layer 1:** `UnitPlacement`, `UnitWithPlacement` (atoms).
- **Layer 2:** substeps under issue-commands / resolve-melee (`game/substeps`, `resolveMeleePhase`) plus **`CommandResolutionState`** as `movement | ranged`, each branch `boardType`-discriminated.
- **Layer 3:** spatial **player choices** and **game effects** (coordinates, placements, unit snapshots) — `Standard | Small | Large` variants with root **`boardType`** on the event payload.
- **Layer 4:** pass-through phase/round **envelopes** and **expected-next-action metadata** — no phantom `TBoard` on types that do not use it; **`RoundState`** is **not** generic (**`events`** widened to **`Event<Board, EventType>[]`** — the old per-board event correlation was mostly decorative). **`GameState`** is a **discriminated union** (**`StandardGameState | SmallGameState | LargeGameState`**) on **`boardState.boardType`**; **`GameStateWithBoard<TBoard extends Board>`** is the generic alias for APIs that must thread a single board type. Persistence ports still take wide **`GameState`**; call sites use **`as GameState`** where the value is typed as **`GameStateWithBoard<BoardForGameType[T]>`** (generic `T` does not assign to the union without that assertion).
- **Later:** **`Game<T>`** as a **`gameType`** DU (and **`BoardForGameType`** cleanup); broad de-genericization of queries/transforms where it pays off.

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
- **`GameState`** = **`StandardGameState | SmallGameState | LargeGameState`**, discriminated by **`boardState.boardType`** (no redundant top-level **`boardType`**). **`GameStateWithBoard<TBoard>`** = **`GameStateBase & { boardState: TBoard }`** for generic helpers. **`gameStateSchema`** is **`z.union`** of full per-board state objects (**`gameStateSchemaForStandardBoard`**, **`…Small…`**, **`…Large…`**); **`gameStateSchemaForBoard`** / the **`as unknown as z.ZodType<GameState<TBoard>>`** pattern were removed.
- **`ExpectedPlayerInput`**, **`ExpectedGameEffect`**, **`ExpectedEventInfo`**, and **`ExpectedEvent`** are **not** generic: they only name `actionType` / `choiceType` / `effectType` / `playerSource`; board-shaped payloads remain on real events and state.
- **`updateRemainingCommandsForPlayer`** dropped an unused `<TBoard>` parameter (pure command-set plumbing).

## Intentional seams (current code)

| Area        | What                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layer 2** | Generic **`GameStateWithBoard<TBoard>`** does not narrow nested phase/command state — transforms use `as PhaseState`, `as MovementResolutionState`, `as MeleeResolutionState`, `as RangedAttackResolutionState`, `as BoardCoordinate<TBoard>` at edges (including after object spreads). Apply builders may use `as RetreatState` / `as AttackApplyState` so nested unions type-check under generic `TBoard`. No `Extract<>` bridges. |
| **Layer 3** | Some applies still cast `event.unit` / `event.defenderWithPlacement` to `UnitWithPlacement<TBoard>`; `applyMoveCommanderEvent` casts `from` / `to` to `BoardCoordinate<TBoard>`. Procedure generators often return `as unknown as SpatialEffectEvent<TBoard>`. **`applyGameEffectEvent`** casts several spatial-effect applies to **`GameStateWithBoard<TBoard>`** where inference widens to `Board`.                                 |
| **Layer 4** | **`updateGameState`** / **`handleNewRound`**: **`as GameState`** when calling storage that accepts wide **`GameState`**. **`Game<T>`** and **`BoardForGameType`** unchanged for now (Layer 5 follow-up).                                                                                                                                                                                                                              |
| **Zod**     | Wide `AssertExact` skipped for `commandResolutionStateSchema` / `phaseStateSchema` where inference ≠ manual union.                                                                                                                                                                                                                                                                                                                    |

## Layers

Each layer ends with `tsc` clean and full `npm test`.

| Layer | Scope                                                                                                      | Status   |
| ----- | ---------------------------------------------------------------------------------------------------------- | -------- |
| 1     | Placement atoms                                                                                            | **Done** |
| 2     | Substeps + `CommandResolutionState` (see Layer 2 above)                                                    | **Done** |
| 3     | Spatial player choices + spatial game effects (see Layer 3 above)                                          | **Done** |
| 4     | Pass-through envelopes; non-generic `RoundState`; wide event log; `GameState` DU + `GameStateWithBoard<T>` | **Done** |
| 5     | `Game<T>` as `gameType` DU; `BoardForGameType` cleanup; keep / align `validateGameBoardMatchesGameType`    | Pending  |
| 6     | De-genericize queries/transforms where possible                                                            | Pending  |

## Target outcome (end state)

- Spatial mismatches caught via **`boardType`** on real state, not `as` on generics, wherever the model allows.
- Root game/board discrimination; **`BoardForGameType` removed** when types match.
- **`AssertExact`** only where schema output honestly matches the hand-written type.

**Not promised after Layer 3:** zero `as` globally or removal of every `TBoard` parameter — that is Layers 4–6.

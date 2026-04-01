# Discriminated Types Migration

## Goal

Replace generic `TBoard` threading with **discriminated unions** on spatial data so narrowing follows **`boardType` on values**, not unused generic parameters. Casts should shrink as the model carries more discriminators.

## Design principle

**Discriminate spatial shapes; de-genericize envelopes that only ferry `TBoard`.**

- **Layer 1:** `UnitPlacement`, `UnitWithPlacement` (atoms).
- **Layer 2:** substeps under issue-commands / resolve-melee (`game/substeps`, `resolveMeleePhase`) plus **`CommandResolutionState`** as `movement | ranged`, each branch `boardType`-discriminated.
- **Layer 3:** spatial **player choices** and **game effects** (coordinates, placements, unit snapshots) — `Standard | Small | Large` variants with root **`boardType`** on the event payload.
- **Layer 4:** pass-through phase/round **envelopes** and **expected-next-action metadata** — no phantom `TBoard` on types that do not use it; **`RoundState<TBoard>`** keeps `TBoard` only where it carries real board-scoped data (e.g. `events: Event<TBoard>[]`). Query helpers may still take **`GameState<TBoard>`** to preserve the caller’s board type through inference.
- **Later:** root `GameState` / `Game`, `BoardForGameType`, and broad de-genericization of queries/transforms.

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

## What Layer 4 delivered (phase envelope + expected-event metadata)

- **`IssueCommandsPhaseState`** is **not** generic: it had no fields using `TBoard`; spatial agreement is in **`CommandResolutionState`** and **`GameState.boardState`**.
- **`PhaseState`** is **not** generic: same idea — the union is board-agnostic at the envelope; spatial branches carry their own discriminators.
- **`RoundState<TBoard>`** still parameterized **only** where needed (**`events`**, and consistency with **`GameState<TBoard>`** via `currentPhaseState` / `completedPhases` holding **`PhaseState`** values that align with that game’s board at runtime).
- **`ExpectedPlayerInput`**, **`ExpectedGameEffect`**, **`ExpectedEventInfo`**, and **`ExpectedEvent`** are **not** generic: they only name `actionType` / `choiceType` / `effectType` / `playerSource`; board-shaped payloads remain on real events and state.
- **`updateRemainingCommandsForPlayer`** dropped an unused `<TBoard>` parameter (pure command-set plumbing).

## Intentional seams (current code)

| Area        | What                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layer 2** | `GameState<TBoard>` does not narrow nested phase/command state — transforms use `as PhaseState`, `as MovementResolutionState`, `as MeleeResolutionState`, `as RangedAttackResolutionState`, `as BoardCoordinate<TBoard>` at edges. Apply builders may use `as RetreatState` / `as AttackApplyState` so nested unions type-check under generic `TBoard`. No `Extract<>` bridges.          |
| **Layer 3** | Some applies still cast `event.unit` / `event.defenderWithPlacement` to `UnitWithPlacement<TBoard>`; `applyMoveCommanderEvent` casts `from` / `to` to `BoardCoordinate<TBoard>`. Procedure generators often return `as unknown as SpatialEffectEvent<TBoard>`. **`applyGameEffectEvent`** casts several spatial-effect applies to `GameState<TBoard>` where inference widens to `Board`. |
| **Zod**     | Wide `AssertExact` skipped for `commandResolutionStateSchema` / `phaseStateSchema` where inference ≠ manual union.                                                                                                                                                                                                                                                                       |

## Layers

Each layer ends with `tsc` clean and full `npm test`.

| Layer | Scope                                                                                                      | Status                   |
| ----- | ---------------------------------------------------------------------------------------------------------- | ------------------------ |
| 1     | Placement atoms                                                                                            | **Done**                 |
| 2     | Substeps + `CommandResolutionState` (§ above)                                                              | **Done**                 |
| 3     | Spatial player choices + spatial game effects (§ above)                                                    | **Done**                 |
| 4     | Pass-through envelopes (`PhaseState`, `IssueCommandsPhaseState`, …); `RoundState` keeps real `TBoard` only | **Done** (initial slice) |
| 5     | Root `GameState` / `Game`; drop `BoardForGameType`; keep / align `validateGameBoardMatchesGameType`        | Pending                  |
| 6     | De-genericize queries/transforms where possible                                                            | Pending                  |

Further Layer 4 work may tighten other pass-throughs (e.g. event envelopes that do not need generics) without touching Layer 5.

## Target outcome (end state)

- Spatial mismatches caught via **`boardType`** on real state, not `as` on generics, wherever the model allows.
- Root game/board discrimination; **`BoardForGameType` removed** when types match.
- **`AssertExact`** only where schema output honestly matches the hand-written type.

**Not promised after Layer 3:** zero `as` globally or removal of every `TBoard` parameter — that is Layers 4–6.

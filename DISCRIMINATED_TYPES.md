# Discriminated Types Migration

## Goal

Replace generic `TBoard` threading with **discriminated unions** on spatial data so narrowing follows **`boardType` on values**, not unused generic parameters. Casts should shrink as the model carries more discriminators.

## Design principle

**Discriminate spatial shapes; de-genericize envelopes that only ferry `TBoard`.**

- **Layer 1:** `UnitPlacement`, `UnitWithPlacement` (atoms).
- **Layer 2:** substeps under issue-commands / resolve-melee (`game/substeps`, `resolveMeleePhase`) plus **`CommandResolutionState`** as `movement | ranged`, each branch `boardType`-discriminated.
- **Later:** pass-throughs (`RoundState`, `PhaseState`, `IssueCommandsPhaseState`, `Event`, phantom event params) and root `GameState` / `Game`.

**Schemas:** concrete variant → `_schemaObject` → `AssertExact` where honest → export. Use `z.discriminatedUnion('boardType', …)` per family; use **`z.union`** at the few top-level compositions Zod 4 rejects as nested DUs (`commandResolutionStateSchema`, `phaseStateSchema`).

## What Layer 2 delivered

- **Composable:** `RetreatState`, `ReverseState`, `AttackApplyState` — `Standard | Small | Large` with **matching** nested retreat/reverse (no `RetreatState<TBoard>`).
- **Movement:** `EngagementState`, `MovementResolutionState` — same pattern; movement nests board-aligned engagement.
- **Ranged:** `RangedAttackResolutionState` nests `StandardAttackApplyState | undefined` (etc.) in lockstep with `AttackApplyState`.
- **Melee / phase:** `MeleeResolutionState`, `ResolveMeleePhaseState` — per-board coordinates and attack-apply slots.
- **Envelope:** `CommandResolutionState` = `MovementResolutionState | RangedAttackResolutionState`; distinguish with `commandResolutionType` at runtime.

Removed duplicate `engagementResolutionSubstep.ts` (single `EngagementState` source).

## Intentional seams (current code)

| Area        | What                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layer 1** | Events often use `UnitWithPlacement<Board>`; applies still use `as UnitWithPlacement<TBoard>` where runtime board matches.                                                                                                                                                                                                                                                              |
| **Layer 2** | `GameState<TBoard>` does not narrow nested phase/command state — transforms use `as PhaseState<TBoard>`, `as MovementResolutionState`, `as MeleeResolutionState`, `as RangedAttackResolutionState`, `as BoardCoordinate<TBoard>` at edges. Apply builders may use `as RetreatState` / `as AttackApplyState` so nested unions type-check under generic `TBoard`. No `Extract<>` bridges. |
| **Zod**     | Wide `AssertExact` skipped for `commandResolutionStateSchema` / `phaseStateSchema` where inference ≠ manual union.                                                                                                                                                                                                                                                                      |

## Layers

Each layer ends with `tsc` clean and full `npm test`.

| Layer | Scope                                                                                               | Status   |
| ----- | --------------------------------------------------------------------------------------------------- | -------- |
| 1     | Placement atoms                                                                                     | **Done** |
| 2     | Substeps + `CommandResolutionState` (§ above)                                                       | **Done** |
| 3     | Spatial events                                                                                      | Pending  |
| 4     | Pass-through types (`RoundState`, `PhaseState`, …)                                                  | Pending  |
| 5     | Root `GameState` / `Game`; drop `BoardForGameType`; keep / align `validateGameBoardMatchesGameType` | Pending  |
| 6     | De-genericize queries/transforms where possible                                                     | Pending  |

## Target outcome (end state)

- Spatial mismatches caught via **`boardType`** on real state, not `as` on generics, wherever the model allows.
- Root game/board discrimination; **`BoardForGameType` removed** when types match.
- **`AssertExact`** only where schema output honestly matches the hand-written type.

**Not promised after Layer 2:** zero `as` globally or removal of every `TBoard` parameter — that is Layers 3–6.

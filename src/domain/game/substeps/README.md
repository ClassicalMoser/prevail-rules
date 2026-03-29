# Sequence Substeps

This directory contains state definitions for **substeps** - nested states that appear within phases and steps.

## Hierarchy

The game state hierarchy is:

```
Round
  └─ Phase (e.g., playCards, issueCommands, resolveMelee)
      └─ Step (e.g., chooseCards, revealCards within playCards)
          └─ Substep (e.g., movementResolution, attackApply)
              └─ Nested Substep (e.g., retreat, rout, engagement)
```

## Types of Substeps

### Composable Substeps

These substeps are **reusable** and can appear in multiple contexts. They are designed to be composable building blocks:

- **`AttackApplyState`** - Applies the result of an attack (rout, retreat, or reverse)
  - Used in: `RangedAttackResolutionState`, `MeleeResolutionState`
  - Contains: `RoutState`, `RetreatState`, `ReverseState` (nested composable substeps)

- **`RetreatState`** - Handles unit retreat after an attack or engagement
  - Used in: `AttackApplyState`, `EngagementState`
  - Contains: `RoutState` (nested composable substep - nearly recursive pattern)

- **`RoutState`** - Handles card discarding when units rout
  - Used in: `RetreatState`, `EngagementState`, `RallyResolutionState`
  - This is a **nearly recursive** pattern: rout can trigger from retreat, which can contain a rout state

- **`ReverseState`** - Handles unit reversal after an attack
  - Used in: `AttackApplyState`

- **`EngagementState`** - Handles engagement resolution (flank, front, rear)
  - Used in: `MovementResolutionState`
  - Contains: `RoutState` (for rear engagements)

### Context-Specific Substeps

These substeps are tied to specific phases or steps:

- **`MovementResolutionState`** - Resolves movement commands
  - Used in: `IssueCommandsPhase`
  - Contains: `EngagementState` (composable)

- **`RangedAttackResolutionState`** - Resolves ranged attack commands
  - Used in: `IssueCommandsPhase`
  - Contains: `AttackApplyState` (composable)

- **`MeleeResolutionState`** - Resolves melee combat
  - Used in: `ResolveMeleePhase`
  - Contains: `AttackApplyState` (composable, one for each player)

- **`RallyResolutionState`** - Resolves unit support after rally
  - Used in: `CleanupPhase`
  - Contains: `RoutState` (composable)

## Composable Pattern

Composable substeps follow this pattern:

1. **Self-contained logic** - They handle their own state transitions
2. **Reusable queries** - Functions like `getExpectedAttackApplyEvent()` can be called from any context
3. **Nested composition** - They can contain other composable substeps
4. **Completion flag** - They use a `completed: boolean` flag to indicate when all nested work is done

Example: `AttackApplyState` is used in both ranged attacks and melee resolution, and it delegates to `getExpectedRetreatEvent()`, `getExpectedRoutEvent()`, or `getExpectedReverseEvent()` based on the attack result.

## Nearly Recursive Pattern

Some substeps can contain themselves or similar structures:

- `RetreatState` can contain `RoutState`
- `RoutState` can be triggered from `RetreatState` (when no legal retreats exist)
- This creates a **nearly recursive** pattern where routing can occur during retreat

This pattern is handled by:

1. Checking for nested state existence (`retreatState.routState`)
2. Delegating to the nested state's expected event query (`getExpectedRoutEvent()`)
3. Using the `completed` flag to know when to "back out" to the parent state

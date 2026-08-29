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
  - Contains: `RoutState` (when retreat fails or completes into a rout)

- **`RoutState`** - Handles card discarding when units rout
  - Used in: `RetreatState`, `EngagementState`, `RallyResolutionState`
  - Often nested under retreat: no legal retreats → rout penalty under the retreat slice

- **`ReverseState`** - Handles unit reversal after an attack
  - Used in: `AttackApplyState`

- **`EngagementState`** - Handles engagement resolution (flank, front, rear)
  - Used in: `MovementResolutionState`
  - Contains: `RoutState` (for rear engagements), `RetreatState` (for front engagements once the defender accepts retreat)

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

## Retreat → rout nesting

`RetreatState` can hold a nested `RoutState`. That is composition, not recursion: neither type contains itself.

- No legal retreats (or retreat leading to rout) → `routState` is seeded under the retreat slice
- Expected-event queries check for the nested slice (`retreatState.routState`) and delegate to `getExpectedRoutEvent()`
- The nested `completed` flag tells the parent when to resume / finish

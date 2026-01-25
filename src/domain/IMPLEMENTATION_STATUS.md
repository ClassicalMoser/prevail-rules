# Implementation Status & Gap Analysis

This document combines flow analysis, round analysis, and implementation checklist into a single comprehensive view. It shows what events are expected, what's implemented, and what's missing.

**Key:**

- ✅ = Implemented
- ❌ = Missing (blocking)
- ⚠️ = Partial (procedure exists but transform missing, or vice versa)
- 🔍 = Needs review

---

## Summary by Engine

| Engine                            | Status         | Progress                 |
| --------------------------------- | -------------- | ------------------------ |
| **1. Pure Transform Engine**      | ✅ Complete    | 38/38 events (100%)      |
| **2. Validation Engine**          | 🟡 In Progress | 3/5 phases (60%)         |
| **3. Procedure Library**          | ✅ Complete    | 23/23 implemented (100%) |
| **4. Next Event Expected Engine** | ✅ Complete    | 5/5 phases (100%)        |

**Flow Status:** ✅ **Complete** - All expected event queries have complete flow coverage with no gaps.

---

## Phase 1: Play Cards ✅ **COMPLETE**

**Flow:** `chooseCards` → `revealCards` → `assignInitiative` → `complete`

| Step               | Expected Event                       | Transform                             | Procedure                                | Status |
| ------------------ | ------------------------------------ | ------------------------------------- | ---------------------------------------- | ------ |
| `chooseCards`      | `playerChoice: chooseCard`           | ✅ `applyChooseCardEvent`             | N/A                                      | ✅     |
| `revealCards`      | `gameEffect: revealCards`            | ✅ `applyRevealCardsEvent`            | ✅ `generateRevealCardsEvent`            | ✅     |
| `assignInitiative` | `gameEffect: resolveInitiative`      | ✅ `applyResolveInitiativeEvent`      | ✅ `generateResolveInitiativeEvent`      | ✅     |
| `complete`         | `gameEffect: completePlayCardsPhase` | ✅ `applyCompletePlayCardsPhaseEvent` | ✅ `generateCompletePlayCardsPhaseEvent` | ✅     |

**All engines complete for this phase.**

---

## Phase 2: Move Commanders ✅ **COMPLETE**

**Flow:** `moveFirstCommander` → `moveSecondCommander` → `complete`

| Step                  | Expected Event                            | Transform                                  | Procedure                                     | Status |
| --------------------- | ----------------------------------------- | ------------------------------------------ | --------------------------------------------- | ------ |
| `moveFirstCommander`  | `playerChoice: moveCommander`             | ✅ `applyMoveCommanderEvent`               | N/A                                           | ✅     |
| `moveSecondCommander` | `playerChoice: moveCommander`             | ✅ `applyMoveCommanderEvent`               | N/A                                           | ✅     |
| `complete`            | `gameEffect: completeMoveCommandersPhase` | ✅ `applyCompleteMoveCommandersPhaseEvent` | ✅ `generateCompleteMoveCommandersPhaseEvent` | ✅     |

**All engines complete for this phase.**

---

## Phase 3: Issue Commands ✅ **COMPLETE**

**Flow:** `firstPlayerIssueCommands` → `firstPlayerResolveCommands` → `secondPlayerIssueCommands` → `secondPlayerResolveCommands` → `complete`

### Step 1 & 3: Issue Commands

| Expected Event               | Transform                   | Procedure | Status |
| ---------------------------- | --------------------------- | --------- | ------ |
| `playerChoice: issueCommand` | ✅ `applyIssueCommandEvent` | N/A       | ✅     |

### Step 2 & 4: Resolve Commands

**Flow:** `moveUnit`/`performRangedAttack` → (movement/ranged attack resolution) → next unit

#### Movement Resolution Flow

| Expected Event                                  | Transform                           | Procedure                              | Status    |
| ----------------------------------------------- | ----------------------------------- | -------------------------------------- | --------- |
| `playerChoice: commitToMovement`                | ✅ `applyCommitToMovementEvent`     | N/A                                    | ✅        |
| `gameEffect: startEngagement` (if engaging)     | ✅ `applyStartEngagementEvent`      | ✅ `generateStartEngagementEvent`      | ✅        |
| Engagement resolution (see composable substeps) | See below                           | See below                              | See below |
| `gameEffect: completeUnitMovement`              | ✅ `applyCompleteUnitMovementEvent` | ✅ `generateCompleteUnitMovementEvent` | ✅        |

#### Ranged Attack Resolution Flow

| Expected Event                                  | Transform                                  | Procedure                                     | Status    |
| ----------------------------------------------- | ------------------------------------------ | --------------------------------------------- | --------- |
| `playerChoice: commitToRangedAttack`            | ✅ `applyCommitToRangedAttackEvent`        | N/A                                           | ✅        |
| `gameEffect: resolveRangedAttack`               | ✅ `applyResolveRangedAttackEvent`         | ✅ `generateResolveRangedAttackEvent`         | ✅        |
| Attack apply substeps (see composable substeps) | See below                                  | See below                                     | See below |
| `gameEffect: completeRangedAttackCommand`       | ✅ `applyCompleteRangedAttackCommandEvent` | ✅ `generateCompleteRangedAttackCommandEvent` | ✅        |

### Step 5: Complete

| Expected Event                           | Transform                                 | Procedure                                    | Status |
| ---------------------------------------- | ----------------------------------------- | -------------------------------------------- | ------ |
| `gameEffect: completeIssueCommandsPhase` | ✅ `applyCompleteIssueCommandsPhaseEvent` | ✅ `generateCompleteIssueCommandsPhaseEvent` | ✅     |

**All engines complete for this phase.**

---

## Phase 4: Resolve Melee ✅ **COMPLETE**

**Flow:** `resolveMelee` (loop: choose engagement → commitments → resolve → attack apply) → `complete`

| Expected Event                                  | Transform                                | Procedure                                   | Status    |
| ----------------------------------------------- | ---------------------------------------- | ------------------------------------------- | --------- |
| `playerChoice: chooseMeleeResolution`           | ✅ `applyChooseMeleeEvent`               | N/A                                         | ✅        |
| `playerChoice: commitToMelee` (first player)    | ✅ `applyCommitToMeleeEvent`             | N/A                                         | ✅        |
| `playerChoice: commitToMelee` (second player)   | ✅ `applyCommitToMeleeEvent`             | N/A                                         | ✅        |
| `gameEffect: resolveMelee`                      | ✅ `applyResolveMeleeEvent`              | ✅ `generateResolveMeleeEvent`              | ✅        |
| Attack apply substeps (see composable substeps) | See below                                | See below                                   | See below |
| `gameEffect: completeMeleeResolution`           | ✅ `applyCompleteMeleeResolutionEvent`   | ✅ `generateCompleteMeleeResolutionEvent`   | ✅        |
| `gameEffect: completeResolveMeleePhase`         | ✅ `applyCompleteResolveMeleePhaseEvent` | ✅ `generateCompleteResolveMeleePhaseEvent` | ✅        |

**All engines complete for this phase.**

---

## Phase 5: Cleanup ✅ **COMPLETE**

**Flow:** `discardPlayedCards` → `firstPlayerChooseRally` → `firstPlayerResolveRally` → `secondPlayerChooseRally` → `secondPlayerResolveRally` → `complete`

| Step                       | Expected Event                     | Transform                           | Procedure                              | Status |
| -------------------------- | ---------------------------------- | ----------------------------------- | -------------------------------------- | ------ |
| `discardPlayedCards`       | `gameEffect: discardPlayedCards`   | ✅ `applyDiscardPlayedCardsEvent`   | ✅ `generateDiscardPlayedCardsEvent`   | ✅     |
| `firstPlayerChooseRally`   | `playerChoice: chooseRally`        | ✅ `applyChooseRallyEvent`          | N/A                                    | ✅     |
| `firstPlayerResolveRally`  | Complex (see rally resolution)     | ✅ All implemented                  | ✅ All implemented                     | ✅     |
| `secondPlayerChooseRally`  | `playerChoice: chooseRally`        | ✅ `applyChooseRallyEvent`          | N/A                                    | ✅     |
| `secondPlayerResolveRally` | Complex (see rally resolution)     | ✅ All implemented                  | ✅ All implemented                     | ✅     |
| `complete`                 | `gameEffect: completeCleanupPhase` | ✅ `applyCompleteCleanupPhaseEvent` | ✅ `generateCompleteCleanupPhaseEvent` | ✅     |

**All engines complete for this phase.**

---

## Composable Substeps

These substeps can appear in multiple contexts (ranged attack, melee, engagement, etc.).

### Attack Apply Substeps

**Used in:** Ranged attack resolution, melee resolution

**Flow:** `resolveRout`/`resolveRetreat`/`resolveReverse` → (nested substeps) → `completeAttackApply`

| Expected Event                              | Transform                          | Procedure                             | Status |
| ------------------------------------------- | ---------------------------------- | ------------------------------------- | ------ |
| `gameEffect: resolveRout` (if routed)       | ✅ `applyResolveRoutEvent`         | ✅ `generateResolveRoutEvent`         | ✅     |
| `gameEffect: resolveRetreat` (if retreated) | ✅ `applyResolveRetreatEvent`      | ✅ `generateResolveRetreatEvent`      | ✅     |
| `gameEffect: resolveReverse` (if reversed)  | ✅ `applyResolveReverseEvent`      | ✅ `generateResolveReverseEvent`      | ✅     |
| `gameEffect: completeAttackApply`           | ✅ `applyCompleteAttackApplyEvent` | ✅ `generateCompleteAttackApplyEvent` | ✅     |

**All engines complete for this substep.**

### Retreat Substeps

**Used in:** Attack apply, engagement (front)

**Flow:** `triggerRoutFromRetreat` OR `chooseRetreatOption` → `resolveRetreat` (moves unit) → (retreat complete)

| Expected Event                                              | Transform                             | Procedure                                | Status |
| ----------------------------------------------------------- | ------------------------------------- | ---------------------------------------- | ------ |
| `gameEffect: triggerRoutFromRetreat` (if no legal retreats) | ✅ `applyTriggerRoutFromRetreatEvent` | ✅ `generateTriggerRoutFromRetreatEvent` | ✅     |
| `playerChoice: chooseRetreatOption` (if multiple options)   | ✅ `applyChooseRetreatOptionEvent`    | N/A                                      | ✅     |
| `gameEffect: resolveRetreat` (convergence - moves unit)     | ✅ `applyResolveRetreatEvent`         | ✅ `generateResolveRetreatEvent`         | ✅     |

**All engines complete for this substep.**

### Rout Substeps

**Used in:** Attack apply (routed), retreat (no legal retreats), engagement (rear), rally (units lost support)

**Flow:** `resolveRout` → `chooseRoutDiscard` → (rout complete)

| Expected Event                    | Transform                        | Procedure                     | Status |
| --------------------------------- | -------------------------------- | ----------------------------- | ------ |
| `gameEffect: resolveRout`         | ✅ `applyResolveRoutEvent`       | ✅ `generateResolveRoutEvent` | ✅     |
| `playerChoice: chooseRoutDiscard` | ✅ `applyChooseRoutDiscardEvent` | N/A                           | ✅     |

**All engines complete for this substep.**

### Engagement Substeps

**Used in:** Movement resolution (when engaging enemy)

**Flow:** `startEngagement` → (flank/front/rear resolution) → (engagement complete)

| Expected Event                                      | Transform                                 | Procedure                                    | Status |
| --------------------------------------------------- | ----------------------------------------- | -------------------------------------------- | ------ |
| `gameEffect: startEngagement`                       | ✅ `applyStartEngagementEvent`            | ✅ `generateStartEngagementEvent`            | ✅     |
| `gameEffect: resolveFlankEngagement` (if flank)     | ✅ `applyResolveFlankEngagementEvent`     | ✅ `generateResolveFlankEngagementEvent`     | ✅     |
| `gameEffect: resolveRout` (if rear)                 | ✅ `applyResolveRoutEvent`                | ✅ `generateResolveRoutEvent`                | ✅     |
| `playerChoice: commitToMovement` (if front)         | ✅ `applyCommitToMovementEvent`           | N/A                                          | ✅     |
| `gameEffect: resolveEngageRetreatOption` (if front) | ✅ `applyResolveEngageRetreatOptionEvent` | ✅ `generateResolveEngageRetreatOptionEvent` | ✅     |
| `playerChoice: chooseWhetherToRetreat` (if front)   | ✅ `applyChooseWhetherToRetreatEvent`     | N/A                                          | ✅     |
| `playerChoice: chooseRetreatOption` (if retreating) | ✅ `applyChooseRetreatOptionEvent`        | N/A                                          | ✅     |

**All engines complete for this substep.**

---

## Transform Architecture Improvements ✅

### Pure Transforms Refactoring (Complete)

**Architectural Alignment:**

- ✅ All sequencing pure transforms now follow `GameState`-in, `GameState`-out pattern
- ✅ Pure transforms use queries internally to navigate nested state (no manual extraction required)
- ✅ Better CQRS alignment: transforms can call queries, queries cannot call transforms
- ✅ Consistent use of `updatePhaseState` for phase state updates

**Refactored Transforms (8 total):**

- ✅ `updateRetreatState` - Handles both ranged attack (issueCommands) and melee (resolveMelee) contexts
- ✅ `updateRoutState` - Handles both contexts, determines player from `routState.player`
- ✅ `updateReverseState` - Handles both contexts, determines player from `reverseState.reversingUnit.unit.playerSide`
- ✅ `updateAttackApplyState` - Handles both ranged attack and melee resolution
- ✅ `updateCommandResolutionState` - Handles issueCommands phase
- ✅ `updateMeleeResolutionState` - Handles resolveMelee phase
- ✅ `updateMeleeAttackApplyState` - Handles melee resolution with explicit player parameter
- ✅ `updateRetreatRoutState` - Handles both contexts, updates rout within retreat state

**Directory Organization:**

- ✅ Pure transforms organized into logical subdirectories: `board/`, `cards/`, `commanders/`, `units/`, `state/`, `sequencing/`
- ✅ All index.ts files use explicit exports (no `export *`)
- ✅ Clear separation of concerns by entity type and operation type

**Next Opportunity:**

- Refactor remaining event apply transforms to use the new pure transforms (e.g., `applyResolveRetreatEvent`, `applyTriggerRoutFromRetreatEvent`, `applyResolveRoutEvent`, `applyCompleteAttackApplyEvent`)

---

## Complete Missing Items List

### Transform Engine - Critical Blockers (Phase 3 & 4)

**Phase 3: Issue Commands**

- ✅ `applyIssueCommandEvent` - Apply command to units (implemented + tested)
- ✅ `applyCompleteIssueCommandsPhaseEvent` - Complete phase (implemented + tested)
- ✅ `applyCommitToMovementEvent` - Commit card to movement
- ✅ `applyCommitToRangedAttackEvent` - Commit card to ranged attack
- ✅ `applyResolveRangedAttackEvent` - Calculate ranged attack results
- ✅ `applyStartEngagementEvent` - Start engagement from movement
- ✅ `applyCompleteUnitMovementEvent` - Complete movement resolution
- ✅ `applyCompleteRangedAttackCommandEvent` - Complete ranged attack resolution

**Phase 4: Resolve Melee**

- ✅ `applyCommitToMeleeEvent` - Commit card to melee
- ✅ `applyResolveMeleeEvent` - Calculate melee combat results
- ✅ `applyCompleteMeleeResolutionEvent` - Complete melee resolution

### Transform Engine - Composable Substeps

**Attack Apply**

- ✅ `applyResolveRoutEvent` - Apply rout penalty
- ✅ `applyResolveRetreatEvent` - Apply retreat movement
- ✅ `applyResolveReverseEvent` - Apply reverse movement
- ✅ `applyCompleteAttackApplyEvent` - Complete attack apply substep

**Retreat**

- ✅ `applyTriggerRoutFromRetreatEvent` - Trigger rout when no legal retreats
- ✅ `applyChooseRetreatOptionEvent` - Choose retreat destination

**Engagement**

- ✅ `applyResolveFlankEngagementEvent` - Rotate defender for flank
- ✅ `applyResolveEngageRetreatOptionEvent` - Determine if retreat possible
- ✅ `applyChooseWhetherToRetreatEvent` - Choose to retreat or not

**Total Missing Transforms:** 0 ✅

### Procedure Library - Missing Procedures

**Note:** The procedure registry explicitly throws errors for these three effect types (lines 226-229), indicating they need to be implemented:

- ❌ `generateResolveRetreatEvent` - Generate retreat movement event (convergence - reads finalPosition from state and creates event to move unit)
- ❌ `generateResolveRangedAttackEvent` - Calculate and generate ranged attack results (deterministic - calculates attack vs thresholds)
- ❌ `generateResolveMeleeEvent` - Calculate and generate melee combat results (deterministic - calculates bidirectional attacks)

**Total Missing Procedures:** 3

**All other procedures (20 total) are implemented.**

---

## Priority Implementation Order

### Priority 1: Phase 3 Blockers (Enable Issue Commands)

1. ✅ `applyIssueCommandEvent` - Core command issuance
2. ✅ `applyCommitToMovementEvent` - Movement commitment
3. ✅ `applyCommitToRangedAttackEvent` - Ranged attack commitment
4. ✅ `applyResolveRangedAttackEvent` - Ranged attack resolution (procedure ✅ complete)
5. ✅ `applyStartEngagementEvent` - Engagement from movement
6. ✅ `applyCompleteUnitMovementEvent` - Complete movement
7. ✅ `applyCompleteRangedAttackCommandEvent` - Complete ranged attack

### Priority 2: Phase 4 Blockers (Enable Resolve Melee)

1. ✅ `applyCommitToMeleeEvent` - Melee commitment
2. ✅ `applyResolveMeleeEvent` - Melee resolution (procedure ✅ complete)
3. ✅ `applyCompleteMeleeResolutionEvent` - Complete melee

### Priority 3: Composable Substeps (Complete Combat Flow)

1. ✅ `applyResolveRoutEvent` - Rout penalty
2. ✅ `applyResolveRetreatEvent` - Retreat movement (procedure ✅ complete)
3. ✅ `applyResolveReverseEvent` - Reverse movement
4. ✅ `applyCompleteAttackApplyEvent` - Complete attack apply
5. ✅ `applyTriggerRoutFromRetreatEvent` - Rout from retreat
6. ✅ `applyChooseRetreatOptionEvent` - Retreat choice
7. ✅ `applyResolveFlankEngagementEvent` - Flank engagement
8. ✅ `applyResolveEngageRetreatOptionEvent` - Retreat option check
9. ✅ `applyChooseWhetherToRetreatEvent` - Retreat decision

**All transforms complete!**

### Priority 4: Transform Architecture Refactoring (Complete)

1. ✅ Refactored all sequencing pure transforms to `GameState`-in, `GameState`-out pattern
2. ✅ Pure transforms now use queries internally for state navigation
3. ✅ Organized pure transforms directory into logical subdirectories
4. ✅ Updated all index.ts files to use explicit exports
5. ✅ Improved CQRS alignment and code maintainability

---

## Flow Completeness ✅

**All expected event queries have complete flow coverage:**

- ✅ All phase-level queries complete
- ✅ All command resolution queries complete
- ✅ All composable substep queries complete
- ✅ No gaps or fall-through states
- ✅ Proper delegation pattern for nested substeps
- ✅ Correct `completed` flag usage throughout

The flow logic is sound - all that remains is implementing the transforms and procedures.

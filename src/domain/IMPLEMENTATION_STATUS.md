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
| **1. Pure Transform Engine**      | 🟡 In Progress | 18/38 events (47%)       |
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

## Phase 3: Issue Commands ❌ **INCOMPLETE**

**Flow:** `firstPlayerIssueCommands` → `firstPlayerResolveCommands` → `secondPlayerIssueCommands` → `secondPlayerResolveCommands` → `complete`

### Step 1 & 3: Issue Commands

| Expected Event               | Transform                   | Procedure | Status         |
| ---------------------------- | --------------------------- | --------- | -------------- |
| `playerChoice: issueCommand` | ❌ `applyIssueCommandEvent` | N/A       | ❌ **BLOCKER** |

### Step 2 & 4: Resolve Commands

**Flow:** `moveUnit`/`performRangedAttack` → (movement/ranged attack resolution) → next unit

#### Movement Resolution Flow

| Expected Event                                  | Transform                           | Procedure                              | Status         |
| ----------------------------------------------- | ----------------------------------- | -------------------------------------- | -------------- |
| `playerChoice: commitToMovement`                | ❌ `applyCommitToMovementEvent`     | N/A                                    | ❌ **BLOCKER** |
| `gameEffect: startEngagement` (if engaging)     | ❌ `applyStartEngagementEvent`      | ✅ `generateStartEngagementEvent`      | ⚠️ **Partial** |
| Engagement resolution (see composable substeps) | See below                           | See below                              | See below      |
| `gameEffect: completeUnitMovement`              | ❌ `applyCompleteUnitMovementEvent` | ✅ `generateCompleteUnitMovementEvent` | ⚠️ **Partial** |

#### Ranged Attack Resolution Flow

| Expected Event                                  | Transform                                  | Procedure                                     | Status         |
| ----------------------------------------------- | ------------------------------------------ | --------------------------------------------- | -------------- |
| `playerChoice: commitToRangedAttack`            | ❌ `applyCommitToRangedAttackEvent`        | N/A                                           | ❌ **BLOCKER** |
| `gameEffect: resolveRangedAttack`               | ❌ `applyResolveRangedAttackEvent`         | ✅ `generateResolveRangedAttackEvent`         | ⚠️ **Partial** |
| Attack apply substeps (see composable substeps) | See below                                  | See below                                     | See below      |
| `gameEffect: completeRangedAttackCommand`       | ❌ `applyCompleteRangedAttackCommandEvent` | ✅ `generateCompleteRangedAttackCommandEvent` | ⚠️ **Partial** |

### Step 5: Complete

| Expected Event                           | Transform                                 | Procedure                                    | Status |
| ---------------------------------------- | ----------------------------------------- | -------------------------------------------- | ------ |
| `gameEffect: completeIssueCommandsPhase` | ✅ `applyCompleteIssueCommandsPhaseEvent` | ✅ `generateCompleteIssueCommandsPhaseEvent` | ✅     |

**Missing:** 7 transforms (3 critical blockers)

---

## Phase 4: Resolve Melee ❌ **INCOMPLETE**

**Flow:** `resolveMelee` (loop: choose engagement → commitments → resolve → attack apply) → `complete`

| Expected Event                                  | Transform                                | Procedure                                   | Status         |
| ----------------------------------------------- | ---------------------------------------- | ------------------------------------------- | -------------- |
| `playerChoice: chooseMeleeResolution`           | ✅ `applyChooseMeleeEvent`               | N/A                                         | ✅             |
| `playerChoice: commitToMelee` (first player)    | ❌ `applyCommitToMeleeEvent`             | N/A                                         | ❌ **BLOCKER** |
| `playerChoice: commitToMelee` (second player)   | ❌ `applyCommitToMeleeEvent`             | N/A                                         | ❌ **BLOCKER** |
| `gameEffect: resolveMelee`                      | ❌ `applyResolveMeleeEvent`              | ✅ `generateResolveMeleeEvent`              | ⚠️ **Partial** |
| Attack apply substeps (see composable substeps) | See below                                | See below                                   | See below      |
| `gameEffect: completeMeleeResolution`           | ❌ `applyCompleteMeleeResolutionEvent`   | ✅ `generateCompleteMeleeResolutionEvent`   | ⚠️ **Partial** |
| `gameEffect: completeResolveMeleePhase`         | ✅ `applyCompleteResolveMeleePhaseEvent` | ✅ `generateCompleteResolveMeleePhaseEvent` | ✅             |

**Missing:** 3 transforms (2 critical blockers)

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

| Expected Event                              | Transform                          | Procedure                             | Status         |
| ------------------------------------------- | ---------------------------------- | ------------------------------------- | -------------- |
| `gameEffect: resolveRout` (if routed)       | ❌ `applyResolveRoutEvent`         | ✅ `generateResolveRoutEvent`         | ⚠️ **Partial** |
| `gameEffect: resolveRetreat` (if retreated) | ❌ `applyResolveRetreatEvent`      | ❌ `generateResolveRetreatEvent`      | ❌ **BLOCKER** |
| `gameEffect: resolveReverse` (if reversed)  | ❌ `applyResolveReverseEvent`      | ✅ `generateResolveReverseEvent`      | ⚠️ **Partial** |
| `gameEffect: completeAttackApply`           | ❌ `applyCompleteAttackApplyEvent` | ✅ `generateCompleteAttackApplyEvent` | ⚠️ **Partial** |

**Missing:** 4 transforms

### Retreat Substeps

**Used in:** Attack apply, engagement (front)

**Flow:** `triggerRoutFromRetreat` OR `chooseRetreatOption` → `resolveRetreat` (moves unit) → (retreat complete)

| Expected Event                                              | Transform                             | Procedure                                | Status         |
| ----------------------------------------------------------- | ------------------------------------- | ---------------------------------------- | -------------- |
| `gameEffect: triggerRoutFromRetreat` (if no legal retreats) | ❌ `applyTriggerRoutFromRetreatEvent` | ✅ `generateTriggerRoutFromRetreatEvent` | ⚠️ **Partial** |
| `playerChoice: chooseRetreatOption` (if multiple options)   | ❌ `applyChooseRetreatOptionEvent`    | N/A                                      | ❌ **BLOCKER** |
| `gameEffect: resolveRetreat` (convergence - moves unit)     | ❌ `applyResolveRetreatEvent`         | ✅ `generateResolveRetreatEvent`         | ⚠️ **Partial** |

**Missing:** 3 transforms

### Rout Substeps

**Used in:** Attack apply (routed), retreat (no legal retreats), engagement (rear), rally (units lost support)

**Flow:** `resolveRout` → `chooseRoutDiscard` → (rout complete)

| Expected Event                    | Transform                        | Procedure                     | Status         |
| --------------------------------- | -------------------------------- | ----------------------------- | -------------- |
| `gameEffect: resolveRout`         | ❌ `applyResolveRoutEvent`       | ✅ `generateResolveRoutEvent` | ⚠️ **Partial** |
| `playerChoice: chooseRoutDiscard` | ✅ `applyChooseRoutDiscardEvent` | N/A                           | ✅             |

**Missing:** 1 transform

### Engagement Substeps

**Used in:** Movement resolution (when engaging enemy)

**Flow:** `startEngagement` → (flank/front/rear resolution) → (engagement complete)

| Expected Event                                      | Transform                                 | Procedure                                    | Status         |
| --------------------------------------------------- | ----------------------------------------- | -------------------------------------------- | -------------- |
| `gameEffect: startEngagement`                       | ❌ `applyStartEngagementEvent`            | ✅ `generateStartEngagementEvent`            | ⚠️ **Partial** |
| `gameEffect: resolveFlankEngagement` (if flank)     | ❌ `applyResolveFlankEngagementEvent`     | ✅ `generateResolveFlankEngagementEvent`     | ⚠️ **Partial** |
| `gameEffect: resolveRout` (if rear)                 | ❌ `applyResolveRoutEvent`                | ✅ `generateResolveRoutEvent`                | ⚠️ **Partial** |
| `playerChoice: commitToMovement` (if front)         | ❌ `applyCommitToMovementEvent`           | N/A                                          | ❌ **BLOCKER** |
| `gameEffect: resolveEngageRetreatOption` (if front) | ❌ `applyResolveEngageRetreatOptionEvent` | ✅ `generateResolveEngageRetreatOptionEvent` | ⚠️ **Partial** |
| `playerChoice: chooseWhetherToRetreat` (if front)   | ❌ `applyChooseWhetherToRetreatEvent`     | N/A                                          | ❌ **BLOCKER** |
| `playerChoice: chooseRetreatOption` (if retreating) | ❌ `applyChooseRetreatOptionEvent`        | N/A                                          | ❌ **BLOCKER** |

**Missing:** 7 transforms (3 critical blockers)

---

## Complete Missing Items List

### Transform Engine - Critical Blockers (Phase 3 & 4)

**Phase 3: Issue Commands**

- ❌ `applyIssueCommandEvent` - Apply command to units
- ❌ `applyCommitToMovementEvent` - Commit card to movement
- ❌ `applyCommitToRangedAttackEvent` - Commit card to ranged attack
- ❌ `applyResolveRangedAttackEvent` - Calculate ranged attack results
- ❌ `applyStartEngagementEvent` - Start engagement from movement
- ❌ `applyCompleteUnitMovementEvent` - Complete movement resolution
- ❌ `applyCompleteRangedAttackCommandEvent` - Complete ranged attack resolution

**Phase 4: Resolve Melee**

- ❌ `applyCommitToMeleeEvent` - Commit card to melee
- ❌ `applyResolveMeleeEvent` - Calculate melee combat results
- ❌ `applyCompleteMeleeResolutionEvent` - Complete melee resolution

### Transform Engine - Composable Substeps

**Attack Apply**

- ❌ `applyResolveRoutEvent` - Apply rout penalty
- ❌ `applyResolveRetreatEvent` - Apply retreat movement
- ❌ `applyResolveReverseEvent` - Apply reverse movement
- ❌ `applyCompleteAttackApplyEvent` - Complete attack apply substep

**Retreat**

- ❌ `applyTriggerRoutFromRetreatEvent` - Trigger rout when no legal retreats
- ❌ `applyChooseRetreatOptionEvent` - Choose retreat destination

**Engagement**

- ❌ `applyResolveFlankEngagementEvent` - Rotate defender for flank
- ❌ `applyResolveEngageRetreatOptionEvent` - Determine if retreat possible
- ❌ `applyChooseWhetherToRetreatEvent` - Choose to retreat or not

**Total Missing Transforms:** 20

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

1. `applyIssueCommandEvent` - Core command issuance
2. `applyCommitToMovementEvent` - Movement commitment
3. `applyCommitToRangedAttackEvent` - Ranged attack commitment
4. `applyResolveRangedAttackEvent` - Ranged attack resolution (procedure ✅ complete)
5. `applyStartEngagementEvent` - Engagement from movement
6. `applyCompleteUnitMovementEvent` - Complete movement
7. `applyCompleteRangedAttackCommandEvent` - Complete ranged attack

### Priority 2: Phase 4 Blockers (Enable Resolve Melee)

1. `applyCommitToMeleeEvent` - Melee commitment
2. `applyResolveMeleeEvent` - Melee resolution (procedure ✅ complete)
3. `applyCompleteMeleeResolutionEvent` - Complete melee

### Priority 3: Composable Substeps (Complete Combat Flow)

1. `applyResolveRoutEvent` - Rout penalty
2. `applyResolveRetreatEvent` - Retreat movement (procedure ✅ complete)
3. `applyResolveReverseEvent` - Reverse movement
4. `applyCompleteAttackApplyEvent` - Complete attack apply
5. `applyTriggerRoutFromRetreatEvent` - Rout from retreat
6. `applyChooseRetreatOptionEvent` - Retreat choice
7. `applyResolveFlankEngagementEvent` - Flank engagement
8. `applyResolveEngageRetreatOptionEvent` - Retreat option check
9. `applyChooseWhetherToRetreatEvent` - Retreat decision

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

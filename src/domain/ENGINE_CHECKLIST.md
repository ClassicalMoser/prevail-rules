# Engine Implementation Checklist

This document tracks the implementation status of all four engines. Use this to track progress and identify what remains to be built.

**📋 See [`ROUND_ANALYSIS.md`](./ROUND_ANALYSIS.md) for a phase-by-phase breakdown of what each engine needs to handle.**

## 1. Pure Transform Engine

**Location:** `transforms/applyEvent.ts`

**Status:** ✅ Core engine complete, routing implemented

### Player Choice Events (14 total)

- [x] `chooseCard` → `applyChooseCardEvent`
- [x] `chooseMeleeResolution` → `applyChooseMeleeEvent`
- [x] `chooseRally` → `applyChooseRallyEvent`
- [x] `chooseRoutDiscard` → `applyChooseRoutDiscardEvent`
- [ ] `chooseRetreatOption` → `applyChooseRetreatOptionEvent` (not implemented)
- [ ] `chooseWhetherToRetreat` → `applyChooseWhetherToRetreatEvent` (not implemented)
- [ ] `commitToMelee` → `applyCommitToMeleeEvent` (not implemented)
- [ ] `commitToMovement` → `applyCommitToMovementEvent` (not implemented)
- [ ] `commitToRangedAttack` → `applyCommitToRangedAttackEvent` (not implemented)
- [ ] `issueCommand` → `applyIssueCommandEvent` (not implemented)
- [x] `moveCommander` → `applyMoveCommanderEvent`
- [x] `moveUnit` → `applyMoveUnitEvent`
- [x] `performRangedAttack` → `applyPerformRangedAttackEvent`
- [x] `setupUnits` → `applySetupUnitsEvent`

**Progress:** 8/14 (57%)

### Game Effect Events (23 total)

- [x] `completeCleanupPhase` → `applyCompleteCleanupPhaseEvent`
- [x] `completeIssueCommandsPhase` → `applyCompleteIssueCommandsPhaseEvent`
- [x] `completeMoveCommandersPhase` → `applyCompleteMoveCommandersPhaseEvent`
- [x] `completePlayCardsPhase` → `applyCompletePlayCardsPhaseEvent`
- [x] `completeResolveMeleePhase` → `applyCompleteResolveMeleePhaseEvent`
- [ ] `completeUnitMovement` → `applyCompleteUnitMovementEvent` (not implemented)
- [ ] `completeAttackApply` → `applyCompleteAttackApplyEvent` (not implemented)
- [ ] `completeRangedAttackCommand` → `applyCompleteRangedAttackCommandEvent` (not implemented)
- [x] `discardPlayedCards` → `applyDiscardPlayedCardsEvent`
- [ ] `resolveEngageRetreatOption` → `applyResolveEngageRetreatOptionEvent` (not implemented)
- [ ] `resolveEngagementType` → `applyResolveEngagementTypeEvent` (not implemented)
- [ ] `resolveFlankEngagement` → `applyResolveFlankEngagementEvent` (not implemented)
- [x] `resolveInitiative` → `applyResolveInitiativeEvent`
- [ ] `resolveMelee` → `applyResolveMeleeEvent` (not implemented)
- [x] `resolveRally` → `applyResolveRallyEvent`
- [ ] `resolveRangedAttack` → `applyResolveRangedAttackEvent` (not implemented)
- [ ] `resolveRetreat` → `applyResolveRetreatEvent` (not implemented)
- [ ] `resolveReverse` → `applyResolveReverseEvent` (not implemented)
- [ ] `resolveRout` → `applyResolveRoutEvent` (not implemented)
- [x] `resolveRoutDiscard` → `applyResolveRoutDiscardEvent`
- [x] `resolveUnitsBroken` → `applyResolveUnitsBrokenEvent`
- [x] `revealCards` → `applyRevealCardsEvent`
- [ ] `startEngagement` → `applyStartEngagementEvent` (not implemented)

**Progress:** 10/25 (40%)

**Overall Transform Engine Progress:** 18/39 (46%)

---

## 2. Validation Engine

**Location:** `validation/validateEvent.ts`

**Status:** ✅ Core routing complete, phase-specific validation in progress

### Phase-Specific Validation (5 phases)

- [x] `playCards` → `validatePlayCardsPhaseEvent`
- [x] `moveCommanders` → `validateMoveCommandersPhaseEvent`
- [ ] `issueCommands` → `validateIssueCommandsPhaseEvent` (not implemented)
- [ ] `resolveMelee` → `validateResolveMeleePhaseEvent` (not implemented)
- [x] `cleanup` → `validateCleanupPhaseEvent`

**Progress:** 3/5 (60%)

### Individual Player Choice Validators

- [x] `isValidChooseCardEvent`
- [ ] `isValidChooseMeleeResolutionEvent` (may be handled by phase validation)
- [x] `isValidChooseRallyEvent`
- [x] `isValidChooseRoutDiscardEvent`
- [ ] `isValidChooseRetreatOptionEvent` (not implemented)
- [ ] `isValidChooseWhetherToRetreatEvent` (not implemented)
- [ ] `isValidCommitToMeleeEvent` (not implemented)
- [ ] `isValidCommitToMovementEvent` (not implemented)
- [ ] `isValidCommitToRangedAttackEvent` (not implemented)
- [ ] `isValidIssueCommandEvent` (not implemented)
- [x] `isValidMoveCommanderEvent`
- [ ] `isValidMoveUnitEvent` (may be handled by phase validation)
- [ ] `isValidPerformRangedAttackEvent` (not implemented - may be handled by phase validation)
- [ ] `isValidSetupUnitsEvent` (may be handled by phase validation)

**Progress:** 4/14 (29%)

**Overall Validation Engine Progress:** Needs assessment - some validation may be handled at phase level

---

## 3. Procedure Library

**Location:** `procedures/procedureRegistry.ts`

**Status:** ✅ Registry structure complete, procedures in progress

### Procedures Implemented

Game effects that have procedures to generate them:

- [x] `completeCleanupPhase` → `generateCompleteCleanupPhaseEvent`
- [x] `completeIssueCommandsPhase` → `generateCompleteIssueCommandsPhaseEvent`
- [x] `completeMoveCommandersPhase` → `generateCompleteMoveCommandersPhaseEvent`
- [x] `completePlayCardsPhase` → `generateCompletePlayCardsPhaseEvent`
- [x] `completeResolveMeleePhase` → `generateCompleteResolveMeleePhaseEvent`
- [x] `discardPlayedCards` → `generateDiscardPlayedCardsEvent`
- [x] `resolveInitiative` → `generateResolveInitiativeEvent`
- [x] `resolveRally` → `generateResolveRallyEvent`
- [x] `resolveUnitsBroken` → `generateResolveUnitsBrokenEvent`
- [x] `revealCards` → `generateRevealCardsEvent`

### Procedures Still Needed

- [ ] `completeUnitMovement` → `generateCompleteUnitMovementEvent`
- [ ] `completeAttackApply` → `generateCompleteAttackApplyEvent`
- [ ] `completeRangedAttackCommand` → `generateCompleteRangedAttackCommandEvent`
- [ ] `resolveEngageRetreatOption` → `generateResolveEngageRetreatOptionEvent`
- [ ] `resolveEngagementType` → `generateResolveEngagementTypeEvent`
- [ ] `resolveFlankEngagement` → `generateResolveFlankEngagementEvent`
- [ ] `resolveMelee` → `generateResolveMeleeEvent`
- [ ] `resolveRangedAttack` → `generateResolveRangedAttackEvent`
- [ ] `resolveRetreat` → `generateResolveRetreatEvent`
- [ ] `resolveReverse` → `generateResolveReverseEvent`
- [ ] `resolveRout` → `generateResolveRoutEvent`
- [ ] `startEngagement` → `generateStartEngagementEvent`

**Note:** All game effects require procedures. When the Next Event Expected Engine returns a game effect, a procedure must generate that event from the current game state.

**Progress:** 10/22 (45%) - 10 implemented, 12 remaining

---

## 4. Next Event Expected Engine

**Location:** `queries/expectedEvent/getExpectedEvent.ts`

**Status:** ✅ Core routing complete, phase-specific functions in progress

### Phase-Specific Expected Event Functions (5 phases)

- [x] `playCards` → `getExpectedPlayCardsPhaseEvent`
- [x] `moveCommanders` → `getExpectedMoveCommandersPhaseEvent`
- [x] `issueCommands` → `getExpectedIssueCommandsPhaseEvent`
- [x] `resolveMelee` → `getExpectedResolveMeleePhaseEvent`
- [x] `cleanup` → `getExpectedCleanupPhaseEvent`

**Progress:** 5/5 (100%)

**Overall Next Event Expected Engine Progress:** 5/5 (100%)

---

## Summary

| Engine                            | Status         | Progress               |
| --------------------------------- | -------------- | ---------------------- |
| **1. Pure Transform Engine**      | 🟡 In Progress | 18/39 events (46%)     |
| **2. Validation Engine**          | 🟡 In Progress | 3/5 phases (60%)       |
| **3. Procedure Library**          | 🟡 In Progress | 10/22 identified (45%) |
| **4. Next Event Expected Engine** | ✅ Complete    | 5/5 phases (100%)      |

## Priority Work Items

### High Priority (Blocking Core Gameplay)

1. **Transform Engine:**
   - [ ] `issueCommand` event application
   - [ ] `commitToMelee` event application
   - [ ] `commitToMovement` event application
   - [ ] `commitToRangedAttack` event application
   - [x] `performRangedAttack` event application ✅
   - [ ] `completeAttackApply` event application
   - [ ] `completeRangedAttackCommand` event application

2. **Validation Engine:**
   - [ ] `issueCommands` phase validation
   - [ ] `resolveMelee` phase validation

3. **Next Event Expected Engine:**
   - [x] `resolveMelee` phase expected event ✅

### Medium Priority (Combat Resolution)

4. **Transform Engine:**
   - [ ] `chooseRetreatOption` event application
   - [ ] `chooseWhetherToRetreat` event application
   - [ ] `completeUnitMovement` event application
   - [ ] `resolveEngageRetreatOption` event application
   - [ ] `resolveEngagementType` event application
   - [ ] `resolveFlankEngagement` event application
   - [ ] `startEngagement` event application
   - [ ] `resolveMelee` event application
   - [ ] `resolveRangedAttack` event application
   - [x] Ranged attack expected event logic ✅ (with composable `getExpectedAttackApplyEvent`)
   - [ ] `resolveRetreat` event application
   - [ ] `resolveReverse` event application
   - [ ] `resolveRout` event application

5. **Procedure Library:**
   - [ ] Implement procedures for engagement and movement effects
   - [ ] Implement procedures for combat resolution effects

### Low Priority (Polish & Edge Cases)

6. **Validation Engine:**
   - [ ] Individual validators for remaining player choices (chooseRetreatOption, chooseWhetherToRetreat, etc.)
   - [ ] Comprehensive validation coverage

## Notes

- Some validation may be handled at the phase level rather than requiring individual event validators
- All game effects require procedures to generate them from game state
- The `resolveMelee` and `issueCommands` phases are critical blockers for full game flow
- Engagement system has been refactored: `resolveEngagement` replaced with `resolveEngagementType`, `resolveEngageRetreatOption`, `resolveFlankEngagement`, and `startEngagement`
- Unit movement system now includes `completeUnitMovement` event
- Retreat system includes `chooseRetreatOption` and `chooseWhetherToRetreat` player choices
- Ranged attack command resolution implemented:
  - ✅ `performRangedAttack` creates resolution state with pending commitments
  - ✅ Expected event logic handles commitment flow → `resolveRangedAttack` → attack results
  - ✅ Composable `getExpectedAttackApplyEvent` handles rout/retreat/reverse priority
  - ✅ `completeRangedAttackCommand` event created to advance to next command
  - ⏳ Still need: `commitToRangedAttack`, `resolveRangedAttack`, `completeAttackApply`, `completeRangedAttackCommand` transforms
- Consider creating a unified test suite that exercises all four engines together

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
- [ ] `performRangedAttack` → `applyPerformRangedAttackEvent` (not implemented)
- [x] `setupUnits` → `applySetupUnitsEvent`

**Progress:** 7/14 (50%)

### Game Effect Events (23 total)

- [x] `completeCleanupPhase` → `applyCompleteCleanupPhaseEvent`
- [x] `completeIssueCommandsPhase` → `applyCompleteIssueCommandsPhaseEvent`
- [x] `completeMoveCommandersPhase` → `applyCompleteMoveCommandersPhaseEvent`
- [x] `completePlayCardsPhase` → `applyCompletePlayCardsPhaseEvent`
- [x] `completeResolveMeleePhase` → `applyCompleteResolveMeleePhaseEvent`
- [ ] `completeUnitMovement` → `applyCompleteUnitMovementEvent` (not implemented)
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

**Progress:** 10/23 (43%)

**Overall Transform Engine Progress:** 17/37 (46%)

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
- [ ] `isValidPerformRangedAttackEvent` (not implemented)
- [ ] `isValidSetupUnitsEvent` (may be handled by phase validation)

**Progress:** 4/14 (29%)

**Overall Validation Engine Progress:** Needs assessment - some validation may be handled at phase level

---

## 3. Procedure Library

**Location:** `procedures/procedureRegistry.ts`

**Status:** ✅ Registry structure complete, procedures in progress

### Procedures Implemented

Game effects that require procedures to generate them deterministically:

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

- [ ] `completeUnitMovement` → `generateCompleteUnitMovementEvent` (if needed)
- [ ] `resolveEngageRetreatOption` → `generateResolveEngageRetreatOptionEvent` (if needed)
- [ ] `resolveEngagementType` → `generateResolveEngagementTypeEvent` (if needed)
- [ ] `resolveFlankEngagement` → `generateResolveFlankEngagementEvent` (if needed)
- [ ] `resolveMelee` → `generateResolveMeleeEvent` (if needed)
- [ ] `resolveRangedAttack` → `generateResolveRangedAttackEvent` (if needed)
- [ ] `resolveRetreat` → `generateResolveRetreatEvent` (if needed)
- [ ] `resolveReverse` → `generateResolveReverseEvent` (if needed)
- [ ] `resolveRout` → `generateResolveRoutEvent` (if needed)
- [ ] `startEngagement` → `generateStartEngagementEvent` (if needed)

**Note:** Not all game effects need procedures. Some are simple state transitions that can be created directly. Procedures are needed for effects that require deterministic generation based on game state (calculations, randomness, etc.).

**Progress:** 10/20 identified (50%) - 10 implemented, 10 remaining to determine/implement

---

## 4. Next Event Expected Engine

**Location:** `queries/expectedEvent/getExpectedEvent.ts`

**Status:** ✅ Core routing complete, phase-specific functions in progress

### Phase-Specific Expected Event Functions (5 phases)

- [x] `playCards` → `getExpectedPlayCardsPhaseEvent`
- [x] `moveCommanders` → `getExpectedMoveCommandersPhaseEvent`
- [x] `issueCommands` → `getExpectedIssueCommandsPhaseEvent`
- [ ] `resolveMelee` → `getExpectedResolveMeleePhaseEvent` (not implemented)
- [x] `cleanup` → `getExpectedCleanupPhaseEvent`

**Progress:** 4/5 (80%)

**Overall Next Event Expected Engine Progress:** 4/5 (80%)

---

## Summary

| Engine                            | Status         | Progress               |
| --------------------------------- | -------------- | ---------------------- |
| **1. Pure Transform Engine**      | 🟡 In Progress | 18/37 events (49%)     |
| **2. Validation Engine**          | 🟡 In Progress | 3/5 phases (60%)       |
| **3. Procedure Library**          | 🟡 In Progress | 10/20 identified (50%) |
| **4. Next Event Expected Engine** | 🟡 In Progress | 4/5 phases (80%)       |

## Priority Work Items

### High Priority (Blocking Core Gameplay)

1. **Transform Engine:**
   - [ ] `issueCommand` event application
   - [ ] `commitToMelee` event application
   - [ ] `commitToMovement` event application
   - [ ] `commitToRangedAttack` event application
   - [ ] `performRangedAttack` event application

2. **Validation Engine:**
   - [ ] `issueCommands` phase validation
   - [ ] `resolveMelee` phase validation

3. **Next Event Expected Engine:**
   - [ ] `resolveMelee` phase expected event

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
   - [ ] `resolveRetreat` event application
   - [ ] `resolveReverse` event application
   - [ ] `resolveRout` event application

5. **Procedure Library:**
   - [ ] Determine which engagement and movement effects need procedures
   - [ ] Determine which combat resolution effects need procedures
   - [ ] Implement required procedures

### Low Priority (Polish & Edge Cases)

6. **Validation Engine:**
   - [ ] Individual validators for remaining player choices (chooseRetreatOption, chooseWhetherToRetreat, etc.)
   - [ ] Comprehensive validation coverage

## Notes

- Some validation may be handled at the phase level rather than requiring individual event validators
- Not all game effects require procedures - only those that need deterministic generation based on game state
- The `resolveMelee` and `issueCommands` phases are critical blockers for full game flow
- Engagement system has been refactored: `resolveEngagement` replaced with `resolveEngagementType`, `resolveEngageRetreatOption`, `resolveFlankEngagement`, and `startEngagement`
- Unit movement system now includes `completeUnitMovement` event
- Retreat system includes `chooseRetreatOption` and `chooseWhetherToRetreat` player choices
- Consider creating a unified test suite that exercises all four engines together

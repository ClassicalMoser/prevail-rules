# Engine Implementation Checklist

This document tracks the implementation status of all four engines. Use this to track progress and identify what remains to be built.

## 1. Pure Transform Engine

**Location:** `transforms/applyEvent.ts`

**Status:** ✅ Core engine complete, routing implemented

### Player Choice Events (12 total)

- [x] `chooseCard` → `applyChooseCardEvent`
- [x] `chooseMeleeResolution` → `applyChooseMeleeEvent`
- [x] `chooseRally` → `applyChooseRallyEvent`
- [x] `chooseRoutDiscard` → `applyChooseRoutDiscardEvent`
- [ ] `commitToMelee` → `applyCommitToMeleeEvent` (not implemented)
- [ ] `commitToMovement` → `applyCommitToMovementEvent` (not implemented)
- [ ] `commitToRangedAttack` → `applyCommitToRangedAttackEvent` (not implemented)
- [ ] `issueCommand` → `applyIssueCommandEvent` (not implemented)
- [x] `moveCommander` → `applyMoveCommanderEvent`
- [x] `moveUnit` → `applyMoveUnitEvent`
- [ ] `performRangedAttack` → `applyPerformRangedAttackEvent` (not implemented)
- [x] `setupUnits` → `applySetupUnitsEvent`

**Progress:** 7/12 (58%)

### Game Effect Events (18 total)

- [x] `completeCleanupPhase` → `applyCompleteCleanupPhaseEvent`
- [x] `completeIssueCommandsPhase` → `applyCompleteIssueCommandsPhaseEvent`
- [x] `completeMoveCommandersPhase` → `applyCompleteMoveCommandersPhaseEvent`
- [x] `completePlayCardsPhase` → `applyCompletePlayCardsPhaseEvent`
- [x] `completeResolveMeleePhase` → `applyCompleteResolveMeleePhaseEvent`
- [x] `discardPlayedCards` → `applyDiscardPlayedCardsEvent`
- [ ] `resolveEngagement` → `applyResolveEngagementEvent` (not implemented)
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

**Progress:** 11/18 (61%)

**Overall Transform Engine Progress:** 18/30 (60%)

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
- [ ] `isValidCommitToMeleeEvent` (not implemented)
- [ ] `isValidCommitToMovementEvent` (not implemented)
- [ ] `isValidCommitToRangedAttackEvent` (not implemented)
- [ ] `isValidIssueCommandEvent` (not implemented)
- [x] `isValidMoveCommanderEvent`
- [ ] `isValidMoveUnitEvent` (may be handled by phase validation)
- [ ] `isValidPerformRangedAttackEvent` (not implemented)
- [ ] `isValidSetupUnitsEvent` (may be handled by phase validation)

**Progress:** 4/12 (33%)

**Overall Validation Engine Progress:** Needs assessment - some validation may be handled at phase level

---

## 3. Procedure Library

**Location:** `procedures/procedureRegistry.ts`

**Status:** ✅ Registry structure complete, procedures in progress

### Procedures Needed (to be determined)

Some game effects require procedures to generate them deterministically. The following are confirmed:

- [x] `resolveRally` → `generateResolveRallyEvent`
- [x] `resolveUnitsBroken` → `generateResolveUnitsBrokenEvent`

### Potential Procedures (need to determine which effects need procedures)

- [ ] `resolveEngagement` → `generateResolveEngagementEvent` (if needed)
- [ ] `resolveMelee` → `generateResolveMeleeEvent` (if needed)
- [ ] `resolveRangedAttack` → `generateResolveRangedAttackEvent` (if needed)
- [ ] `resolveRetreat` → `generateResolveRetreatEvent` (if needed)
- [ ] `resolveReverse` → `generateResolveReverseEvent` (if needed)
- [ ] `resolveRout` → `generateResolveRoutEvent` (if needed)

**Note:** Not all game effects need procedures. Some are simple state transitions that can be created directly. Need to determine which effects require deterministic generation based on game state.

**Progress:** 2/2 confirmed (100% of known procedures), but more may be needed

---

## 4. Next Event Expected Engine

**Location:** `queries/expectedEvent/getExpectedEvent.ts`

**Status:** ✅ Core routing complete, phase-specific functions in progress

### Phase-Specific Expected Event Functions (5 phases)

- [x] `playCards` → `getExpectedPlayCardsPhaseEvent`
- [x] `moveCommanders` → `getExpectedMoveCommandersPhaseEvent`
- [ ] `issueCommands` → `getExpectedIssueCommandsPhaseEvent` (not implemented)
- [ ] `resolveMelee` → `getExpectedResolveMeleePhaseEvent` (not implemented)
- [x] `cleanup` → `getExpectedCleanupPhaseEvent`

**Progress:** 3/5 (60%)

**Overall Next Event Expected Engine Progress:** 3/5 (60%)

---

## Summary

| Engine                            | Status         | Progress                             |
| --------------------------------- | -------------- | ------------------------------------ |
| **1. Pure Transform Engine**      | 🟡 In Progress | 18/30 events (60%)                   |
| **2. Validation Engine**          | 🟡 In Progress | 3/5 phases (60%)                     |
| **3. Procedure Library**          | 🟡 In Progress | 2/2 known (100%), more may be needed |
| **4. Next Event Expected Engine** | 🟡 In Progress | 3/5 phases (60%)                     |

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
   - [ ] `issueCommands` phase expected event
   - [ ] `resolveMelee` phase expected event

### Medium Priority (Combat Resolution)

4. **Transform Engine:**
   - [ ] `resolveEngagement` event application
   - [ ] `resolveMelee` event application
   - [ ] `resolveRangedAttack` event application
   - [ ] `resolveRetreat` event application
   - [ ] `resolveReverse` event application
   - [ ] `resolveRout` event application

5. **Procedure Library:**
   - [ ] Determine which combat resolution effects need procedures
   - [ ] Implement required procedures

### Low Priority (Polish & Edge Cases)

6. **Validation Engine:**
   - [ ] Individual validators for remaining player choices
   - [ ] Comprehensive validation coverage

## Notes

- Some validation may be handled at the phase level rather than requiring individual event validators
- Not all game effects require procedures - only those that need deterministic generation based on game state
- The `resolveMelee` and `issueCommands` phases are critical blockers for full game flow
- Consider creating a unified test suite that exercises all four engines together

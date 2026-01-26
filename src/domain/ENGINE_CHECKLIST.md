# Engine Implementation Checklist

This document tracks the implementation status of all four engines. Use this to track progress and identify what remains to be built.

**📋 See [`IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md) for a comprehensive view combining flow analysis, round analysis, and implementation status.**

## 1. Pure Transform Engine

**Location:** `transforms/applyEvent.ts`

**Status:** ✅ Core engine complete, routing implemented

### Player Choice Events (14 total)

- [x] `chooseCard` → `applyChooseCardEvent`
- [x] `chooseMeleeResolution` → `applyChooseMeleeEvent`
- [x] `chooseRally` → `applyChooseRallyEvent`
- [x] `chooseRoutDiscard` → `applyChooseRoutDiscardEvent`
- [x] `chooseRetreatOption` → `applyChooseRetreatOptionEvent`
- [x] `chooseWhetherToRetreat` → `applyChooseWhetherToRetreatEvent`
- [x] `commitToMelee` → `applyCommitToMeleeEvent`
- [x] `commitToMovement` → `applyCommitToMovementEvent`
- [x] `commitToRangedAttack` → `applyCommitToRangedAttackEvent`
- [x] `issueCommand` → `applyIssueCommandEvent`
- [x] `moveCommander` → `applyMoveCommanderEvent`
- [x] `moveUnit` → `applyMoveUnitEvent`
- [x] `performRangedAttack` → `applyPerformRangedAttackEvent`
- [x] `setupUnits` → `applySetupUnitsEvent`

**Progress:** 14/14 (100%)

### Game Effect Events (24 total)

- [x] `completeCleanupPhase` → `applyCompleteCleanupPhaseEvent`
- [x] `completeIssueCommandsPhase` → `applyCompleteIssueCommandsPhaseEvent`
- [x] `completeMoveCommandersPhase` → `applyCompleteMoveCommandersPhaseEvent`
- [x] `completePlayCardsPhase` → `applyCompletePlayCardsPhaseEvent`
- [x] `completeResolveMeleePhase` → `applyCompleteResolveMeleePhaseEvent`
- [x] `completeUnitMovement` → `applyCompleteUnitMovementEvent`
- [x] `completeAttackApply` → `applyCompleteAttackApplyEvent`
- [x] `completeMeleeResolution` → `applyCompleteMeleeResolutionEvent`
- [x] `completeRangedAttackCommand` → `applyCompleteRangedAttackCommandEvent`
- [x] `discardPlayedCards` → `applyDiscardPlayedCardsEvent`
- [x] `resolveEngageRetreatOption` → `applyResolveEngageRetreatOptionEvent`
- [x] `resolveFlankEngagement` → `applyResolveFlankEngagementEvent`
- [x] `resolveInitiative` → `applyResolveInitiativeEvent`
- [x] `resolveMelee` → `applyResolveMeleeEvent`
- [x] `resolveRally` → `applyResolveRallyEvent`
- [x] `resolveRangedAttack` → `applyResolveRangedAttackEvent`
- [x] `resolveRetreat` → `applyResolveRetreatEvent`
- [x] `resolveReverse` → `applyResolveReverseEvent`
- [x] `resolveRout` → `applyResolveRoutEvent`
- [x] `resolveRoutDiscard` → `applyResolveRoutDiscardEvent`
- [x] `resolveUnitsBroken` → `applyResolveUnitsBrokenEvent`
- [x] `revealCards` → `applyRevealCardsEvent`
- [x] `startEngagement` → `applyStartEngagementEvent`
- [x] `triggerRoutFromRetreat` → `applyTriggerRoutFromRetreatEvent`

**Progress:** 24/24 (100%)

**Overall Transform Engine Progress:** 38/38 (100%)

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

- [x] `completeAttackApply` → `generateCompleteAttackApplyEvent`
- [x] `completeCleanupPhase` → `generateCompleteCleanupPhaseEvent`
- [x] `completeIssueCommandsPhase` → `generateCompleteIssueCommandsPhaseEvent`
- [x] `completeMeleeResolution` → `generateCompleteMeleeResolutionEvent`
- [x] `completeMoveCommandersPhase` → `generateCompleteMoveCommandersPhaseEvent`
- [x] `completePlayCardsPhase` → `generateCompletePlayCardsPhaseEvent`
- [x] `completeRangedAttackCommand` → `generateCompleteRangedAttackCommandEvent`
- [x] `completeResolveMeleePhase` → `generateCompleteResolveMeleePhaseEvent`
- [x] `completeUnitMovement` → `generateCompleteUnitMovementEvent`
- [x] `discardPlayedCards` → `generateDiscardPlayedCardsEvent`
- [x] `resolveEngageRetreatOption` → `generateResolveEngageRetreatOptionEvent`
- [x] `resolveEngagementType` → `generateResolveEngagementTypeEvent`
- [x] `resolveFlankEngagement` → `generateResolveFlankEngagementEvent`
- [x] `resolveInitiative` → `generateResolveInitiativeEvent`
- [x] `resolveRally` → `generateResolveRallyEvent`
- [x] `resolveMelee` → `generateResolveMeleeEvent`
- [x] `resolveRangedAttack` → `generateResolveRangedAttackEvent`
- [x] `resolveRetreat` → `generateResolveRetreatEvent`
- [x] `resolveReverse` → `generateResolveReverseEvent`
- [x] `resolveRout` → `generateResolveRoutEvent`
- [x] `resolveUnitsBroken` → `generateResolveUnitsBrokenEvent`
- [x] `revealCards` → `generateRevealCardsEvent`
- [x] `startEngagement` → `generateStartEngagementEvent`

### Procedures Still Needed

**All procedures are now implemented (23/23).**

**Note:** All game effects require procedures. When the Next Event Expected Engine returns a game effect, a procedure must generate that event from the current game state.

**Progress:** 23/23 (100%) - All procedures implemented

---

## 4. Next Event Expected Engine

**Location:** `queries/expectedEvent/getExpectedEvent.ts`

**Status:** ✅ Core routing complete, phase-specific functions in progress

### Phase-Specific Expected Event Functions (5 phases)

- [x] `playCards` → `getExpectedPlayCardsPhaseEvent` ✅ (tests improved with schema validation)
- [x] `moveCommanders` → `getExpectedMoveCommandersPhaseEvent` ✅ (tests improved with schema validation)
- [x] `issueCommands` → `getExpectedIssueCommandsPhaseEvent` ⚠️ (implementation complete, tests pending)
- [x] `resolveMelee` → `getExpectedResolveMeleePhaseEvent`
- [x] `cleanup` → `getExpectedCleanupPhaseEvent`

**Progress:** 5/5 (100% implementation), 3/5 (60% tested)

**Overall Next Event Expected Engine Progress:** 5/5 (100%)

**Test Quality:** ✅ Schema validation pattern applied to existing tests for improved type safety

---

## Summary

| Engine                            | Status         | Progress                 |
| --------------------------------- | -------------- | ------------------------ |
| **1. Pure Transform Engine**      | ✅ Complete    | 38/38 events (100%)      |
| **2. Validation Engine**          | 🟡 In Progress | 3/5 phases (60%)         |
| **3. Procedure Library**          | ✅ Complete    | 23/23 implemented (100%) |
| **4. Next Event Expected Engine** | ✅ Complete    | 5/5 phases (100%)        |

## Priority Work Items

### High Priority (Blocking Core Gameplay)

1. **Transform Engine:**
   - [x] `issueCommand` event application ✅
   - [x] `commitToMelee` event application ✅
   - [x] `commitToMovement` event application ✅
   - [x] `commitToRangedAttack` event application ✅
   - [x] `performRangedAttack` event application ✅
   - [x] `completeAttackApply` event application ✅
   - [x] `completeMeleeResolution` event application ✅
   - [x] `completeRangedAttackCommand` event application ✅

2. **Validation Engine:**
   - [ ] `issueCommands` phase validation
   - [ ] `resolveMelee` phase validation

3. **Next Event Expected Engine:**
   - [x] `resolveMelee` phase expected event ✅

### Medium Priority (Combat Resolution)

4. **Transform Engine:**
   - [x] `chooseRetreatOption` event application ✅
   - [x] `chooseWhetherToRetreat` event application ✅
   - [x] `completeUnitMovement` event application ✅
   - [x] `resolveEngageRetreatOption` event application ✅
   - [x] `resolveEngagementType` event application ✅
   - [x] `resolveFlankEngagement` event application ✅
   - [x] `startEngagement` event application ✅
   - [x] `resolveMelee` event application ✅
   - [x] `resolveRangedAttack` event application ✅
   - [x] Ranged attack expected event logic ✅ (with composable `getExpectedAttackApplyEvent`)
   - [x] `resolveRetreat` event application ✅
   - [x] `resolveReverse` event application ✅
   - [x] `resolveRout` event application ✅
   - [x] `triggerRoutFromRetreat` event application ✅

5. **Procedure Library:**
   - [x] Implement procedures for simple completion events ✅ (completeAttackApply, completeMeleeResolution, completeRangedAttackCommand, completeUnitMovement)
   - [x] Implement procedures for engagement type resolution ✅ (resolveEngagementType, resolveEngageRetreatOption)
   - [x] Implement procedure for reverse resolution ✅ (resolveReverse)

- [x] Implement procedures for combat resolution effects (resolveMelee, resolveRangedAttack) ✅
- [x] Implement procedures for movement/positioning effects (resolveRetreat) ✅
- [x] Implement procedure for flank engagement (resolveFlankEngagement) ✅

### Low Priority (Polish & Edge Cases)

6. **Validation Engine:**
   - [ ] Individual validators for remaining player choices (chooseRetreatOption, chooseWhetherToRetreat, etc.)
   - [ ] Comprehensive validation coverage

## Notes

- **🎯 MILESTONE: Event Model Complete** - All required events for a full game stream have been identified and defined. From this point forward, work will focus on implementation (reducing checklist items) rather than discovery (adding new events).

- **🏗️ MILESTONE: Transform Architecture Refactored** - Pure transforms have been massively cleaned up:
  - ✅ All sequencing pure transforms refactored to follow `GameState`-in, `GameState`-out pattern
  - ✅ Pure transforms now use queries internally instead of requiring callers to extract nested state
  - ✅ Pure transforms directory reorganized into logical subdirectories: `board/`, `cards/`, `commanders/`, `units/`, `state/`, `sequencing/`
  - ✅ All index.ts files updated to use explicit exports (no `export *`)
  - ✅ 8 sequencing transforms refactored: `updateRetreatState`, `updateRoutState`, `updateReverseState`, `updateAttackApplyState`, `updateCommandResolutionState`, `updateMeleeResolutionState`, `updateMeleeAttackApplyState`, `updateRetreatRoutState`
  - ✅ All transforms now use `updatePhaseState` for consistent phase state updates
  - ✅ Better alignment with CQRS principles: transforms can call queries, queries cannot call transforms

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
  - ✅ All transforms implemented: `commitToRangedAttack`, `resolveRangedAttack`, `completeAttackApply`, `completeRangedAttackCommand`
- Melee resolution flow implemented:
  - ✅ Expected event logic handles commitment flow (by initiative order) → `resolveMelee` → attack results (by initiative order)
  - ✅ Composable `getExpectedAttackApplyEvent` reused for both players' results
  - ✅ `completeMeleeResolution` event created to clear melee resolution state and continue phase
  - ✅ All transforms implemented: `commitToMelee`, `resolveMelee`, `completeAttackApply`, `completeMeleeResolution`
- Consider creating a unified test suite that exercises all four engines together
- **Next opportunity:** Refactor remaining event apply transforms to use the new pure transforms (e.g., `applyResolveRetreatEvent`, `applyTriggerRoutFromRetreatEvent`, `applyResolveRoutEvent`, `applyCompleteAttackApplyEvent`)
- **Test Quality:** ✅ Applied schema validation pattern to expected event tests (`getExpectedPlayCardsPhaseEvent`, `getExpectedMoveCommandersPhaseEvent`, `getExpectedAttackApplyEvent`) for improved type safety and explicit validation

# Round Flow Analysis Across All Four Engines

This document traces a complete round from start to finish, checking what each of the four engines needs to handle at each phase and step.

## Round Structure

A round consists of 5 phases in order:
1. **Play Cards** - Players choose command cards
2. **Move Commanders** - Players move their commanders
3. **Issue Commands** - Players issue commands to units
4. **Resolve Melee** - Resolve all engagements
5. **Cleanup** - Discard cards, rally, check unit support

---

## Phase 1: Play Cards

**Steps:** `chooseCards` → `revealCards` → `assignInitiative` → `complete`

### Step 1: `chooseCards`
**Expected:** `playerChoice` from `bothPlayers` - `chooseCard`

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ✅ Complete | `applyChooseCardEvent` implemented |
| **2. Validation** | ✅ Complete | `isValidChooseCardEvent` + phase validation |
| **3. Procedure** | N/A | Player choice, no procedure needed |
| **4. Next Event** | ✅ Complete | Returns `bothPlayers` / `chooseCard` |

### Step 2: `revealCards`
**Expected:** `gameEffect` - `revealCards`

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ✅ Complete | `applyRevealCardsEvent` implemented |
| **2. Validation** | ✅ Complete | Phase validation checks for `revealCards` |
| **3. Procedure** | ✅ Complete | `generateRevealCardsEvent` ✅ |
| **4. Next Event** | ✅ Complete | Returns `gameEffect` / `revealCards` |

### Step 3: `assignInitiative`
**Expected:** `gameEffect` - `resolveInitiative`

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ✅ Complete | `applyResolveInitiativeEvent` implemented |
| **2. Validation** | ✅ Complete | Phase validation checks for `resolveInitiative` |
| **3. Procedure** | ✅ Complete | `generateResolveInitiativeEvent` ✅ |
| **4. Next Event** | ✅ Complete | Returns `gameEffect` / `resolveInitiative` |

### Step 4: `complete`
**Expected:** `gameEffect` - `completePlayCardsPhase`

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ✅ Complete | `applyCompletePlayCardsPhaseEvent` implemented |
| **2. Validation** | ✅ Complete | Phase validation checks for `completePlayCardsPhase` |
| **3. Procedure** | ✅ Complete | `generateCompletePlayCardsPhaseEvent` ✅ |
| **4. Next Event** | ✅ Complete | Returns `gameEffect` / `completePlayCardsPhase` |

**Phase 1 Summary:** ✅ **Fully Complete** - All engines handle all steps

---

## Phase 2: Move Commanders

**Steps:** `moveFirstCommander` → `moveSecondCommander` → `complete`

### Step 1: `moveFirstCommander`
**Expected:** `playerChoice` from `firstPlayer` (initiative) - `moveCommander`

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ✅ Complete | `applyMoveCommanderEvent` implemented |
| **2. Validation** | ✅ Complete | `isValidMoveCommanderEvent` + phase validation |
| **3. Procedure** | N/A | Player choice, no procedure needed |
| **4. Next Event** | ✅ Complete | Returns `firstPlayer` / `moveCommander` |

### Step 2: `moveSecondCommander`
**Expected:** `playerChoice` from `secondPlayer` (non-initiative) - `moveCommander`

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ✅ Complete | `applyMoveCommanderEvent` implemented (same function) |
| **2. Validation** | ✅ Complete | `isValidMoveCommanderEvent` + phase validation |
| **3. Procedure** | N/A | Player choice, no procedure needed |
| **4. Next Event** | ✅ Complete | Returns `secondPlayer` / `moveCommander` |

### Step 3: `complete`
**Expected:** `gameEffect` - `completeMoveCommandersPhase`

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ✅ Complete | `applyCompleteMoveCommandersPhaseEvent` implemented |
| **2. Validation** | ✅ Complete | Phase validation checks for `completeMoveCommandersPhase` |
| **3. Procedure** | ✅ Complete | `generateCompleteMoveCommandersPhaseEvent` ✅ |
| **4. Next Event** | ✅ Complete | Returns `gameEffect` / `completeMoveCommandersPhase` |

**Phase 2 Summary:** ✅ **Fully Complete** - All engines handle all steps

---

## Phase 3: Issue Commands

**Steps:** `firstPlayerIssueCommands` → `firstPlayerResolveCommands` → `secondPlayerIssueCommands` → `secondPlayerResolveCommands` → `complete`

### Step 1: `firstPlayerIssueCommands`
**Expected:** `playerChoice` from `firstPlayer` - `issueCommand` (loop until all commands issued)

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ❌ **Missing** | `applyIssueCommandEvent` not implemented |
| **2. Validation** | ❌ **Missing** | `validateIssueCommandsPhaseEvent` not implemented |
| **3. Procedure** | N/A | Player choice, no procedure needed |
| **4. Next Event** | ❌ **Missing** | `getExpectedIssueCommandsPhaseEvent` not implemented |

### Step 2: `firstPlayerResolveCommands`
**Expected:** `playerChoice` from `firstPlayer` - `moveUnit` or `performRangedAttack` (loop through issued commands)

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ⚠️ Partial | `applyMoveUnitEvent` ✅, `applyPerformRangedAttackEvent` ❌ |
| **2. Validation** | ❌ **Missing** | Phase validation not implemented |
| **3. Procedure** | N/A | Player choices, no procedures needed |
| **4. Next Event** | ❌ **Missing** | `getExpectedIssueCommandsPhaseEvent` not implemented |

### Step 3: `secondPlayerIssueCommands`
**Expected:** `playerChoice` from `secondPlayer` - `issueCommand` (loop until all commands issued)

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ❌ **Missing** | `applyIssueCommandEvent` not implemented |
| **2. Validation** | ❌ **Missing** | Phase validation not implemented |
| **3. Procedure** | N/A | Player choice, no procedure needed |
| **4. Next Event** | ❌ **Missing** | `getExpectedIssueCommandsPhaseEvent` not implemented |

### Step 4: `secondPlayerResolveCommands`
**Expected:** `playerChoice` from `secondPlayer` - `moveUnit` or `performRangedAttack` (loop through issued commands)

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ⚠️ Partial | `applyMoveUnitEvent` ✅, `applyPerformRangedAttackEvent` ❌ |
| **2. Validation** | ❌ **Missing** | Phase validation not implemented |
| **3. Procedure** | N/A | Player choices, no procedures needed |
| **4. Next Event** | ❌ **Missing** | `getExpectedIssueCommandsPhaseEvent` not implemented |

### Step 5: `complete`
**Expected:** `gameEffect` - `completeIssueCommandsPhase`

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ✅ Complete | `applyCompleteIssueCommandsPhaseEvent` implemented |
| **2. Validation** | ❌ **Missing** | Phase validation not implemented |
| **3. Procedure** | ✅ Complete | `generateCompleteIssueCommandsPhaseEvent` ✅ |
| **4. Next Event** | ❌ **Missing** | `getExpectedIssueCommandsPhaseEvent` not implemented |

**Phase 3 Summary:** ❌ **Critical Blocker** - Missing:
- `applyIssueCommandEvent` (transform)
- `applyPerformRangedAttackEvent` (transform)
- `validateIssueCommandsPhaseEvent` (validation)
- `getExpectedIssueCommandsPhaseEvent` (next event)

---

## Phase 4: Resolve Melee

**Steps:** `resolveMelee` → `complete`

### Step 1: `resolveMelee`
**Expected:** Complex loop:
1. `playerChoice` from `firstPlayer` - `chooseMeleeResolution` (choose engagement)
2. `playerChoice` from `firstPlayer` - `commitToMelee` (optional, loop)
3. `playerChoice` from `secondPlayer` - `commitToMelee` (optional, loop)
4. `gameEffect` - `resolveMelee` (deterministic resolution)
5. Repeat until all engagements resolved

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ⚠️ Partial | `applyChooseMeleeEvent` ✅, `applyCommitToMeleeEvent` ❌, `applyResolveMeleeEvent` ❌ |
| **2. Validation** | ❌ **Missing** | `validateResolveMeleePhaseEvent` not implemented |
| **3. Procedure** | ❓ Unknown | `resolveMelee` likely needs procedure (deterministic combat calculation) |
| **4. Next Event** | ❌ **Missing** | `getExpectedResolveMeleePhaseEvent` not implemented |

### Step 2: `complete`
**Expected:** `gameEffect` - `completeResolveMeleePhase`

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ✅ Complete | `applyCompleteResolveMeleePhaseEvent` implemented |
| **2. Validation** | ❌ **Missing** | Phase validation not implemented |
| **3. Procedure** | ✅ Complete | `generateCompleteResolveMeleePhaseEvent` ✅ |
| **4. Next Event** | ❌ **Missing** | `getExpectedResolveMeleePhaseEvent` not implemented |

**Phase 4 Summary:** ❌ **Critical Blocker** - Missing:
- `applyCommitToMeleeEvent` (transform)
- `applyResolveMeleeEvent` (transform)
- `validateResolveMeleePhaseEvent` (validation)
- `getExpectedResolveMeleePhaseEvent` (next event)
- Procedure for `resolveMelee` (if needed)

---

## Phase 5: Cleanup

**Steps:** `discardPlayedCards` → `firstPlayerChooseRally` → `firstPlayerResolveRally` → `secondPlayerChooseRally` → `secondPlayerResolveRally` → `complete`

### Step 1: `discardPlayedCards`
**Expected:** `gameEffect` - `discardPlayedCards`

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ✅ Complete | `applyDiscardPlayedCardsEvent` implemented |
| **2. Validation** | ✅ Complete | Phase validation checks for `discardPlayedCards` |
| **3. Procedure** | ✅ Complete | `generateDiscardPlayedCardsEvent` ✅ |
| **4. Next Event** | ✅ Complete | Returns `gameEffect` / `discardPlayedCards` |

### Step 2: `firstPlayerChooseRally`
**Expected:** `playerChoice` from `firstPlayer` - `chooseRally`

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ✅ Complete | `applyChooseRallyEvent` implemented |
| **2. Validation** | ✅ Complete | `isValidChooseRallyEvent` + phase validation |
| **3. Procedure** | N/A | Player choice, no procedure needed |
| **4. Next Event** | ✅ Complete | Returns `firstPlayer` / `chooseRally` |

### Step 3: `firstPlayerResolveRally`
**Expected:** Complex substeps:
1. `gameEffect` - `resolveRally` (if not resolved)
2. `gameEffect` - `resolveUnitsBroken` (if units lost support)
3. `playerChoice` from `firstPlayer` - `chooseRoutDiscard` (if rout penalty)
4. `gameEffect` - `resolveRoutDiscard` (if cards chosen)

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ✅ Complete | All events implemented |
| **2. Validation** | ✅ Complete | Phase validation handles all substeps |
| **3. Procedure** | ✅ Complete | `generateResolveRallyEvent` ✅, `generateResolveUnitsBrokenEvent` ✅ |
| **4. Next Event** | ✅ Complete | Handles all substeps correctly |

### Step 4: `secondPlayerChooseRally`
**Expected:** `playerChoice` from `secondPlayer` - `chooseRally`

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ✅ Complete | `applyChooseRallyEvent` implemented (same function) |
| **2. Validation** | ✅ Complete | `isValidChooseRallyEvent` + phase validation |
| **3. Procedure** | N/A | Player choice, no procedure needed |
| **4. Next Event** | ✅ Complete | Returns `secondPlayer` / `chooseRally` |

### Step 5: `secondPlayerResolveRally`
**Expected:** Same complex substeps as `firstPlayerResolveRally`

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ✅ Complete | All events implemented |
| **2. Validation** | ✅ Complete | Phase validation handles all substeps |
| **3. Procedure** | ✅ Complete | Procedures implemented |
| **4. Next Event** | ✅ Complete | Handles all substeps correctly |

### Step 6: `complete`
**Expected:** `gameEffect` - `completeCleanupPhase`

| Engine | Status | Notes |
|--------|--------|-------|
| **1. Transform** | ✅ Complete | `applyCompleteCleanupPhaseEvent` implemented |
| **2. Validation** | ✅ Complete | Phase validation checks for `completeCleanupPhase` |
| **3. Procedure** | ✅ Complete | `generateCompleteCleanupPhaseEvent` ✅ |
| **4. Next Event** | ✅ Complete | Returns `gameEffect` / `completeCleanupPhase` |

**Phase 5 Summary:** ✅ **Fully Complete** - All engines handle all steps

---

## Summary by Phase

| Phase | Transform | Validation | Procedure | Next Event | Overall |
|-------|-----------|------------|-----------|------------|---------|
| **1. Play Cards** | ✅ | ✅ | ✅ | ✅ | ✅ **Complete** |
| **2. Move Commanders** | ✅ | ✅ | ✅ | ✅ | ✅ **Complete** |
| **3. Issue Commands** | ❌ | ❌ | ✅ | ❌ | ❌ **Blocked** |
| **4. Resolve Melee** | ❌ | ❌ | ❓ | ❌ | ❌ **Blocked** |
| **5. Cleanup** | ✅ | ✅ | ✅ | ✅ | ✅ **Complete** |

## Critical Blockers

### Phase 3: Issue Commands
1. **Transform Engine:**
   - [ ] `applyIssueCommandEvent` - Apply command to units
   - [ ] `applyPerformRangedAttackEvent` - Apply ranged attack execution

2. **Validation Engine:**
   - [ ] `validateIssueCommandsPhaseEvent` - Validate events in issue commands phase
   - [ ] `isValidIssueCommandEvent` - Validate individual issue command events
   - [ ] `isValidPerformRangedAttackEvent` - Validate ranged attack events

3. **Next Event Expected Engine:**
   - [ ] `getExpectedIssueCommandsPhaseEvent` - Determine expected event for each step
   - Must handle loops: `remainingCommands` and `remainingUnits` tracking

### Phase 4: Resolve Melee
1. **Transform Engine:**
   - [ ] `applyCommitToMeleeEvent` - Apply card commitment to melee
   - [ ] `applyResolveMeleeEvent` - Apply melee resolution (combat calculation)

2. **Validation Engine:**
   - [ ] `validateResolveMeleePhaseEvent` - Validate events in resolve melee phase
   - [ ] `isValidCommitToMeleeEvent` - Validate commitment events
   - [ ] `isValidChooseMeleeResolutionEvent` - May need individual validator

3. **Procedure Library:**
   - [ ] Determine if `resolveMelee` needs procedure (likely yes - deterministic combat)
   - [ ] `generateResolveMeleeEvent` - If needed, generate melee resolution

4. **Next Event Expected Engine:**
   - [ ] `getExpectedResolveMeleePhaseEvent` - Determine expected event for each step
   - Must handle complex loop: choose engagement → commitments → resolve → repeat

## Additional Missing Pieces

### Transform Engine (Other Events)
- [ ] `applyCommitToMovementEvent` - Commit card to movement
- [ ] `applyCommitToRangedAttackEvent` - Commit card to ranged attack
- [ ] `applyResolveEngagementEvent` - Resolve engagement (from movement)
- [ ] `applyResolveRangedAttackEvent` - Resolve ranged attack
- [ ] `applyResolveRetreatEvent` - Resolve unit retreat
- [ ] `applyResolveReverseEvent` - Resolve unit facing reversal
- [ ] `applyResolveRoutEvent` - Resolve unit rout

### Procedure Library (To Determine)
- [ ] Determine which combat resolution effects need procedures
- [ ] `generateResolveEngagementEvent` - If needed
- [ ] `generateResolveRangedAttackEvent` - If needed
- [ ] `generateResolveRetreatEvent` - If needed
- [ ] `generateResolveReverseEvent` - If needed
- [ ] `generateResolveRoutEvent` - If needed

## Notes

- **Issue Commands** and **Resolve Melee** phases are the critical blockers for a complete round
- Both phases have complex loops that need careful state tracking
- The `resolveMelee` event likely needs a procedure to deterministically calculate combat results
- Some events may trigger other events (e.g., movement → engagement)
- The next event engine needs to handle conditional logic based on remaining commands/units/engagements

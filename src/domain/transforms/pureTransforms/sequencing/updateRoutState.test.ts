import { getRoutStateFromAttackApply } from '@queries';
import { throwIfBypassed, throwIfNone, throwIfPending } from '@utils';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRout,
  createCleanupPhaseState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRallyResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createResolveMeleePhaseState,
  createRoutState,
  createTestCard,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '../';

import { updateRoutState } from './updateRoutState';

import { createEmptyGameState } from '@factories';
import { updateCurrentInitiative } from '../state/updateCurrentInitiative';
/**
 * UpdateRoutState: Creates a new game state with the rout state updated.
 */
describe('updateRoutState function', () => {
  function createStateWithRangedAttackRout() {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white', { attack: 2 });
    const placement = placed(unit, 'E-5', 'north');
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, placement),
    };
    const attackApply = createAttackApplyStateWithRout(unit);
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: createRangedAttackResolutionState(
        stateWithUnit,
        {
          attackApplyState: attackApply,
        },
      ),
    });
    return updatePhaseState(stateWithUnit, phaseState);
  }

  function createStateWithMeleeRout(routingPlayer: 'white' | 'black') {
    const state = createEmptyGameState('standard');
    const routedUnit = createTestUnit(routingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      routingPlayer === 'white' ? 'black' : 'white',
      { attack: 2 },
    );
    const routedPlacement = placed(routedUnit, 'E-5', 'north');
    const otherPlacement = placed(otherUnit, 'E-5', 'south');
    let stateWithUnits = {
      ...state,
      boardState: addUnitToBoard(state.boardState, routedPlacement),
    };
    stateWithUnits = {
      ...stateWithUnits,
      boardState: addUnitToBoard(stateWithUnits.boardState, otherPlacement),
    };
    const attackApply = createAttackApplyStateWithRout(routedUnit);
    const melee = createMeleeResolutionState(
      stateWithUnits,
      routingPlayer === 'white'
        ? { secondPlayerAttackApplyState: attackApply }
        : { firstPlayerAttackApplyState: attackApply },
    );
    return updatePhaseState(
      stateWithUnits,
      createResolveMeleePhaseState(stateWithUnits, {
        currentMeleeResolutionState: melee,
      }),
    );
  }

  it('given update rout state in rear engagement during movement resolution', () => {
    const state = createEmptyGameState('standard');
    state.cardState.black.inPlay = createTestCard();
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const movement = createMovementResolutionState(state, {
      engagementState: createRearEngagementState({
        routState: createRoutState('white', whiteUnit),
      }),
    });
    const stateInPhase = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );
    const newRout = createRoutState('white', whiteUnit, {
      numberToDiscard: 3,
    });

    const newState = updateRoutState(stateInPhase, newRout);

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('issueCommands');
    if (phase.phase !== 'issueCommands') {
      throw new Error('phase');
    }
    const cmd = throwIfPending(phase.currentCommandResolutionState, 'command');
    if (cmd.commandResolutionType !== 'movement') {
      throw new Error('movement');
    }
    const engagement = throwIfPending(cmd.engagementState, 'engagement');
    const res = throwIfPending(
      engagement.engagementResolutionState,
      'resolution',
    );
    expect(res.engagementType).toBe('rear');
    if (res.engagementType !== 'rear') {
      throw new Error('rear');
    }
    expect(throwIfPending(res.routState, 'rout').numberToDiscard).toBe(3);
  });

  it('given update rout state in ranged attack resolution', () => {
    const state = createStateWithRangedAttackRout();
    const unit = createTestUnit('white', { attack: 2 });
    const newRout = createRoutState('white', unit, { numberToDiscard: 2 });

    const newState = updateRoutState(state, newRout);

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('issueCommands');
    if (phase.phase !== 'issueCommands') {
      throw new Error('phase');
    }
    const commandState = throwIfPending(
      phase.currentCommandResolutionState,
      'command',
    );
    if (commandState.commandResolutionType !== 'rangedAttack') {
      throw new Error('type');
    }
    const attackApply = throwIfPending(
      commandState.attackApplyState,
      'attack apply',
    );
    expect(
      throwIfBypassed(
        getRoutStateFromAttackApply(attackApply),
        'the attack applies a rout',
      ).numberToDiscard,
    ).toBe(2);
  });

  it('given update rout state in melee resolution for white', () => {
    const state = createStateWithMeleeRout('white');
    const unit = createTestUnit('white', { attack: 2 });
    const newRout = createRoutState('white', unit, { numberToDiscard: 1 });

    const newState = updateRoutState(state, newRout);

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('resolveMelee');
    if (phase.phase !== 'resolveMelee') {
      throw new Error('phase');
    }
    const melee = throwIfPending(phase.currentMeleeResolutionState, 'melee');
    const whiteApply = throwIfPending(
      melee.secondPlayerAttackApplyState,
      'white apply',
    );
    expect(
      throwIfBypassed(
        getRoutStateFromAttackApply(whiteApply),
        'the attack applies a rout',
      ).numberToDiscard,
    ).toBe(1);
  });

  it('given update rout state in melee resolution for black', () => {
    const state = createStateWithMeleeRout('black');
    const unit = createTestUnit('black', { attack: 2 });
    const newRout = createRoutState('black', unit, { numberToDiscard: 2 });

    const newState = updateRoutState(state, newRout);

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('resolveMelee');
    if (phase.phase !== 'resolveMelee') {
      throw new Error('phase');
    }
    const melee = throwIfPending(phase.currentMeleeResolutionState, 'melee');
    const blackApply = throwIfPending(
      melee.firstPlayerAttackApplyState,
      'black apply',
    );
    expect(
      throwIfBypassed(
        getRoutStateFromAttackApply(blackApply),
        'the attack applies a rout',
      ).numberToDiscard,
    ).toBe(2);
  });

  it('given update rout state in cleanup phase (routs from lost support)', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const unit = createTestUnit('white', { attack: 2 });
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: createRoutState('white', unit),
    });
    const phaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: rallyState,
      step: 'firstPlayerResolveRally',
    });
    const stateInCleanup = updatePhaseState(state, phaseState);
    const newRout = createRoutState('white', unit, { numberToDiscard: 2 });

    const newState = updateRoutState(stateInCleanup, newRout);

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('cleanup');
    if (phase.phase !== 'cleanup') {
      throw new Error('phase');
    }
    const rally = throwIfPending(
      phase.firstPlayerRallyResolutionState,
      'rally',
    );
    expect(throwIfPending(rally.routState, 'rout').numberToDiscard).toBe(2);
    expect(phase.step).toBe('firstPlayerResolveRally');
    expect(rally.completed).toBe(false);
  });

  it('writes a settled rally rout and leaves the rally and the step for settleRout', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const unit = createTestUnit('white', { attack: 2 });
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: createRoutState('white', unit),
      unitsLostSupport: [unit],
    });
    const phaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: rallyState,
      step: 'firstPlayerResolveRally',
    });
    const stateInCleanup = updatePhaseState(state, phaseState);
    const completedRout = createRoutState('white', unit, {
      cardsChosen: true,
      completed: true,
      numberToDiscard: 1,
    });

    const newState = updateRoutState(stateInCleanup, completedRout);

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('cleanup');
    if (phase.phase !== 'cleanup') {
      throw new Error('phase');
    }
    // Cleanup stays on this rally: moving on is settleRout's.
    expect(phase.step).toBe('firstPlayerResolveRally');
    const rally = throwIfPending(
      phase.firstPlayerRallyResolutionState,
      'rally',
    );
    // The rout is recorded as settled, and the rally around it is still open.
    expect(rally.completed).toBe(false);
    expect(throwIfPending(rally.routState, 'rout').completed).toBe(true);
  });

  it('given when no rout state in attack apply, throws', () => {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white', { attack: 2 });
    const attackApply = createAttackApplyStateWithNothingDue(unit);
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createRangedAttackResolutionState(state, {
        attackApplyState: attackApply,
      }),
    });
    const stateInPhase = updatePhaseState(state, phaseState);

    expect(() =>
      updateRoutState(stateInPhase, createRoutState('white', unit)),
    ).toThrow(/^No open rout to write for/);
  });

  it('given when in issueCommands but command type is not rangedAttack (movement), throws', () => {
    const state = createEmptyGameState('standard');
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createMovementResolutionState(state, {
        engagementState: createFrontEngagementState(),
      }),
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const unit = createTestUnit('white', { attack: 2 });

    expect(() =>
      updateRoutState(stateInPhase, createRoutState('white', unit)),
    ).toThrow(/^No open rout to write for/);
  });

  it('given when in issueCommands with no command resolution state, throws', () => {
    const state = createEmptyGameState('standard');
    const phaseState = createIssueCommandsPhaseState(state);
    const stateInPhase = updatePhaseState(state, phaseState);
    const unit = createTestUnit('white', { attack: 2 });

    expect(() =>
      updateRoutState(stateInPhase, createRoutState('white', unit)),
    ).toThrow(/^No open rout to write for/);
  });

  it('given when melee white attack apply has no rout state, throws', () => {
    const state = createEmptyGameState('standard');
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const melee = createMeleeResolutionState(state, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRout(blackUnit),
      secondPlayerAttackApplyState:
        createAttackApplyStateWithNothingDue(whiteUnit),
    });
    const stateInPhase = updatePhaseState(
      state,
      createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(() =>
      updateRoutState(stateInPhase, createRoutState('white', whiteUnit)),
    ).toThrow(/^No open rout to write for/);
  });

  it('given when melee black attack apply has no rout state, throws', () => {
    const state = createEmptyGameState('standard');
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const melee = createMeleeResolutionState(state, {
      firstPlayerAttackApplyState:
        createAttackApplyStateWithNothingDue(blackUnit),
      secondPlayerAttackApplyState: createAttackApplyStateWithRout(whiteUnit),
    });
    const stateInPhase = updatePhaseState(
      state,
      createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(() =>
      updateRoutState(stateInPhase, createRoutState('black', blackUnit)),
    ).toThrow(/^No open rout to write for/);
  });

  it('given when cleanup rally resolution has no rout state, throws', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: 'pending',
    });
    const phaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: rallyState,
      step: 'firstPlayerResolveRally',
    });
    const stateInCleanup = updatePhaseState(state, phaseState);
    const unit = createTestUnit('white', { attack: 2 });

    expect(() =>
      updateRoutState(stateInCleanup, createRoutState('white', unit)),
    ).toThrow(/^No open rout to write for/);
  });

  it('given when not in issueCommands, resolveMelee, or cleanup phase, throws', () => {
    const state = createEmptyGameState('standard');
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    const unit = createTestUnit('white', { attack: 2 });

    expect(() =>
      updateRoutState(stateInPlayCards, createRoutState('white', unit)),
    ).toThrow(/^No open rout to write for/);
  });
});

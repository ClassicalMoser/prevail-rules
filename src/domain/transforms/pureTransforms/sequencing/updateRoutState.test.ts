import type { StandardBoard, UnitWithPlacement } from '@entities';
import {
  createAttackApplyState,
  createAttackApplyStateWithRout,
  createCleanupPhaseState,
  createEmptyGameState,
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
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { updateRoutState } from './updateRoutState';

/**
 * updateRoutState: Creates a new game state with the rout state updated.
 */
describe('updateRoutState', () => {
  function createStateWithRangedAttackRout() {
    const state = createEmptyGameState();
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement<StandardBoard> = {
      unit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
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
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const routedUnit = createTestUnit(routingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      routingPlayer === 'white' ? 'black' : 'white',
      { attack: 2 },
    );
    const routedPlacement: UnitWithPlacement<StandardBoard> = {
      unit: routedUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const otherPlacement: UnitWithPlacement<StandardBoard> = {
      unit: otherUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
    };
    let stateWithUnits = {
      ...state,
      boardState: addUnitToBoard(state.boardState, routedPlacement),
    };
    stateWithUnits = {
      ...stateWithUnits,
      boardState: addUnitToBoard(stateWithUnits.boardState, otherPlacement),
    };
    const attackApply = createAttackApplyStateWithRout(routedUnit);
    const melee = createMeleeResolutionState(stateWithUnits, {
      ...(routingPlayer === 'white'
        ? { whiteAttackApplyState: attackApply }
        : { blackAttackApplyState: attackApply }),
    });
    return updatePhaseState(
      stateWithUnits,
      createResolveMeleePhaseState(stateWithUnits, {
        currentMeleeResolutionState: melee,
      }),
    );
  }

  it('given update rout state in rear engagement during movement resolution', () => {
    const state = createEmptyGameState();
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

    const phase = newState.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('issueCommands');
    if (phase?.phase !== 'issueCommands') throw new Error('phase');
    const cmd = phase.currentCommandResolutionState;
    if (cmd?.commandResolutionType !== 'movement') throw new Error('movement');
    const res = cmd.engagementState?.engagementResolutionState;
    expect(res?.engagementType).toBe('rear');
    if (res?.engagementType !== 'rear') throw new Error('rear');
    expect(res.routState?.numberToDiscard).toBe(3);
  });

  it('given update rout state in ranged attack resolution', () => {
    const state = createStateWithRangedAttackRout();
    const unit = createTestUnit('white', { attack: 2 });
    const newRout = createRoutState('white', unit, { numberToDiscard: 2 });

    const newState = updateRoutState(state, newRout);

    const phase = newState.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('issueCommands');
    if (
      phase?.phase !== 'issueCommands' ||
      !phase.currentCommandResolutionState
    )
      throw new Error('phase');
    if (
      phase.currentCommandResolutionState.commandResolutionType !==
      'rangedAttack'
    )
      throw new Error('type');
    expect(
      phase.currentCommandResolutionState.attackApplyState?.routState
        ?.numberToDiscard,
    ).toBe(2);
  });

  it('given update rout state in melee resolution for white', () => {
    const state = createStateWithMeleeRout('white');
    const unit = createTestUnit('white', { attack: 2 });
    const newRout = createRoutState('white', unit, { numberToDiscard: 1 });

    const newState = updateRoutState(state, newRout);

    const phase = newState.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('resolveMelee');
    if (phase?.phase !== 'resolveMelee') throw new Error('phase');
    expect(
      phase.currentMeleeResolutionState?.whiteAttackApplyState?.routState
        ?.numberToDiscard,
    ).toBe(1);
  });

  it('given update rout state in melee resolution for black', () => {
    const state = createStateWithMeleeRout('black');
    const unit = createTestUnit('black', { attack: 2 });
    const newRout = createRoutState('black', unit, { numberToDiscard: 2 });

    const newState = updateRoutState(state, newRout);

    const phase = newState.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('resolveMelee');
    if (phase?.phase !== 'resolveMelee') throw new Error('phase');
    expect(
      phase.currentMeleeResolutionState?.blackAttackApplyState?.routState
        ?.numberToDiscard,
    ).toBe(2);
  });

  it('given update rout state in cleanup phase (routs from lost support)', () => {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    const unit = createTestUnit('white', { attack: 2 });
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: createRoutState('white', unit),
    });
    const phaseState = createCleanupPhaseState({
      step: 'firstPlayerResolveRally',
      firstPlayerRallyResolutionState: rallyState,
    });
    const stateInCleanup = updatePhaseState(state, phaseState);
    const newRout = createRoutState('white', unit, { numberToDiscard: 2 });

    const newState = updateRoutState(stateInCleanup, newRout);

    const phase = newState.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('cleanup');
    if (phase?.phase !== 'cleanup') throw new Error('phase');
    expect(
      phase.firstPlayerRallyResolutionState?.routState?.numberToDiscard,
    ).toBe(2);
  });

  it('given when no rout state in attack apply, throws', () => {
    const state = createEmptyGameState();
    const unit = createTestUnit('white', { attack: 2 });
    const attackApply = createAttackApplyState(unit);
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createRangedAttackResolutionState(state, {
        attackApplyState: attackApply,
      }),
    });
    const stateInPhase = updatePhaseState(state, phaseState);

    expect(() =>
      updateRoutState(stateInPhase, createRoutState('white', unit)),
    ).toThrow('No rout state found in attack apply state');
  });

  it('given when in issueCommands but command type is not rangedAttack (movement), throws', () => {
    const state = createEmptyGameState();
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createMovementResolutionState(state),
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const unit = createTestUnit('white', { attack: 2 });

    expect(() =>
      updateRoutState(stateInPhase, createRoutState('white', unit)),
    ).toThrow(
      'Rout state update not expected in issueCommands (command type: movement)',
    );
  });

  it('given when in issueCommands with no command resolution state, throws', () => {
    const state = createEmptyGameState();
    const phaseState = createIssueCommandsPhaseState(state);
    const stateInPhase = updatePhaseState(state, phaseState);
    const unit = createTestUnit('white', { attack: 2 });

    expect(() =>
      updateRoutState(stateInPhase, createRoutState('white', unit)),
    ).toThrow(
      'Rout state update not expected in issueCommands (command type: none)',
    );
  });

  it('given when melee white attack apply has no rout state, throws', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const melee = createMeleeResolutionState(state, {
      whiteAttackApplyState: createAttackApplyState(whiteUnit),
      blackAttackApplyState: createAttackApplyStateWithRout(blackUnit),
    });
    const stateInPhase = updatePhaseState(
      state,
      createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(() =>
      updateRoutState(stateInPhase, createRoutState('white', whiteUnit)),
    ).toThrow('No rout state found in attack apply state');
  });

  it('given when melee black attack apply has no rout state, throws', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const melee = createMeleeResolutionState(state, {
      whiteAttackApplyState: createAttackApplyStateWithRout(whiteUnit),
      blackAttackApplyState: createAttackApplyState(blackUnit),
    });
    const stateInPhase = updatePhaseState(
      state,
      createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(() =>
      updateRoutState(stateInPhase, createRoutState('black', blackUnit)),
    ).toThrow('No rout state found in attack apply state');
  });

  it('given when cleanup rally resolution has no rout state, throws', () => {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: undefined,
    });
    const phaseState = createCleanupPhaseState({
      step: 'firstPlayerResolveRally',
      firstPlayerRallyResolutionState: rallyState,
    });
    const stateInCleanup = updatePhaseState(state, phaseState);
    const unit = createTestUnit('white', { attack: 2 });

    expect(() =>
      updateRoutState(stateInCleanup, createRoutState('white', unit)),
    ).toThrow('No rout state found in rally resolution state');
  });

  it('given when not in issueCommands, resolveMelee, or cleanup phase, throws', () => {
    const state = createEmptyGameState();
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    const unit = createTestUnit('white', { attack: 2 });

    expect(() =>
      updateRoutState(stateInPlayCards, createRoutState('white', unit)),
    ).toThrow('Rout state update not expected in phase: playCards');
  });
});

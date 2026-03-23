import type { StandardBoard, UnitWithPlacement } from '@entities';
import {
  createAttackApplyState,
  createAttackApplyStateWithRetreat,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import {
  findRetreatState,
  getRetreatStateFromAttackApply,
  getRetreatStateFromMelee,
  getRetreatStateFromRangedAttack,
  getRetreatStateReadyForResolveFromMelee,
} from './retreat';

describe('getRetreatStateFromAttackApply', () => {
  it('should return retreat state from attack apply state', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState = createAttackApplyStateWithRetreat({
      unit,
      placement: { coordinate: 'E-5', facing: 'north' },
    });

    const result = getRetreatStateFromAttackApply(attackApplyState);
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toEqual(unit);
  });

  it('should throw error when retreat state is missing', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState = createAttackApplyState(unit);

    expect(() => getRetreatStateFromAttackApply(attackApplyState)).toThrow(
      'No retreat state found in attack apply state',
    );
  });
});

describe('getRetreatStateFromRangedAttack', () => {
  it('should return retreat state from ranged attack resolution', () => {
    const attackingUnit = createTestUnit('black', { attack: 2 });
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(
          state,
          {
            attackingUnit,
            defendingUnit,
            attackApplyState: createAttackApplyStateWithRetreat({
              unit: defendingUnit,
              placement: { coordinate: 'E-5', facing: 'north' },
            }),
          },
        ),
      },
    );

    const result = getRetreatStateFromRangedAttack(state);
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toEqual(defendingUnit);
  });

  it('should throw error when attack apply state is missing', () => {
    const attackingUnit = createTestUnit('black', { attack: 2 });
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(
          state,
          {
            attackingUnit,
            defendingUnit,
            attackApplyState: undefined,
          },
        ),
      },
    );

    expect(() => getRetreatStateFromRangedAttack(state)).toThrow(
      'No attack apply state found in ranged attack resolution',
    );
  });

  it('should throw error when retreat state is missing from attack apply', () => {
    const attackingUnit = createTestUnit('black', { attack: 2 });
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(
          state,
          {
            attackingUnit,
            defendingUnit,
            attackApplyState: createAttackApplyState(defendingUnit),
          },
        ),
      },
    );

    expect(() => getRetreatStateFromRangedAttack(state)).toThrow(
      'No retreat state found in attack apply state',
    );
  });
});

describe('getRetreatStateFromMelee', () => {
  it('should return retreat state from melee resolution for white player', () => {
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: {
          substepType: 'meleeResolution' as const,
          location: 'E-5',
          whiteCommitment: {
            commitmentType: 'completed',
            card: state.cardState.white.inPlay!,
          },
          blackCommitment: {
            commitmentType: 'completed',
            card: state.cardState.black.inPlay!,
          },
          whiteAttackApplyState: createAttackApplyStateWithRetreat({
            unit: whiteUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          }),
          blackAttackApplyState: createAttackApplyState(
            createTestUnit('black', { attack: 2 }),
          ),
          completed: false,
        },
      },
    );

    const result = getRetreatStateFromMelee(state, 'white');
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toEqual(whiteUnit);
  });

  it('should return retreat state from melee resolution for black player', () => {
    const blackUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: {
          substepType: 'meleeResolution' as const,
          location: 'E-5',
          whiteCommitment: {
            commitmentType: 'completed',
            card: state.cardState.white.inPlay!,
          },
          blackCommitment: {
            commitmentType: 'completed',
            card: state.cardState.black.inPlay!,
          },
          whiteAttackApplyState: createAttackApplyState(
            createTestUnit('white', { attack: 2 }),
          ),
          blackAttackApplyState: createAttackApplyStateWithRetreat({
            unit: blackUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          }),
          completed: false,
        },
      },
    );

    const result = getRetreatStateFromMelee(state, 'black');
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toEqual(blackUnit);
  });

  it('should throw error when attack apply state is missing', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: {
          substepType: 'meleeResolution' as const,
          location: 'E-5',
          whiteCommitment: {
            commitmentType: 'completed',
            card: state.cardState.white.inPlay!,
          },
          blackCommitment: {
            commitmentType: 'completed',
            card: state.cardState.black.inPlay!,
          },
          whiteAttackApplyState: undefined,
          blackAttackApplyState: createAttackApplyState(
            createTestUnit('black', { attack: 2 }),
          ),
          completed: false,
        },
      },
    );

    expect(() => getRetreatStateFromMelee(state, 'white')).toThrow(
      'No white attack apply state found in melee resolution',
    );
  });
});

describe('findRetreatState', () => {
  it('should throw error when current phase state is missing', () => {
    const state = createEmptyGameState();

    expect(() => findRetreatState(state, 'white')).toThrow(
      'No current phase state found',
    );
  });

  it('should find retreat state from ranged attack resolution', () => {
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(
          state,
          {
            defendingUnit,
            attackApplyState: createAttackApplyStateWithRetreat({
              unit: defendingUnit,
              placement: { coordinate: 'E-5', facing: 'north' },
            }),
          },
        ),
      },
    );

    const result = findRetreatState(state, 'white');
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toEqual(defendingUnit);
  });

  it('should find retreat state from melee resolution', () => {
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: {
          substepType: 'meleeResolution' as const,
          location: 'E-5',
          whiteCommitment: {
            commitmentType: 'completed',
            card: state.cardState.white.inPlay!,
          },
          blackCommitment: {
            commitmentType: 'completed',
            card: state.cardState.black.inPlay!,
          },
          whiteAttackApplyState: createAttackApplyStateWithRetreat({
            unit: whiteUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          }),
          blackAttackApplyState: createAttackApplyState(
            createTestUnit('black', { attack: 2 }),
          ),
          completed: false,
        },
      },
    );

    const result = findRetreatState(state, 'white');
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toEqual(whiteUnit);
  });

  it('should throw error when retreat state not found', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createMovementResolutionState(state),
      },
    );

    expect(() => findRetreatState(state, 'white')).toThrow(
      'No retreat state found for player white',
    );
  });

  it('should throw error when player does not match retreating unit', () => {
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(
          state,
          {
            defendingUnit,
            attackApplyState: createAttackApplyStateWithRetreat({
              unit: defendingUnit,
              placement: { coordinate: 'E-5', facing: 'north' },
            }),
          },
        ),
      },
    );

    expect(() => findRetreatState(state, 'black')).toThrow(
      'No retreat state found for player black',
    );
  });
});

describe('getRetreatStateReadyForResolveFromMelee', () => {
  const finalPos = { coordinate: 'E-6' as const, facing: 'south' as const };

  it('returns initiative player retreat when finalPosition set and not completed', () => {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      unit: whiteUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      unit: blackUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const whiteRetreat = createRetreatState(whiteWp, {
      finalPosition: finalPos,
      completed: false,
    });
    const whiteApply = createAttackApplyStateWithRetreat(whiteWp, {
      retreatState: whiteRetreat,
    });
    const blackApply = createAttackApplyState(blackUnit);

    const melee = createMeleeResolutionState(s, {
      whiteAttackApplyState: whiteApply,
      blackAttackApplyState: blackApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    const r = getRetreatStateReadyForResolveFromMelee(full);
    expect(r.retreatingUnit.unit).toBe(whiteUnit);
    expect(r.finalPosition).toEqual(finalPos);
  });

  it('returns second player when first retreat has no finalPosition', () => {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      unit: whiteUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      unit: blackUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const whiteApply = createAttackApplyStateWithRetreat(whiteWp);
    const blackRetreat = createRetreatState(blackWp, {
      finalPosition: finalPos,
      completed: false,
    });
    const blackApply = createAttackApplyStateWithRetreat(blackWp, {
      retreatState: blackRetreat,
    });

    const melee = createMeleeResolutionState(s, {
      whiteAttackApplyState: whiteApply,
      blackAttackApplyState: blackApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    const r = getRetreatStateReadyForResolveFromMelee(full);
    expect(r.retreatingUnit.unit).toBe(blackUnit);
  });

  it('throws when no retreat is ready to resolve', () => {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      unit: whiteUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      unit: blackUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const melee = createMeleeResolutionState(s, {
      whiteAttackApplyState: createAttackApplyStateWithRetreat(whiteWp),
      blackAttackApplyState: createAttackApplyStateWithRetreat(blackWp),
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    expect(() => getRetreatStateReadyForResolveFromMelee(full)).toThrow(
      'No retreat state with finalPosition found in melee resolution',
    );
  });

  it('when initiative is black, reads black attack-apply retreat before white', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      unit: whiteUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      unit: blackUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const blackRetreat = createRetreatState(blackWp, {
      finalPosition: finalPos,
      completed: false,
    });
    const blackApply = createAttackApplyStateWithRetreat(blackWp, {
      retreatState: blackRetreat,
    });
    const whiteApply = createAttackApplyState(whiteUnit);

    const melee = createMeleeResolutionState(s, {
      whiteAttackApplyState: whiteApply,
      blackAttackApplyState: blackApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    const r = getRetreatStateReadyForResolveFromMelee(full);
    expect(r.retreatingUnit.unit).toBe(blackUnit);
  });
});

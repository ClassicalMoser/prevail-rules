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

import {
  findRetreatState,
  getRetreatStateFromAttackApply,
  getRetreatStateFromMelee,
  getRetreatStateFromRangedAttack,
  getRetreatStateReadyForResolveFromMelee,
} from './retreat';

/**
 * Retreat substeps live under attack-apply (ranged or melee side): unwrap nested state, locate
 * retreat by player across CRS shapes, and pick which melee retreat is ready for `resolveRetreat`.
 */
describe(getRetreatStateFromAttackApply, () => {
  it('given apply with retreat substep, returns retreat with same retreating unit', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState = createAttackApplyStateWithRetreat({
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
      unit,
    });

    const result = getRetreatStateFromAttackApply(attackApplyState);
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toStrictEqual(unit);
  });

  it('given apply without retreat substep, throws no retreat in attack apply', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState = createAttackApplyState(unit);

    expect(() => getRetreatStateFromAttackApply(attackApplyState)).toThrow(
      'No retreat state found in attack apply state',
    );
  });
});

describe(getRetreatStateFromRangedAttack, () => {
  it('given ranged CRS with defender retreat apply, returns defender retreat', () => {
    const attackingUnit = createTestUnit('black', { attack: 2 });
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(
          state,
          {
            attackApplyState: createAttackApplyStateWithRetreat({
              boardType: 'standard' as const,
              placement: {
                boardType: 'standard' as const,
                coordinate: 'E-5',
                facing: 'north',
              },
              unit: defendingUnit,
            }),
            attackingUnit,
            defendingUnit,
          },
        ),
      },
    );

    const result = getRetreatStateFromRangedAttack(state);
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toStrictEqual(defendingUnit);
  });

  it('given ranged CRS without attackApplyState, throws no attack apply in ranged', () => {
    const attackingUnit = createTestUnit('black', { attack: 2 });
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(
          state,
          {
            attackApplyState: undefined,
            attackingUnit,
            defendingUnit,
          },
        ),
      },
    );

    expect(() => getRetreatStateFromRangedAttack(state)).toThrow(
      'No attack apply state found in ranged attack resolution',
    );
  });

  it('given ranged apply without retreat substep, throws no retreat in attack apply', () => {
    const attackingUnit = createTestUnit('black', { attack: 2 });
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(
          state,
          {
            attackApplyState: createAttackApplyState(defendingUnit),
            attackingUnit,
            defendingUnit,
          },
        ),
      },
    );

    expect(() => getRetreatStateFromRangedAttack(state)).toThrow(
      'No retreat state found in attack apply state',
    );
  });
});

describe(getRetreatStateFromMelee, () => {
  it('given white melee apply in retreat, getRetreatState(melee, white) returns it', () => {
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: {
          blackAttackApplyState: createAttackApplyState(
            createTestUnit('black', { attack: 2 }),
          ),
          blackCommitment: {
            card: state.cardState.black.inPlay!,
            commitmentType: 'completed',
          },
          boardType: 'standard' as const,
          completed: false,
          location: 'E-5',
          substepType: 'meleeResolution' as const,
          whiteAttackApplyState: createAttackApplyStateWithRetreat({
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-5',
              facing: 'north',
            },
            unit: whiteUnit,
          }),
          whiteCommitment: {
            card: state.cardState.white.inPlay!,
            commitmentType: 'completed',
          },
        },
      },
    );

    const result = getRetreatStateFromMelee(state, 'white');
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toStrictEqual(whiteUnit);
  });

  it('given black melee apply in retreat, getRetreatState(melee, black) returns it', () => {
    const blackUnit = createTestUnit('black', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: {
          blackAttackApplyState: createAttackApplyStateWithRetreat({
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-5',
              facing: 'north',
            },
            unit: blackUnit,
          }),
          blackCommitment: {
            card: state.cardState.black.inPlay!,
            commitmentType: 'completed',
          },
          boardType: 'standard' as const,
          completed: false,
          location: 'E-5',
          substepType: 'meleeResolution' as const,
          whiteAttackApplyState: createAttackApplyState(
            createTestUnit('white', { attack: 2 }),
          ),
          whiteCommitment: {
            card: state.cardState.white.inPlay!,
            commitmentType: 'completed',
          },
        },
      },
    );

    const result = getRetreatStateFromMelee(state, 'black');
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toStrictEqual(blackUnit);
  });

  it('given melee missing white apply, getRetreatState(melee, white) throws', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: {
          blackAttackApplyState: createAttackApplyState(
            createTestUnit('black', { attack: 2 }),
          ),
          blackCommitment: {
            card: state.cardState.black.inPlay!,
            commitmentType: 'completed',
          },
          boardType: 'standard' as const,
          completed: false,
          location: 'E-5',
          substepType: 'meleeResolution' as const,
          whiteAttackApplyState: undefined,
          whiteCommitment: {
            card: state.cardState.white.inPlay!,
            commitmentType: 'completed',
          },
        },
      },
    );

    expect(() => getRetreatStateFromMelee(state, 'white')).toThrow(
      'No white attack apply state found in melee resolution',
    );
  });
});

describe(findRetreatState, () => {
  it('given no phase slice, findRetreat throws no current phase state', () => {
    const state = createEmptyGameState();

    expect(() => findRetreatState(state, 'white')).toThrow(
      'No current phase state found',
    );
  });

  it('given ranged CRS with white defender retreat, findRetreat(white) succeeds', () => {
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(
          state,
          {
            attackApplyState: createAttackApplyStateWithRetreat({
              boardType: 'standard' as const,
              placement: {
                boardType: 'standard' as const,
                coordinate: 'E-5',
                facing: 'north',
              },
              unit: defendingUnit,
            }),
            defendingUnit,
          },
        ),
      },
    );

    const result = findRetreatState(state, 'white');
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toStrictEqual(defendingUnit);
  });

  it('given melee white retreat apply, findRetreat(white) succeeds', () => {
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createResolveMeleePhaseState(
      state,
      {
        currentMeleeResolutionState: {
          blackAttackApplyState: createAttackApplyState(
            createTestUnit('black', { attack: 2 }),
          ),
          blackCommitment: {
            card: state.cardState.black.inPlay!,
            commitmentType: 'completed',
          },
          boardType: 'standard' as const,
          completed: false,
          location: 'E-5',
          substepType: 'meleeResolution' as const,
          whiteAttackApplyState: createAttackApplyStateWithRetreat({
            boardType: 'standard' as const,
            placement: {
              boardType: 'standard' as const,
              coordinate: 'E-5',
              facing: 'north',
            },
            unit: whiteUnit,
          }),
          whiteCommitment: {
            card: state.cardState.white.inPlay!,
            commitmentType: 'completed',
          },
        },
      },
    );

    const result = findRetreatState(state, 'white');
    expect(result.substepType).toBe('retreat');
    expect(result.retreatingUnit.unit).toStrictEqual(whiteUnit);
  });

  it('given movement CRS only, findRetreat(white) throws no retreat for player', () => {
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

  it('given white retreating but findRetreat(black), throws no retreat for black', () => {
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createIssueCommandsPhaseState(
      state,
      {
        currentCommandResolutionState: createRangedAttackResolutionState(
          state,
          {
            attackApplyState: createAttackApplyStateWithRetreat({
              boardType: 'standard' as const,
              placement: {
                boardType: 'standard' as const,
                coordinate: 'E-5',
                facing: 'north',
              },
              unit: defendingUnit,
            }),
            defendingUnit,
          },
        ),
      },
    );

    expect(() => findRetreatState(state, 'black')).toThrow(
      'No retreat state found for player black',
    );
  });
});

describe(getRetreatStateReadyForResolveFromMelee, () => {
  const finalPos = {
    boardType: 'standard' as const,
    coordinate: 'E-6' as const,
    facing: 'south' as const,
  };

  it('given white initiative and white retreat final E-6 south ready, returns white retreat', () => {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: whiteUnit,
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'south',
      },
      unit: blackUnit,
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const whiteRetreat = createRetreatState(whiteWp, {
      completed: false,
      finalPosition: finalPos,
    });
    const whiteApply = createAttackApplyStateWithRetreat(whiteWp, {
      retreatState: whiteRetreat,
    });
    const blackApply = createAttackApplyState(blackUnit);

    const melee = createMeleeResolutionState(s, {
      blackAttackApplyState: blackApply,
      whiteAttackApplyState: whiteApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    const r = getRetreatStateReadyForResolveFromMelee(full);
    expect(r.retreatingUnit.unit).toBe(whiteUnit);
    expect(r.finalPosition).toStrictEqual(finalPos);
  });

  it('given white initiative but white retreat lacks finalPosition, picks black with final set', () => {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: whiteUnit,
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'south',
      },
      unit: blackUnit,
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const whiteApply = createAttackApplyStateWithRetreat(whiteWp);
    const blackRetreat = createRetreatState(blackWp, {
      completed: false,
      finalPosition: finalPos,
    });
    const blackApply = createAttackApplyStateWithRetreat(blackWp, {
      retreatState: blackRetreat,
    });

    const melee = createMeleeResolutionState(s, {
      blackAttackApplyState: blackApply,
      whiteAttackApplyState: whiteApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    const r = getRetreatStateReadyForResolveFromMelee(full);
    expect(r.retreatingUnit.unit).toBe(blackUnit);
  });

  it('given both retreats without finalPosition, throws no retreat ready to resolve', () => {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: whiteUnit,
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'south',
      },
      unit: blackUnit,
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const melee = createMeleeResolutionState(s, {
      blackAttackApplyState: createAttackApplyStateWithRetreat(blackWp),
      whiteAttackApplyState: createAttackApplyStateWithRetreat(whiteWp),
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    expect(() => getRetreatStateReadyForResolveFromMelee(full)).toThrow(
      'No retreat state with finalPosition found in melee resolution',
    );
  });

  it('given black initiative and black retreat final ready, returns black retreat first', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: whiteUnit,
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'south',
      },
      unit: blackUnit,
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const blackRetreat = createRetreatState(blackWp, {
      completed: false,
      finalPosition: finalPos,
    });
    const blackApply = createAttackApplyStateWithRetreat(blackWp, {
      retreatState: blackRetreat,
    });
    const whiteApply = createAttackApplyState(whiteUnit);

    const melee = createMeleeResolutionState(s, {
      blackAttackApplyState: blackApply,
      whiteAttackApplyState: whiteApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    const r = getRetreatStateReadyForResolveFromMelee(full);
    expect(r.retreatingUnit.unit).toBe(blackUnit);
  });
});

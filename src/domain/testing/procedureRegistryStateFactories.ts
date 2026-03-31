import type { StandardBoard, UnitWithPlacement } from '@entities';
import type { GameEffectType } from '@events';
/**
 * Minimal `GameState` builders for each `GameEffectType`, used to drive
 * `generateEventFromProcedure` in registry tests.
 *
 * Phase literals use `@entities/sequence/phases` (not the `@entities` barrel) so this file
 * does not pull expected-event schemas during init.
 *
 * No Vitest imports.
 */
import type { GameState, IssueCommandsPhaseState } from '@game';
import {
  ISSUE_COMMANDS_PHASE,
  MOVE_COMMANDERS_PHASE,
  PLAY_CARDS_PHASE,
} from '@game';

import { tempCommandCards } from '@sampleValues';
import { addUnitToBoard, updateCardState, updatePhaseState } from '@transforms';
import { createEmptyGameState } from './createEmptyGameState';
import {
  createAttackApplyState,
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithReverse,
  createAttackApplyStateWithRout,
  createCleanupPhaseState,
  createFlankEngagementState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
} from './phaseStateHelpers';
import { createTestCard } from './testHelpers';
import { createTestUnit, createUnitByStat } from './unitHelpers';

/** Minimal valid state per effect so registry dispatch reaches the target procedure. */
export const procedureRegistryStateFactories: Record<
  GameEffectType,
  () => GameState<StandardBoard>
> = {
  completeAttackApply: (): GameState<StandardBoard> => {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defendingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApplyState = createAttackApplyState(defendingUnit);
    const rangedAttackState = createRangedAttackResolutionState(stateWithUnit, {
      attackApplyState,
    });
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: rangedAttackState,
    });
    return updatePhaseState(stateWithUnit, phaseState);
  },

  completeCleanupPhase: (): GameState<StandardBoard> => createEmptyGameState(),

  completeIssueCommandsPhase: (): GameState<StandardBoard> => {
    const initialPhaseState: IssueCommandsPhaseState<StandardBoard> = {
      phase: ISSUE_COMMANDS_PHASE,
      step: 'complete',
      remainingCommandsFirstPlayer: new Set(),
      remainingUnitsFirstPlayer: new Set(),
      remainingCommandsSecondPlayer: new Set(),
      remainingUnitsSecondPlayer: new Set(),
      currentCommandResolutionState: undefined,
    };
    return updatePhaseState(createEmptyGameState(), initialPhaseState);
  },

  completeMoveCommandersPhase: (): GameState<StandardBoard> => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const stateWithCards = updateCardState(state, (current) => ({
      ...current,
      black: { ...current.black, inPlay: tempCommandCards[0] },
      white: { ...current.white, inPlay: tempCommandCards[1] },
    }));
    return updatePhaseState(stateWithCards, {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    });
  },

  completePlayCardsPhase: (): GameState<StandardBoard> =>
    updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    }),

  completeMeleeResolution: (): GameState<StandardBoard> =>
    createEmptyGameState(),

  completeRangedAttackCommand: (): GameState<StandardBoard> =>
    createEmptyGameState(),

  completeResolveMeleePhase: (): GameState<StandardBoard> =>
    createEmptyGameState(),

  discardPlayedCards: (): GameState<StandardBoard> => createEmptyGameState(),

  resolveEngageRetreatOption: (): GameState<StandardBoard> => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const defender = createUnitByStat('white', 'speed', 4);
    const front = createFrontEngagementState();
    const engagementState = {
      ...front,
      engagingUnit: createUnitByStat('black', 'speed', 2),
    };
    const defenderWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defender,
      placement: {
        coordinate: engagementState.targetPlacement.coordinate,
        facing: 'south',
      },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, defenderWithPlacement),
    };
    const movement = createMovementResolutionState(withBoard, {
      targetPlacement: engagementState.targetPlacement,
      engagementState,
    });
    return updatePhaseState(
      withBoard,
      createIssueCommandsPhaseState(withBoard, {
        currentCommandResolutionState: movement,
      }),
    );
  },

  resolveFlankEngagement: (): GameState<StandardBoard> => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const defender = createTestUnit('white');
    const flank = createFlankEngagementState();
    const defenderPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defender,
      placement: {
        coordinate: flank.targetPlacement.coordinate,
        facing: 'east',
      },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, defenderPlacement),
    };
    const movement = createMovementResolutionState(withBoard, {
      targetPlacement: flank.targetPlacement,
      engagementState: flank,
    });
    return updatePhaseState(
      withBoard,
      createIssueCommandsPhaseState(withBoard, {
        currentCommandResolutionState: movement,
      }),
    );
  },

  resolveInitiative: (): GameState<StandardBoard> =>
    updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'assignInitiative',
    }),

  resolveMelee: (): GameState<StandardBoard> => {
    const state = createEmptyGameState();
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
    const phase = createResolveMeleePhaseState(s);
    return updatePhaseState(s, phase);
  },

  resolveRally: (): GameState<StandardBoard> => {
    const base = createEmptyGameState();
    const played = 'black' as const;
    const card = base.cardState[played].inPlay!;
    const withPlayed = updateCardState(base, (c) => ({
      ...c,
      [played]: {
        ...c[played],
        played: [card],
      },
    }));
    return updatePhaseState(
      withPlayed,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );
  },

  resolveRangedAttack: (): GameState<StandardBoard> => {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defendingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  },

  resolveRetreat: (): GameState<StandardBoard> => {
    const state = createEmptyGameState();
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: retreatingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const finalPos = { coordinate: 'E-6' as const, facing: 'south' as const };
    const attackApply = createAttackApplyStateWithRetreat(unitWithPlacement, {
      retreatState: createRetreatState(unitWithPlacement, {
        finalPosition: finalPos,
      }),
    });
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit: retreatingUnit,
      attackApplyState: attackApply,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  },

  resolveReverse: (): GameState<StandardBoard> => {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defendingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApply = createAttackApplyStateWithReverse(unitWithPlacement);
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit,
      attackApplyState: attackApply,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  },

  resolveRout: (): GameState<StandardBoard> => {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defendingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApply = createAttackApplyStateWithRout(defendingUnit);
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit,
      attackApplyState: attackApply,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  },

  resolveUnitsBroken: (): GameState<StandardBoard> =>
    updatePhaseState(
      createEmptyGameState({ currentInitiative: 'white' }),
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    ),

  revealCards: (): GameState<StandardBoard> => createEmptyGameState(),

  completeUnitMovement: (): GameState<StandardBoard> => createEmptyGameState(),

  startEngagement: (): GameState<StandardBoard> => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const defender = createTestUnit('white');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, {
        unit: defender,
        placement: { coordinate: 'E-6', facing: 'south' },
      }),
    };
    const movement = createMovementResolutionState(withBoard, {
      targetPlacement: { coordinate: 'E-6', facing: 'north' },
      movingUnit: {
        unit: createTestUnit('black'),
        placement: { coordinate: 'E-5', facing: 'east' },
      },
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: movement,
    });
    return updatePhaseState(withBoard, phase);
  },

  triggerRoutFromRetreat: (): GameState<StandardBoard> => {
    const state = createEmptyGameState();
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: retreatingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApply = createAttackApplyStateWithRetreat(unitWithPlacement);
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit: retreatingUnit,
      attackApplyState: attackApply,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  },
};

import type { UnitWithPlacement } from '@entities';
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
import type { GameStateForVisibility, IssueCommandsPhaseState } from '@game';
import {
  ISSUE_COMMANDS_PHASE,
  MOVE_COMMANDERS_PHASE,
  PLAY_CARDS_PHASE,
} from '@game';

import { tempCommandCards } from '@sampleValues';
import { addUnitToBoard, updatePhaseState } from '@transforms';
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
import { createTestCard, updateCardState } from './testHelpers';
import { createTestUnit, createUnitByStat } from './unitHelpers';

/** Minimal valid state per effect so registry dispatch reaches the target procedure. */
export const procedureRegistryStateFactories: Record<
  GameEffectType,
  () => GameStateForVisibility
> = {
  completeAttackApply: (): GameStateForVisibility => {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: defendingUnit,
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

  completeCleanupPhase: (): GameStateForVisibility => createEmptyGameState(),

  completeIssueCommandsPhase: (): GameStateForVisibility => {
    const initialPhaseState: IssueCommandsPhaseState = {
      currentCommandResolutionState: 'pending',
      phase: ISSUE_COMMANDS_PHASE,
      remainingCommandsFirstPlayer: [],
      remainingCommandsSecondPlayer: [],
      remainingUnitsFirstPlayer: [],
      remainingUnitsSecondPlayer: [],
      step: 'complete',
    };
    return updatePhaseState(createEmptyGameState(), initialPhaseState);
  },

  completeMeleeResolution: (): GameStateForVisibility => createEmptyGameState(),

  completeMoveCommandersPhase: (): GameStateForVisibility => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const stateWithCards = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: tempCommandCards[0] },
      white: { ...state.cardState.white, inPlay: tempCommandCards[1] },
    });
    return updatePhaseState(stateWithCards, {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    });
  },

  completePlayCardsPhase: (): GameStateForVisibility =>
    updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    }),

  completeRangedAttackCommand: (): GameStateForVisibility =>
    createEmptyGameState(),

  completeResolveMeleePhase: (): GameStateForVisibility =>
    createEmptyGameState(),

  completeUnitMovement: (): GameStateForVisibility => createEmptyGameState(),

  discardPlayedCards: (): GameStateForVisibility => createEmptyGameState(),

  resolveEngageRetreatOption: (): GameStateForVisibility => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const defender = createUnitByStat('white', 'speed', 4);
    const front = createFrontEngagementState();
    const engagementState = {
      ...front,
      engagingUnit: createUnitByStat('black', 'speed', 2),
    };
    const defenderWithPlacement: UnitWithPlacement = {
      placement: {
        coordinate: engagementState.targetPlacement.coordinate,
        facing: 'south',
      },
      unit: defender,
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, defenderWithPlacement),
    };
    const movement = createMovementResolutionState(withBoard, {
      engagementState,
      targetPlacement: engagementState.targetPlacement,
    });
    return updatePhaseState(
      withBoard,
      createIssueCommandsPhaseState(withBoard, {
        currentCommandResolutionState: movement,
      }),
    );
  },

  resolveFlankEngagement: (): GameStateForVisibility => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const defender = createTestUnit('white');
    const flank = createFlankEngagementState();
    const defenderPlacement: UnitWithPlacement = {
      placement: {
        coordinate: flank.targetPlacement.coordinate,
        facing: 'east',
      },
      unit: defender,
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, defenderPlacement),
    };
    const movement = createMovementResolutionState(withBoard, {
      engagementState: flank,
      targetPlacement: flank.targetPlacement,
    });
    return updatePhaseState(
      withBoard,
      createIssueCommandsPhaseState(withBoard, {
        currentCommandResolutionState: movement,
      }),
    );
  },

  resolveInitiative: (): GameStateForVisibility =>
    updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'assignInitiative',
    }),

  resolveMelee: (): GameStateForVisibility => {
    const state = createEmptyGameState();
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: whiteUnit,
    };
    const blackWp: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'south',
      },
      unit: blackUnit,
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };
    const phase = createResolveMeleePhaseState(s);
    return updatePhaseState(s, phase);
  },

  resolveRally: (): GameStateForVisibility => {
    const base = createEmptyGameState();
    const played = 'black' as const;
    // Assertion is to facilitate test helper.
    // Assumption is that there is alwys a card in play outside of the playCard and cleanup phases,
    // And that the test helper is only called in those phases.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const card = base.cardState[played].inPlay!;
    const withPlayed = updateCardState(base, {
      ...base.cardState,
      [played]: {
        ...base.cardState[played],
        played: [card],
      },
    });
    return updatePhaseState(
      withPlayed,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );
  },

  resolveRangedAttack: (): GameStateForVisibility => {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: defendingUnit,
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

  resolveRetreat: (): GameStateForVisibility => {
    const state = createEmptyGameState();
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: retreatingUnit,
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const finalPos = {
      coordinate: 'E-6' as const,
      facing: 'south' as const,
    };
    const attackApply = createAttackApplyStateWithRetreat(unitWithPlacement, {
      retreatState: createRetreatState(unitWithPlacement, {
        finalPosition: finalPos,
      }),
    });
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit: retreatingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  },

  resolveReverse: (): GameStateForVisibility => {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: defendingUnit,
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApply = createAttackApplyStateWithReverse(unitWithPlacement);
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  },

  resolveRout: (): GameStateForVisibility => {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: defendingUnit,
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApply = createAttackApplyStateWithRout(defendingUnit);
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  },

  resolveUnitsBroken: (): GameStateForVisibility =>
    updatePhaseState(
      createEmptyGameState({ currentInitiative: 'white' }),
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    ),

  revealCards: (): GameStateForVisibility => createEmptyGameState(),

  startEngagement: (): GameStateForVisibility => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const defender = createTestUnit('white');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, {
        placement: {
          coordinate: 'E-6',
          facing: 'south',
        },
        unit: defender,
      }),
    };
    const movement = createMovementResolutionState(withBoard, {
      movingUnit: {
        placement: {
          coordinate: 'E-5',
          facing: 'east',
        },
        unit: createTestUnit('black'),
      },
      targetPlacement: {
        coordinate: 'E-6',
        facing: 'north',
      },
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: movement,
    });
    return updatePhaseState(withBoard, phase);
  },

  triggerRoutFromRetreat: (): GameStateForVisibility => {
    const state = createEmptyGameState();
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: retreatingUnit,
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApply = createAttackApplyStateWithRetreat(unitWithPlacement);
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit: retreatingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  },
};

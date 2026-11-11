import type { UnitWithPlacement } from '@entities';
import type { GameEffectType } from '@events';
import {
  createAttackApplyState as createPendingAttackApply,
  createEmptyGameState,
} from '@factories';
/**
 * Minimal `GameState` builders for each `GameEffectType`, used to drive
 * `generateEventFromProcedure` in registry tests.
 *
 * Phase literals use `@entities/sequence/phases` (not the `@entities` barrel) so this file
 * does not pull expected-event schemas during init.
 *
 * No Vitest imports.
 */
import type { AuthoritativeGameState, IssueCommandsPhaseState } from '@game';
import {
  ISSUE_COMMANDS_PHASE,
  MOVE_COMMANDERS_PHASE,
  PLAY_CARDS_PHASE,
} from '@game';

import { getLegalRetreats } from '@legality';
import { tempCommandCards } from '@sampleValues';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import {
  createAttackApplyStateWithNothingDue,
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
  () => AuthoritativeGameState
> = {
  completeAttackApply: (): AuthoritativeGameState => {
    const state = createEmptyGameState('standard');
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
    const attackApplyState =
      createAttackApplyStateWithNothingDue(defendingUnit);
    const rangedAttackState = createRangedAttackResolutionState(stateWithUnit, {
      attackApplyState,
    });
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: rangedAttackState,
    });
    return updatePhaseState(stateWithUnit, phaseState);
  },

  completeCleanupPhase: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  completeIssueCommandsPhase: (): AuthoritativeGameState => {
    const initialPhaseState: IssueCommandsPhaseState = {
      currentCommandResolutionState: 'pending',
      phase: ISSUE_COMMANDS_PHASE,
      remainingCommandsFirstPlayer: [],
      remainingCommandsSecondPlayer: [],
      remainingUnitsFirstPlayer: [],
      remainingUnitsSecondPlayer: [],
      step: 'complete',
    };
    return updatePhaseState(
      createEmptyGameState('standard'),
      initialPhaseState,
    );
  },

  completeMeleeResolution: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  completeMoveCommandersPhase: (): AuthoritativeGameState => {
    const state = createEmptyGameState('standard');
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

  completePlayCardsPhase: (): AuthoritativeGameState =>
    updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    }),

  completeMovementCommand: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  completeRangedAttackCommand: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  completeResolveMeleePhase: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  completeUnitMovement: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  discardPlayedCards: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  gameOver: (): AuthoritativeGameState => {
    const base = createEmptyGameState('standard');
    return updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: [] },
    });
  },

  openRetreatFromAttackApply: (): AuthoritativeGameState => {
    const state = createEmptyGameState('standard');
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
    // Retreat still due: the factory leaves that slot pending until the opener runs.
    const attackApply = createPendingAttackApply(defendingUnit, {
      unitRetreated: true,
      unitReversed: false,
      unitRouted: false,
    });
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  },

  openReverseFromAttackApply: (): AuthoritativeGameState => {
    const state = createEmptyGameState('standard');
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
    // Reverse still due: the factory leaves that slot pending until the opener runs.
    const attackApply = createPendingAttackApply(defendingUnit, {
      unitRetreated: false,
      unitReversed: true,
      unitRouted: false,
    });
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  },

  openRoutFromAttackApply: (): AuthoritativeGameState => {
    const state = createEmptyGameState('standard');
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
    // Rout still due: the factory leaves that slot pending until the opener runs.
    const attackApply = createPendingAttackApply(defendingUnit, {
      unitRetreated: true,
      unitReversed: true,
      unitRouted: true,
    });
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  },

  openRetreatFromEngagement: (): AuthoritativeGameState => {
    const state = createEmptyGameState('standard');
    state.cardState.black.inPlay = createTestCard();
    // A defender engaged from the front, fast enough to get away, that has
    // chosen to fall back; its retreat is not open yet.
    const front = createFrontEngagementState({
      defendingUnitCanRetreat: true,
      defendingUnitRetreats: true,
    });
    const defenderWithPlacement: UnitWithPlacement = {
      placement: {
        coordinate: front.targetPlacement.coordinate,
        facing: 'south',
      },
      unit: createTestUnit('white'),
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, defenderWithPlacement),
    };
    const movement = createMovementResolutionState(withBoard, {
      engagementState: front,
      targetPlacement: front.targetPlacement,
    });
    return updatePhaseState(
      withBoard,
      createIssueCommandsPhaseState(withBoard, {
        currentCommandResolutionState: movement,
      }),
    );
  },

  resolveEngageRetreatOption: (): AuthoritativeGameState => {
    const state = createEmptyGameState('standard');
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

  resolveFlankEngagement: (): AuthoritativeGameState => {
    const state = createEmptyGameState('standard');
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

  resolveInitiative: (): AuthoritativeGameState => {
    const base = createEmptyGameState('standard');
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        inPlay: createTestCard(),
      },
      white: {
        ...base.cardState.white,
        inPlay: createTestCard(),
      },
    });
    return updatePhaseState(withCards, {
      phase: PLAY_CARDS_PHASE,
      step: 'assignInitiative',
    });
  },

  resolveMelee: (): AuthoritativeGameState => {
    const state = createEmptyGameState('standard');
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

  resolveRally: (): AuthoritativeGameState => {
    const base = createEmptyGameState('standard');
    const played = 'black' as const;
    const card = createTestCard();
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

  resolveRangedAttack: (): AuthoritativeGameState => {
    const state = createEmptyGameState('standard');
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

  resolveRetreat: (): AuthoritativeGameState => {
    const state = createEmptyGameState('standard');
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
    // On an open board the engine offers the unit one retreat, a step
    // straight back to F-5 (§9.1.3), and that path is already chosen.
    const legalRetreatPaths = getLegalRetreats(unitWithPlacement, withBoard);
    const attackApply = createAttackApplyStateWithRetreat(
      unitWithPlacement,
      legalRetreatPaths,
      {
        retreatState: createRetreatState(unitWithPlacement, legalRetreatPaths, {
          chosenRetreatPath: legalRetreatPaths[0],
        }),
      },
    );
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit: retreatingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  },

  resolveReverse: (): AuthoritativeGameState => {
    const state = createEmptyGameState('standard');
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
    const attackApply = createAttackApplyStateWithReverse(
      unitWithPlacement.unit,
    );
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  },

  resolveRout: (): AuthoritativeGameState => {
    const state = createEmptyGameState('standard');
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

  revealCards: (): AuthoritativeGameState => {
    const base = createEmptyGameState('standard');
    return updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        awaitingPlay: createTestCard(),
      },
      white: {
        ...base.cardState.white,
        awaitingPlay: createTestCard(),
      },
    });
  },

  startEngagement: (): AuthoritativeGameState => {
    const state = createEmptyGameState('standard');
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

  triggerRoutFromRetreat: (): AuthoritativeGameState => {
    const state = createEmptyGameState('standard');
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: retreatingUnit,
    };
    // An enemy directly behind, facing the unit, cuts its line of withdrawal
    // (§9.1.5): it cannot retreat, so it routs instead (§9.1.6).
    const cuttingEnemy: UnitWithPlacement = {
      placement: { coordinate: 'F-5', facing: 'north' },
      unit: createTestUnit('black'),
    };
    const withUnit = addUnitToBoard(state.boardState, unitWithPlacement);
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(withUnit, cuttingEnemy),
    };
    const legalRetreatPaths = getLegalRetreats(unitWithPlacement, withBoard);
    const attackApply = createAttackApplyStateWithRetreat(
      unitWithPlacement,
      legalRetreatPaths,
    );
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

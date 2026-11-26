import type { UnitPlacement, UnitWithPlacement } from '@entities';
import type { GameEffectType } from '@events';
import {
  createAttackApplyState as createPendingAttackApply,
  createEmptyGameState,
} from '@factories';
/**
 * Minimal `GameState` builders for each {@link GameEffectType}, used to drive
 * `generateEventFromProcedure` in registry tests.
 *
 * Phase literals use `@entities/sequence/phases` (not the `@entities` barrel) so this file
 * does not pull expected-event schemas during init.
 *
 * No Vitest imports.
 */
import type {
  AttackApplyState,
  AuthoritativeGameState,
  MovementResolutionState,
} from '@game';

import { tempCommandCards } from '@sampleValues';

import { updatePhaseState, updatePlayerCardState } from '@transforms';

import { createGameStateWithUnits } from './createBoard';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithReverse,
  createAttackApplyStateWithRout,
  createCleanupPhaseState,
  createFlankEngagementState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMoveCommandersPhaseState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
} from './phaseStateHelpers';
import {
  createTestCard,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
  updateCardState,
} from './testHelpers';
import { createTestUnit, createUnitByStat } from './unitHelpers';
import { withLostCommander } from './withLostCommander';

/** Where the engaging moves below end: the defender's space, E-5. */
const engagedSpace: UnitPlacement = { coordinate: 'E-5', facing: 'north' };

/**
 * The unit every shot below is aimed at: White's, alone on E-5, facing north.
 *
 * @returns A fresh copy of that unit where it stands
 */
function shotTarget(): UnitWithPlacement {
  const target: UnitWithPlacement = {
    placement: { coordinate: 'E-5', facing: 'north' },
    unit: createTestUnit('white', { attack: 2 }),
  };
  return target;
}

/**
 * Phase 3, with the first player's Shoot order under way at a target on the
 * board, and the attack it struck at the point a spec needs.
 *
 * @param target - The unit shot at, standing where it stands
 * @param attackApplyState - What the shot did to it, or `'pending'` before it lands
 * @param others - Anyone else on the board
 * @returns The game, carrying out that shot
 */
function shootingAt(
  target: UnitWithPlacement,
  attackApplyState: AttackApplyState | 'pending',
  others: UnitWithPlacement[] = [],
): AuthoritativeGameState {
  const withBoard = createGameStateWithUnits([target, ...others]);
  const ranged = createRangedAttackResolutionState(withBoard, {
    attackApplyState,
    defendingUnit: target.unit,
  });
  const phase = createIssueCommandsPhaseState(withBoard, {
    currentCommandResolutionState: ranged,
  });
  const shooting = updatePhaseState(withBoard, phase);
  return shooting;
}

/**
 * Phase 3, with Black's Move order under way into a defender on the board,
 * Black's card in play.
 *
 * @param defender - The unit moved into, standing where it stands
 * @param movement - The move's own slots: its engagement, mover and ending
 * @returns The game, carrying out that move
 */
function movingInto(
  defender: UnitWithPlacement,
  movement: Partial<MovementResolutionState>,
): AuthoritativeGameState {
  const withBoard = createGameStateWithUnits([defender]);
  const withCard = updatePlayerCardState(withBoard, 'black', {
    ...withBoard.cardState.black,
    inPlay: createTestCard(),
  });
  const move = createMovementResolutionState(withCard, movement);
  const phase = createIssueCommandsPhaseState(withCard, {
    currentCommandResolutionState: move,
  });
  const moving = updatePhaseState(withCard, phase);
  return moving;
}

/** Minimal valid state per effect so registry dispatch reaches the target procedure. */
export const procedureRegistryStateFactories: Record<
  GameEffectType,
  () => AuthoritativeGameState
> = {
  completeAttackApply: (): AuthoritativeGameState => {
    const target = shotTarget();
    const attackApplyState = createAttackApplyStateWithNothingDue(target.unit);
    const state = shootingAt(target, attackApplyState);
    return state;
  },

  roundEnd: (): AuthoritativeGameState => createEmptyGameState('standard'),

  completeIssueCommandsPhase: (): AuthoritativeGameState => {
    const base = createEmptyGameState('standard');
    const initialPhaseState = createIssueCommandsPhaseState(base, {
      step: 'complete',
    });
    const state = updatePhaseState(base, initialPhaseState);
    return state;
  },

  completeMeleeResolution: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  completeMoveCommandersPhase: (): AuthoritativeGameState => {
    const base = createEmptyGameState('standard');
    const stateWithCards = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: tempCommandCards[0] },
      white: { ...base.cardState.white, inPlay: tempCommandCards[1] },
    });
    const phase = createMoveCommandersPhaseState({ step: 'complete' });
    const state = updatePhaseState(stateWithCards, phase);
    return state;
  },

  completePlayCardsPhase: (): AuthoritativeGameState => {
    const phase = createPlayCardsPhaseState({ step: 'complete' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);
    return state;
  },

  skipLostCommanderMove: (): AuthoritativeGameState => {
    // The first player's Move Commanders turn, with their commander fallen.
    const fallen = withLostCommander(createEmptyGameState('standard'), 'white');
    const phase = createMoveCommandersPhaseState();
    const state = updatePhaseState(fallen, phase);
    return state;
  },

  completeMovementCommand: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  completeRangedAttack: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  completeRangedAttackCommand: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  completeResolveMeleePhase: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  completeUnitMovement: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  cardsLeavePlay: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  gameOver: (): AuthoritativeGameState => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: [] },
    });
    return state;
  },

  openRetreatFromAttackApply: (): AuthoritativeGameState => {
    const target = shotTarget();
    // Retreat still due: the factory leaves that slot pending until the opener runs.
    const attackApply = createPendingAttackApply(target.unit, {
      unitRetreated: true,
      unitReversed: false,
      unitRouted: false,
    });
    const state = shootingAt(target, attackApply);
    return state;
  },

  openReverseFromAttackApply: (): AuthoritativeGameState => {
    const target = shotTarget();
    // Reverse still due: the factory leaves that slot pending until the opener runs.
    const attackApply = createPendingAttackApply(target.unit, {
      unitRetreated: false,
      unitReversed: true,
      unitRouted: false,
    });
    const state = shootingAt(target, attackApply);
    return state;
  },

  openRoutFromAttackApply: (): AuthoritativeGameState => {
    const target = shotTarget();
    // Rout still due: the factory leaves that slot pending until the opener runs.
    const attackApply = createPendingAttackApply(target.unit, {
      unitRetreated: true,
      unitReversed: true,
      unitRouted: true,
    });
    const state = shootingAt(target, attackApply);
    return state;
  },

  openRetreatFromEngagement: (): AuthoritativeGameState => {
    // A defender engaged from the front, fast enough to get away, that has
    // chosen to fall back; its retreat is not open yet.
    const defenderWithPlacement: UnitWithPlacement = {
      placement: {
        coordinate: engagedSpace.coordinate,
        facing: 'south',
      },
      unit: createTestUnit('white'),
    };
    // The retreat option was resolved with a way back, and the defender chose
    // to take it.
    const front = createFrontEngagementState({
      defendingUnitRetreats: true,
      retreatPaths: legalRetreatsOf(defenderWithPlacement),
    });
    const state = movingInto(defenderWithPlacement, {
      engagementState: front,
      targetPlacement: engagedSpace,
    });
    return state;
  },

  resolveEngageRetreatOption: (): AuthoritativeGameState => {
    const defenderWithPlacement: UnitWithPlacement = {
      placement: {
        coordinate: engagedSpace.coordinate,
        facing: 'south',
      },
      unit: createUnitByStat('white', 'speed', 4),
    };
    const state = movingInto(defenderWithPlacement, {
      engagementState: createFrontEngagementState(),
      movingUnit: createUnitByStat('black', 'speed', 2),
      targetPlacement: engagedSpace,
    });
    return state;
  },

  resolveFlankEngagement: (): AuthoritativeGameState => {
    const defenderPlacement: UnitWithPlacement = {
      placement: {
        coordinate: engagedSpace.coordinate,
        facing: 'east',
      },
      unit: createTestUnit('white'),
    };
    const state = movingInto(defenderPlacement, {
      engagementState: createFlankEngagementState(),
      targetPlacement: engagedSpace,
    });
    return state;
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
    const phase = createPlayCardsPhaseState({ step: 'assignInitiative' });
    const state = updatePhaseState(withCards, phase);
    return state;
  },

  resolveMelee: (): AuthoritativeGameState => {
    const whiteWp: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: createTestUnit('white', { attack: 2 }),
    };
    const blackWp: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'south',
      },
      unit: createTestUnit('black', { attack: 2 }),
    };
    const engaged = createGameStateWithUnits([whiteWp, blackWp]);
    const phase = createResolveMeleePhaseState(engaged);
    const state = updatePhaseState(engaged, phase);
    return state;
  },

  resolveRally: (): AuthoritativeGameState => {
    const base = createEmptyGameState('standard');
    // The first player rallies first; White holds the initiative at the start.
    const played = base.currentInitiative;
    const card = createTestCard();
    const withPlayed = updateCardState(base, {
      ...base.cardState,
      [played]: {
        ...base.cardState[played],
        played: [card],
      },
    });
    const phase = createCleanupPhaseState({ step: 'firstPlayerResolveRally' });
    const state = updatePhaseState(withPlayed, phase);
    return state;
  },

  resolveRangedAttack: (): AuthoritativeGameState => {
    const state = shootingAt(shotTarget(), 'pending');
    return state;
  },

  resolveRetreat: (): AuthoritativeGameState => {
    const target = shotTarget();
    // On an open board the engine offers the unit one retreat, a step
    // straight back to F-5 (§9.1.3), and that path is already chosen.
    const legalRetreatPaths = legalRetreatsOf(target);
    const attackApply = createAttackApplyStateWithRetreat(
      target.unit,
      legalRetreatPaths,
      {
        retreatState: createRetreatState(target.unit, legalRetreatPaths, {
          chosenRetreatPath: legalRetreatPaths[0],
        }),
      },
    );
    const state = shootingAt(target, attackApply);
    return state;
  },

  resolveReverse: (): AuthoritativeGameState => {
    const target = shotTarget();
    const attackApply = createAttackApplyStateWithReverse(target.unit);
    const state = shootingAt(target, attackApply);
    return state;
  },

  resolveRout: (): AuthoritativeGameState => {
    const target = shotTarget();
    const attackApply = createAttackApplyStateWithRout(target.unit);
    const state = shootingAt(target, attackApply);
    return state;
  },

  revealCards: (): AuthoritativeGameState => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
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
    return state;
  },

  startEngagement: (): AuthoritativeGameState => {
    const defender: UnitWithPlacement = {
      placement: {
        coordinate: 'E-6',
        facing: 'south',
      },
      unit: createTestUnit('white'),
    };
    const state = movingInto(defender, {
      movingUnit: createTestUnit('black'),
      targetPlacement: {
        coordinate: 'E-6',
        facing: 'north',
      },
    });
    return state;
  },

  triggerRoutFromRetreat: (): AuthoritativeGameState => {
    const target = shotTarget();
    // An enemy directly behind, facing the unit, cuts its line of withdrawal
    // (§9.1.5): it cannot retreat, so it routs instead (§9.1.6).
    const cuttingEnemy = enemyCuttingOffRetreat(target);
    const legalRetreatPaths = legalRetreatsOf(target, [cuttingEnemy]);
    const attackApply = createAttackApplyStateWithRetreat(
      target.unit,
      legalRetreatPaths,
    );
    const state = shootingAt(target, attackApply, [cuttingEnemy]);
    return state;
  },
};

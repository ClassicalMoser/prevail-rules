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
 * TODO(misleading): there is no `@entities/sequence/phases`; the phases are in
 * `@game`, and this file builds them through the `@testing` phase fixtures
 * rather than from literals. To settle: say what, if anything, the file must
 * avoid importing at init, or drop the paragraph.
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
  // The target, and anyone else the case needs, on a standard board.
  const withBoard = createGameStateWithUnits([target, ...others]);

  // A shot from the stand-in Black shooter at that target, both
  // commitments made, with what the shot did so far.
  const ranged = createRangedAttackResolutionState(withBoard, {
    attackApplyState,
    defendingUnit: target.unit,
  });

  // The first player carrying out that Shoot order in Phase 3.
  const phase = createIssueCommandsPhaseState(withBoard, {
    currentCommandResolutionState: ranged,
  });
  const shooting = updatePhaseState(withBoard, phase);

  // The game, partway through the shot.
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
  // The defender alone on a standard board.
  const withBoard = createGameStateWithUnits([defender]);

  // Black has a Move card in play: the order this move carries out.
  const withCard = updatePlayerCardState(withBoard, 'black', {
    ...withBoard.cardState.black,
    inPlay: createTestCard(),
  });

  // The move under way, holding what it met.
  const move = createMovementResolutionState(withCard, movement);

  // The first player carrying out that Move order in Phase 3.
  const phase = createIssueCommandsPhaseState(withCard, {
    currentCommandResolutionState: move,
  });
  const moving = updatePhaseState(withCard, phase);

  // The game, partway through the move.
  return moving;
}

/** Minimal valid state per effect so registry dispatch reaches the target procedure. */
export const procedureRegistryStateFactories: Record<
  GameEffectType,
  () => AuthoritativeGameState
> = {
  completeAttackApply: (): AuthoritativeGameState => {
    // A shot that reached no threshold, so its attack-apply has nothing left to do.
    const target = shotTarget();
    const attackApplyState = createAttackApplyStateWithNothingDue(target.unit);
    const state = shootingAt(target, attackApplyState);
    return state;
  },

  // The procedure reads nothing from the state, so an empty game reaches it.
  roundEnd: (): AuthoritativeGameState => createEmptyGameState('standard'),

  completeIssueCommandsPhase: (): AuthoritativeGameState => {
    // Phase 3 with both players' orders carried out.
    const base = createEmptyGameState('standard');
    const initialPhaseState = createIssueCommandsPhaseState(base, {
      step: 'complete',
    });
    const state = updatePhaseState(base, initialPhaseState);
    return state;
  },

  // The procedure reads nothing from the state, so an empty game reaches it.
  completeMeleeResolution: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  completeMoveCommandersPhase: (): AuthoritativeGameState => {
    // Phase 2 done, both players' cards in play for the round.
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
    // Phase 1 at its last step; the procedure reads nothing more.
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

  // The procedure reads nothing from the state, so an empty game reaches it.
  completeMovementCommand: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  // The procedure reads nothing from the state, so an empty game reaches it.
  completeRangedAttack: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  // The procedure reads nothing from the state, so an empty game reaches it.
  completeRangedAttackCommand: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  // The procedure reads nothing from the state, so an empty game reaches it.
  completeResolveMeleePhase: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  // The procedure reads nothing from the state, so an empty game reaches it.
  completeUnitMovement: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  // The procedure reads nothing from the state, so an empty game reaches it.
  cardsLeavePlay: (): AuthoritativeGameState =>
    createEmptyGameState('standard'),

  gameOver: (): AuthoritativeGameState => {
    // White's hand is empty, which loses the game at once (§11.1).
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: [] },
    });
    return state;
  },

  openRetreatFromAttackApply: (): AuthoritativeGameState => {
    // A shot that reached Retreat, the retreat not yet opened.
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
    // A shot that reached Reverse, the reverse not yet opened.
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
    // A shot that reached all three thresholds; the rout waits to open.
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
    // A front engagement whose defender has yet to be offered the chance to
    // fall back, as one faster than its engager may be (§6.3.2).
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
    // A defender facing east, struck from the flank by a mover facing north,
    // and not yet turned to face it (§6.3.4).
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
    // Both cards revealed, initiative still to assign (§4.1.3).
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
    // Two units engaged on E-5, squared up, their melee under way in Phase 4.
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
    // The first player's rally in Cleanup, a card on the played pile to burn
    // (§10.3.3).
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
    // A shot aimed and committed to, not yet landed.
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
    // A shot that reached Reverse, its reverse open.
    const target = shotTarget();
    const attackApply = createAttackApplyStateWithReverse(target.unit);
    const state = shootingAt(target, attackApply);
    return state;
  },

  resolveRout: (): AuthoritativeGameState => {
    // A shot that reached Rout, its rout open.
    const target = shotTarget();
    const attackApply = createAttackApplyStateWithRout(target.unit);
    const state = shootingAt(target, attackApply);
    return state;
  },

  revealCards: (): AuthoritativeGameState => {
    // Both cards chosen face down, waiting to be turned over (§4.1.2).
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
    // Black's move ends on E-6, where White stands facing it: the
    // engagement it walks into is not yet set up (§6.1.1).
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

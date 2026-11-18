import type { Coordinate, PlayerSide, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import type {
  ChooseCardEvent,
  ChooseMeleeResolutionEvent,
  ChooseRallyEvent,
  ChooseRetreatOptionEvent,
  ChooseWhetherToRetreatEvent,
  CommitToMeleeEvent,
  CommitToMovementEvent,
  CommitToRangedAttackEvent,
  CommitToRangedDefenseEvent,
  PlayerChoiceType,
  PlayerSource,
} from '@events';
import { findExpectedEvent } from '@expected';
import type { GameState } from '@game';
import {
  getLegalChooseCardOptions,
  getLegalChooseMeleeResolutionEvents,
  getLegalChooseRallyEvent,
  getLegalChooseRetreatOptionEvents,
  getLegalChooseWhetherToRetreatEvents,
  getLegalCommitToMeleeEvents,
  getLegalCommitToMovementEvents,
  getLegalCommitToRangedAttackEvents,
  getLegalCommitToRangedDefenseEvents,
  getLegalCommanderMoves,
  getLegalIssueCommands,
  getLegalMoveUnits,
  getLegalUnitMoves,
  getLegalShooterTargets,
  getLegalRangedAttackers,
  getLegalRoutDiscardCards,
  getLegalSetupUnits,
  getLegalAssignUnitSupport,
} from '@legality';
import type {
  LegalAssignUnitSupport,
  LegalIssueCommands,
  LegalMoveUnits,
  LegalRangedAttackers,
  LegalRoutDiscardCards,
  LegalSetupUnits,
  MoveResult,
} from '@legality';
import {
  getCommanderSpace,
  getMovementResolutionState,
  modifiersFromCompletedCommitment,
} from '@queries';

/**
 * What is offered for each choice a player can be asked for: who is asked,
 * and the legal options, keyed by the choice. Every choice but one is asked
 * of a single side; choosing a card is asked of both at once (§4.1.1), so
 * only `chooseCard` names a {@link PlayerSource}.
 */
export interface LegalPlayerChoiceOptionsByChoice {
  /** The unit support a rallied hand holds, and the units it may hold (§10.4.4). */
  assignUnitSupport: {
    playerSource: PlayerSide;
    assignUnitSupport: LegalAssignUnitSupport;
  };
  /** The cards each player may lay face down, both at once (§4.1.1). */
  chooseCard: { playerSource: PlayerSource; events: ChooseCardEvent[] };
  /** The engagements the first player may fight next (§4.4.2). */
  chooseMeleeResolution: {
    playerSource: PlayerSide;
    events: ChooseMeleeResolutionEvent[];
  };
  /** Whether to rally at cleanup (§4.5.2). */
  chooseRally: { playerSource: PlayerSide; events: ChooseRallyEvent[] };
  /** The cards that may pay a rout's Morale (§9.3.2). */
  chooseRoutDiscard: {
    playerSource: PlayerSide;
    routDiscard: LegalRoutDiscardCards;
  };
  /** The equally small retreats the owner chooses among (§9.1.3). */
  chooseRetreatOption: {
    playerSource: PlayerSide;
    events: ChooseRetreatOptionEvent[];
  };
  /** A card to commit to a melee, or none (§7.2.2). */
  commitToMelee: { playerSource: PlayerSide; events: CommitToMeleeEvent[] };
  /** A card to commit before a move, or none (§4.3.10). */
  commitToMovement: {
    playerSource: PlayerSide;
    events: CommitToMovementEvent[];
  };
  /** Whether a faster defender falls back from a front engagement (§6.3.2). */
  chooseWhetherToRetreat: {
    playerSource: PlayerSide;
    events: ChooseWhetherToRetreatEvent[];
  };
  /** A card the shooter commits to its shot, or none (§4.3.11). */
  commitToRangedAttack: {
    playerSource: PlayerSide;
    events: CommitToRangedAttackEvent[];
  };
  /** A card the target commits against the shot, or none (§4.3.11). */
  commitToRangedDefense: {
    playerSource: PlayerSide;
    events: CommitToRangedDefenseEvent[];
  };
  /** The orders still to give (§4.3.2–4.3.3). */
  issueCommand: {
    playerSource: PlayerSide;
    issueCommands: LegalIssueCommands;
  };
  /** Where the commander may go, from where it stands (§4.2). */
  moveCommander: {
    playerSource: PlayerSide;
    startingCoordinate: Coordinate;
    destinations: Coordinate[];
  };
  /** The commanded units still able to move (§4.3.9). */
  chooseMovingUnit: { playerSource: PlayerSide; moveUnits: LegalMoveUnits };
  /** Every ending the named unit's move may reach. */
  moveUnit: {
    playerSource: PlayerSide;
    /** The unit whose move is being written. */
    movingUnit: UnitWithPlacement;
    /**
     * Every legal ending of the move, each with a path to submit, priced
     * with the card committed for it (§4.3.10). Step-by-step offering is
     * `findLegalMoveDeltas`.
     */
    moves: MoveResult[];
  };
  /** The units able to shoot (§4.3.11). */
  chooseShooter: {
    playerSource: PlayerSide;
    rangedAttackers: LegalRangedAttackers;
  };
  /** Every enemy the named shooter may target. */
  performRangedAttack: {
    playerSource: PlayerSide;
    /** The unit whose shot is being aimed. */
    shooter: UnitWithPlacement;
    /**
     * Every enemy it may target, with the card committed for the shot
     * counted (§4.3.11 steps 2–3). Supporters for a chosen target are
     * `getLegalRangedAttackSupporters`.
     */
    targets: UnitWithPlacement[];
  };
  /** The units and spaces still open for deployment (§3.5). */
  setupUnits: { playerSource: PlayerSide; setupUnits: LegalSetupUnits };
}

/**
 * Every choice a player can be asked for has its options in the map, and the
 * map offers no choice that does not exist.
 */
const _everyChoiceOffered: AssertExact<
  keyof LegalPlayerChoiceOptionsByChoice,
  PlayerChoiceType
> = true;

/**
 * The options offered for one choice, or for any of several: the choice's
 * name alongside what the map holds for it. A union of choices gives the
 * union of their options, so the four commitments are one argument.
 */
export type LegalPlayerChoiceOptionsFor<C extends PlayerChoiceType> = {
  [K in C]: { choiceType: K } & LegalPlayerChoiceOptionsByChoice[K];
}[C];

/** The options offered for whichever choice is expected. */
export type LegalPlayerChoiceOptions =
  LegalPlayerChoiceOptionsFor<PlayerChoiceType>;

/**
 * The one side asked for a choice that is not made by both at once. Only
 * choosing cards is asked of both players (§4.1.1), and the router answers
 * that choice before asking this.
 *
 * @throws When both players are asked, so no single side is named
 */
function getSingleSideAsked(playerSource: PlayerSource): PlayerSide {
  if (playerSource === 'bothPlayers') {
    throw new Error(
      'Only choosing cards is asked of both players, so no single side is asked',
    );
  }
  return playerSource;
}

/**
 * Presentation router for legal player-choice options.
 *
 * Uses `getExpectedEvent` for what/who, then packages the matching
 * `@legality` root atoms or event lists. Selection-dependent follow-ups
 * (destinations, targets, lines, …) stay on their existing helpers.
 *
 * Lives in `@validation` (not `@legality`) because it composes `@expected` +
 * `@legality` — legality cannot import expected under the layer boundaries.
 *
 * Returns `null` when nothing is owed a choice: the game is over, or the next
 * expected action is a game effect. Soft-empty option payloads when
 * enumerators return `null`/`[]`; an enumerator that throws is a fault and
 * throws to the caller with its own message.
 *
 * @throws When an enumerator for the expected choice throws.
 */
export function getLegalPlayerChoiceOptions<S extends GameState>(
  state: S,
): LegalPlayerChoiceOptions | null {
  const expected = findExpectedEvent(state);

  // A finished game, or an effect the engine applies itself, is owed no choice.
  if (expected === undefined || expected.actionType !== 'playerChoice') {
    return null;
  }

  // Both players choose their cards at once, in secret (§4.1.1), until one
  // has laid its card face down; offer the cards each may still play.
  if (expected.choiceType === 'chooseCard') {
    const chooseCard: LegalPlayerChoiceOptionsFor<'chooseCard'> = {
      choiceType: 'chooseCard',
      events: getLegalChooseCardOptions(state),
      playerSource: expected.playerSource,
    };
    return chooseCard;
  }

  // Every other choice is asked of one side, named on every offer.
  const player = getSingleSideAsked(expected.playerSource);
  const base = { playerSource: player };

  switch (expected.choiceType) {
    case 'assignUnitSupport': {
      // After a rally the player must give each unit a place under the unit
      // support their hand's cards hold (§10.4.4); offer that support and the
      // units that match it, and the places are filled one at a time from
      // getLegalUnitSupportAssignments. Whatever is left over routs (§10.4.6).
      const assignUnitSupport = getLegalAssignUnitSupport(state);
      return {
        ...base,
        assignUnitSupport,
        choiceType: 'assignUnitSupport',
      };
    }
    case 'chooseMeleeResolution': {
      // The first player chooses which engagement to resolve next, and the order
      // is entirely theirs (§4.4.2); offer the engagements still unresolved.
      return {
        ...base,
        choiceType: 'chooseMeleeResolution',
        events: getLegalChooseMeleeResolutionEvents(state),
      };
    }
    case 'chooseRally': {
      // The first player decides whether to rally at cleanup (§4.5.2); offer
      // that decision.
      return {
        ...base,
        choiceType: 'chooseRally',
        events: getLegalChooseRallyEvent(state),
      };
    }
    case 'chooseRoutDiscard': {
      // A routed unit costs its Morale, paid by discarding cards chosen freely
      // from hand (§9.3.2); offer the cards that may pay it.
      const routDiscard = getLegalRoutDiscardCards(state);
      return {
        ...base,
        choiceType: 'chooseRoutDiscard',
        routDiscard,
      };
    }
    case 'chooseRetreatOption': {
      // A retreat must be the smallest legal backward move, and where several
      // tie the owner chooses the space and facing (§9.1.3); offer those ties.
      return {
        ...base,
        choiceType: 'chooseRetreatOption',
        events: getLegalChooseRetreatOptionEvents(state),
      };
    }
    case 'commitToMelee': {
      // Committing a card is optional and worth +1, and only a card in hand may
      // be committed (§8.6); offer each legal commitment, or none.
      return {
        ...base,
        choiceType: 'commitToMelee',
        events: getLegalCommitToMeleeEvents(state),
      };
    }
    case 'commitToMovement': {
      // Committing a card is optional and worth +1, and only a card in hand may
      // be committed (§8.6); offer each legal commitment, or none.
      return {
        ...base,
        choiceType: 'commitToMovement',
        events: getLegalCommitToMovementEvents(state),
      };
    }
    case 'chooseWhetherToRetreat': {
      // A defender faster than the engager, with a retreat to make, may fall
      // back instead of fighting (§6.3.2); offer the retreat-or-stand choices.
      return {
        ...base,
        choiceType: 'chooseWhetherToRetreat',
        events: getLegalChooseWhetherToRetreatEvents(state),
      };
    }
    case 'commitToRangedAttack': {
      // Committing a card is optional and worth +1, and only a card in hand may
      // be committed (§8.6); offer each legal commitment, or none.
      return {
        ...base,
        choiceType: 'commitToRangedAttack',
        events: getLegalCommitToRangedAttackEvents(state),
      };
    }
    case 'commitToRangedDefense': {
      // Committing a card is optional and worth +1, and only a card in hand may
      // be committed (§8.6); offer each legal commitment, or none.
      return {
        ...base,
        choiceType: 'commitToRangedDefense',
        events: getLegalCommitToRangedDefenseEvents(state),
      };
    }
    case 'issueCommand': {
      // Offer the orders still to give. Stopping, with no order, is always
      // open while any are left (§4.3.3), so it needs no listing.
      const issueCommands = getLegalIssueCommands(state);
      return {
        ...base,
        choiceType: 'issueCommand',
        issueCommands,
      };
    }
    case 'moveCommander': {
      // The first player moves their commander, then the second (§4.2.1);
      // offer where this commander may go. A fallen commander's turn is
      // passed over before this is asked (§4.2.8), so the commander must be
      // on the board, and its absence throws.
      const startingCoordinate = getCommanderSpace(player, state.boardState);
      return {
        ...base,
        choiceType: 'moveCommander',
        destinations: [
          ...getLegalCommanderMoves(player, state, startingCoordinate),
        ],
        startingCoordinate,
      };
    }
    case 'chooseMovingUnit': {
      // Each commanded unit is finished before the next begins (§4.3.9); offer
      // the units still able to move.
      const moveUnits = getLegalMoveUnits(state);
      return {
        ...base,
        choiceType: 'chooseMovingUnit',
        moveUnits,
      };
    }
    case 'moveUnit': {
      // A unit has been named and its card settled; offer every ending its move
      // may reach, the committed card counted.
      const movement = getMovementResolutionState(state);
      return {
        ...base,
        choiceType: 'moveUnit',
        movingUnit: movement.movingUnit,
        moves: [
          ...getLegalUnitMoves(
            movement.movingUnit,
            state,
            modifiersFromCompletedCommitment(movement.commitment),
          ),
        ],
      };
    }
    case 'chooseShooter': {
      // A command may order several shooters, one shot at a time; offer the
      // units able to shoot.
      const rangedAttackers = getLegalRangedAttackers(state);
      return {
        ...base,
        choiceType: 'chooseShooter',
        rangedAttackers,
      };
    }
    case 'performRangedAttack': {
      // A shooter has been named and its card settled; offer every enemy it may
      // target, the committed card counted.
      const legal = getLegalShooterTargets(state);
      return {
        ...base,
        choiceType: 'performRangedAttack',
        shooter: legal.shooter,
        targets: [...legal.targets],
      };
    }
    case 'setupUnits': {
      // Each player places their whole army in their own zone, one unit per
      // space (§3.5.1); offer the units and spaces still open.
      const setupUnits = getLegalSetupUnits(state, player);
      return {
        ...base,
        choiceType: 'setupUnits',
        setupUnits,
      };
    }
    default: {
      const _exhaustive: never = expected.choiceType;
      return _exhaustive;
    }
  }
}

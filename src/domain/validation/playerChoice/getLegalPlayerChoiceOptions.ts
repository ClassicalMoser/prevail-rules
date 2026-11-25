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
  listMovesInBoardOrder,
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
  getUnitWithPlacementOnBoard,
  listInBoardOrder,
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
  /**
   * The command on the card in play, to be spent at once (§4.3); its units
   * or lines are offered a part at a time by `getLegalUnitsToOrder` and
   * `getLegalLinesToOrder`.
   */
  issueCommands: {
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
  // Only the card choice of Phase 1 is asked of both players at once, and
  // the router has answered that one already.
  // TODO(composition): unreachable while the expected engine names both
  // players only for `chooseCard` (`getExpectedPlayCardsPhaseEvent`), and no
  // spec can reach it, since the expected event is read from the state, not
  // passed in. `ExpectedPlayerInput` lets any choice name both players; a
  // union that names both only for `chooseCard` would let the type rule
  // this out and the guard go. Settled by the author deciding that shape in
  // `@events`.
  if (playerSource === 'bothPlayers') {
    throw new Error(
      'Only choosing cards is asked of both players, so no single side is asked',
    );
  }

  // The one side asked.
  return playerSource;
}

/**
 * Presentation router for legal player-choice options.
 *
 * TODO(misleading): the next paragraph names `getExpectedEvent`, and
 * "Soft-empty option payloads when enumerators return `null`/`[]`" reads as
 * though this turned a `null` into an empty offer. The body calls
 * `findExpectedEvent`, so a finished game answers `null` here instead of
 * throwing, and it passes each enumerator's answer through unchanged.
 * Settled by rewording both to match.
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
 *
 * A bot reads its choice from these offers (`getBotChoice`), and the bot
 * harness asks it whether a seat is owed a choice at all (`playBotGame`).
 */
export function getLegalPlayerChoiceOptions<S extends GameState>(
  state: S,
): LegalPlayerChoiceOptions | null {
  const expected = findExpectedEvent(state);

  // A finished game, or an effect the engine applies itself, is owed no choice.
  if (expected === undefined || expected.actionType !== 'playerChoice') {
    // Nothing to offer: no player is asked.
    const nothingOwed = null;
    return nothingOwed;
  }

  // Both players choose their cards at once, in secret (§4.1.1), until one
  // has laid its card face down; offer the cards each may still play.
  if (expected.choiceType === 'chooseCard') {
    const chooseCard: LegalPlayerChoiceOptionsFor<'chooseCard'> = {
      choiceType: 'chooseCard',
      events: getLegalChooseCardOptions(state),
      playerSource: expected.playerSource,
    };
    // Each player's own cards, both offered at once.
    return chooseCard;
  }

  // Every other choice is asked of one side, named on every offer.
  const player = getSingleSideAsked(expected.playerSource);
  const base = { playerSource: player };

  // Each branch asks the enumerator for its choice, and returns the offer
  // under that choice's name with the side asked.

  switch (expected.choiceType) {
    case 'assignUnitSupport': {
      // After a rally the player must give each unit a place under the unit
      // support their hand's cards hold (§10.4.4); offer that support and the
      // units that match it, and the places are filled one at a time from
      // getLegalUnitSupportAssignments. Whatever is left over routs (§10.4.6).
      const assignUnitSupport = getLegalAssignUnitSupport(state);
      const supportOffer: LegalPlayerChoiceOptions = {
        ...base,
        assignUnitSupport,
        choiceType: 'assignUnitSupport',
      };
      return supportOffer;
    }
    case 'chooseMeleeResolution': {
      // The first player chooses which engagement to resolve next, and the order
      // is entirely theirs (§4.4.2); offer the engagements still unresolved.
      const events = getLegalChooseMeleeResolutionEvents(state);
      const meleeOrderOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'chooseMeleeResolution',
        events,
      };
      return meleeOrderOffer;
    }
    case 'chooseRally': {
      // The first player decides whether to rally at cleanup (§4.5.2); offer
      // that decision.
      const events = getLegalChooseRallyEvent(state);
      const rallyOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'chooseRally',
        events,
      };
      return rallyOffer;
    }
    case 'chooseRoutDiscard': {
      // A routed unit costs its Morale, paid by discarding cards chosen freely
      // from hand (§9.3.2); offer the cards that may pay it.
      const routDiscard = getLegalRoutDiscardCards(state);
      const discardOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'chooseRoutDiscard',
        routDiscard,
      };
      return discardOffer;
    }
    case 'chooseRetreatOption': {
      // A retreat must be the smallest legal backward move, and where several
      // tie the owner chooses the space and facing (§9.1.3); offer those ties.
      const events = getLegalChooseRetreatOptionEvents(state);
      const retreatOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'chooseRetreatOption',
        events,
      };
      return retreatOffer;
    }
    case 'commitToMelee': {
      // Committing a card is optional and worth +1, and only a card in hand may
      // be committed (§8.6); offer each legal commitment, or none.
      const events = getLegalCommitToMeleeEvents(state);
      const meleeCommitmentOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'commitToMelee',
        events,
      };
      return meleeCommitmentOffer;
    }
    case 'commitToMovement': {
      // Committing a card is optional and worth +1, and only a card in hand may
      // be committed (§8.6); offer each legal commitment, or none.
      const events = getLegalCommitToMovementEvents(state);
      const movementCommitmentOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'commitToMovement',
        events,
      };
      return movementCommitmentOffer;
    }
    case 'chooseWhetherToRetreat': {
      // A defender faster than the engager, with a retreat to make, may fall
      // back instead of fighting (§6.3.2); offer the retreat-or-stand choices.
      const events = getLegalChooseWhetherToRetreatEvents(state);
      const fallBackOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'chooseWhetherToRetreat',
        events,
      };
      return fallBackOffer;
    }
    case 'commitToRangedAttack': {
      // Committing a card is optional and worth +1, and only a card in hand may
      // be committed (§8.6); offer each legal commitment, or none.
      const events = getLegalCommitToRangedAttackEvents(state);
      const attackCommitmentOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'commitToRangedAttack',
        events,
      };
      return attackCommitmentOffer;
    }
    case 'commitToRangedDefense': {
      // Committing a card is optional and worth +1, and only a card in hand may
      // be committed (§8.6); offer each legal commitment, or none.
      const events = getLegalCommitToRangedDefenseEvents(state);
      const defenceCommitmentOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'commitToRangedDefense',
        events,
      };
      return defenceCommitmentOffer;
    }
    case 'issueCommands': {
      // Offer the command to spend. Its allocations are too many to list
      // whole; ordering nobody is always open (§4.3.2–4.3.3).
      const issueCommands = getLegalIssueCommands(state);
      const ordersOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'issueCommands',
        issueCommands,
      };
      return ordersOffer;
    }
    case 'moveCommander': {
      // The first player moves their commander, then the second (§4.2.1);
      // offer where this commander may go. A fallen commander's turn is
      // passed over before this is asked (§4.2.8), so the commander must be
      // on the board, and its absence throws.
      const startingCoordinate = getCommanderSpace(player, state);
      // Every space within four steps it may reach from there (§4.2.2–4.2.5).
      const reachable = getLegalCommanderMoves(
        player,
        state,
        startingCoordinate,
      );
      // Where it may go is a set; the offer writes it down in board order,
      // which means nothing and only keeps it from following the walk.
      const destinations = listInBoardOrder(state.boardState, reachable);
      const commanderOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'moveCommander',
        destinations,
        startingCoordinate,
      };
      return commanderOffer;
    }
    case 'chooseMovingUnit': {
      // Each commanded unit is finished before the next begins (§4.3.9); offer
      // the units still able to move.
      const moveUnits = getLegalMoveUnits(state);
      const nextMoverOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'chooseMovingUnit',
        moveUnits,
      };
      return nextMoverOffer;
    }
    case 'moveUnit': {
      // A unit has been named and its card settled; offer every ending its move
      // may reach, the committed card counted.
      const movement = getMovementResolutionState(state);
      // The move sets off from where the unit stands, which the board holds.
      const movingUnit = getUnitWithPlacementOnBoard(
        state,
        movement.movingUnit,
      );
      // The card committed before the move, if any, adds to its Speed or
      // Flexibility (§4.3.10), and so to where the move can reach.
      const committed = modifiersFromCompletedCommitment(movement.commitment);
      const reachable = getLegalUnitMoves(movingUnit, state, committed);
      // The endings are a set; the offer writes them down in board order,
      // which means nothing and only keeps it from following the walk.
      const moves = listMovesInBoardOrder(state.boardState, reachable);
      const moveOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'moveUnit',
        movingUnit,
        moves,
      };
      return moveOffer;
    }
    case 'chooseShooter': {
      // A command may order several shooters, one shot at a time; offer the
      // units able to shoot.
      const rangedAttackers = getLegalRangedAttackers(state);
      const nextShooterOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'chooseShooter',
        rangedAttackers,
      };
      return nextShooterOffer;
    }
    case 'performRangedAttack': {
      // A shooter has been named and its card settled; offer every enemy it may
      // target, the committed card counted.
      const legal = getLegalShooterTargets(state);
      const targetOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'performRangedAttack',
        shooter: legal.shooter,
        targets: [...legal.targets],
      };
      return targetOffer;
    }
    case 'setupUnits': {
      // Each player places their whole army in their own zone, one unit per
      // space (§3.5.1); offer the units and spaces still open.
      const setupUnits = getLegalSetupUnits(state, player);
      const deploymentOffer: LegalPlayerChoiceOptions = {
        ...base,
        choiceType: 'setupUnits',
        setupUnits,
      };
      return deploymentOffer;
    }
    default: {
      // Every choice type but `chooseCard`, answered above, has a case, so
      // the type leaves nothing here.
      // TODO(wrong): this returns the unhandled choice type itself, a
      // string, as though it were an offer, where every other exhaustive
      // default in the domain throws (`applyPlayerChoiceEvent`,
      // `procedureRegistry`). A choice type added without a case would reach
      // a bot as a string. No spec can reach it, since the choice type is
      // read from the expected engine, not passed in. Settled by throwing
      // `Unknown player choice type`.
      const _exhaustive: never = expected.choiceType;
      return _exhaustive;
    }
  }
}

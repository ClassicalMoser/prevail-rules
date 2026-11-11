import type { Coordinate, PlayerSide, UnitWithPlacement } from '@entities';
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
  DoneIssuingCommandsEvent,
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
  getLegalDoneIssuingCommandsEvents,
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

/** Shared fields echoed from {@link getExpectedEvent} for actor presentation. */
interface LegalPlayerChoiceOptionsBase {
  playerSource: PlayerSource;
}

export type LegalPlayerChoiceOptions =
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'assignUnitSupport';
      assignUnitSupport: LegalAssignUnitSupport;
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'chooseCard';
      events: ChooseCardEvent[];
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'chooseMeleeResolution';
      events: ChooseMeleeResolutionEvent[];
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'chooseRally';
      events: ChooseRallyEvent[];
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'chooseRoutDiscard';
      routDiscard: LegalRoutDiscardCards;
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'chooseRetreatOption';
      events: ChooseRetreatOptionEvent[];
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'commitToMelee';
      events: CommitToMeleeEvent[];
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'commitToMovement';
      events: CommitToMovementEvent[];
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'chooseWhetherToRetreat';
      events: ChooseWhetherToRetreatEvent[];
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'commitToRangedAttack';
      events: CommitToRangedAttackEvent[];
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'commitToRangedDefense';
      events: CommitToRangedDefenseEvent[];
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'doneIssuingCommands';
      events: DoneIssuingCommandsEvent[];
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'issueCommand';
      /** True when the expectation also accepts stopping (forfeit leftover slots, §4.3.3). */
      canDoneIssuing: boolean;
      issueCommands: LegalIssueCommands;
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'moveCommander';
      startingCoordinate: Coordinate | null;
      destinations: Coordinate[];
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'chooseMovingUnit';
      moveUnits: LegalMoveUnits;
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'moveUnit';
      /** The unit whose move is being written; `null` if it cannot be read. */
      movingUnit: UnitWithPlacement | null;
      /**
       * Every legal ending of the move, each with a path to submit, priced
       * with the card committed for it (§4.3.10). Step-by-step offering is
       * `getLegalMoveDeltas`.
       */
      moves: MoveResult[];
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'chooseShooter';
      rangedAttackers: LegalRangedAttackers;
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'performRangedAttack';
      /** The unit whose shot is being aimed; `null` if it cannot be read. */
      shooter: UnitWithPlacement | null;
      /**
       * Every enemy it may target, with the card committed for the shot
       * counted (§4.3.11 steps 2–3). Supporters for a chosen target are
       * `getLegalRangedAttackSupporters`.
       */
      targets: UnitWithPlacement[];
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'setupUnits';
      setupUnits: LegalSetupUnits;
    });

/** No support is owed to any unit: the answer when nothing is awaiting assignment. */
function emptyAssignUnitSupport(player: PlayerSide): LegalAssignUnitSupport {
  return { categories: [], player };
}

/** The one player who chooses, or `null` when both choose at once and no single player is meant. */
function concretePlayer(playerSource: PlayerSource): PlayerSide | null {
  if (playerSource === 'bothPlayers') {
    return null;
  }
  return playerSource;
}

/** No orders are available to the player: the answer when no command can be given. */
function emptyIssueCommands(player: PlayerSide): LegalIssueCommands {
  return { commands: [], player };
}

/** No unit is able to move: the answer when none can be named to move. */
function emptyMoveUnits(player: PlayerSide): LegalMoveUnits {
  return { player, units: [] };
}

/** No unit can shoot: the answer when no shooter can be named. */
function emptyRangedAttackers(player: PlayerSide): LegalRangedAttackers {
  return { attackers: [], player };
}

/** No Morale is owed: the answer when no rout discard is due. */
function emptyRoutDiscard(player: PlayerSide): LegalRoutDiscardCards {
  return { cardIds: [], numberToDiscard: 0, player };
}

/** No unit or space is open for placement: the answer when setup has nothing to offer. */
function emptySetupUnits(player: PlayerSide): LegalSetupUnits {
  return { coordinates: [], player, units: [] };
}

/**
 * Presentation router for legal player-choice options.
 *
 * Uses {@link getExpectedEvent} for what/who, then packages the matching
 * `@legality` root atoms or event lists. Selection-dependent follow-ups
 * (destinations, targets, line ends, …) stay on their existing helpers.
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

  const base: LegalPlayerChoiceOptionsBase = {
    playerSource: expected.playerSource,
  };
  const player =
    concretePlayer(expected.playerSource) ?? state.currentInitiative;

  switch (expected.choiceType) {
    case 'assignUnitSupport': {
      // After a rally the player must give each unit a place in a pool of places
      // their hand's cards hold (§10.4.4); offer the pools and the units still
      // unplaced. Whatever is left over routs (§10.4.6).
      const assignUnitSupport =
        getLegalAssignUnitSupport(state) ?? emptyAssignUnitSupport(player);
      return {
        ...base,
        assignUnitSupport,
        choiceType: 'assignUnitSupport',
      };
    }
    case 'chooseCard': {
      // Both players choose a card from hand simultaneously and secretly
      // (§4.1.1); offer the cards each may still play.
      return {
        ...base,
        choiceType: 'chooseCard',
        events: getLegalChooseCardOptions(state),
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
      const routDiscard =
        getLegalRoutDiscardCards(state) ?? emptyRoutDiscard(player);
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
    case 'doneIssuingCommands': {
      // A player may stop issuing commands and forfeit the slots left; offer
      // that event.
      return {
        ...base,
        choiceType: 'doneIssuingCommands',
        events: getLegalDoneIssuingCommandsEvents(state) ?? [],
      };
    }
    case 'issueCommand': {
      // Issued commands are resolved one at a time, in any order the player
      // likes (§4.3.9); offer every order available now.
      const issueCommands =
        getLegalIssueCommands(state) ?? emptyIssueCommands(player);
      return {
        ...base,
        canDoneIssuing:
          expected.alsoAccepted?.includes('doneIssuingCommands') === true,
        choiceType: 'issueCommand',
        issueCommands,
      };
    }
    case 'moveCommander': {
      // The first player moves their commander, then the second (§4.2.1); offer
      // where this commander may go, or nothing if it is not on the board.
      const startingCoordinate =
        getCommanderSpace(player, state.boardState) ?? null;
      if (startingCoordinate === null) {
        return {
          ...base,
          choiceType: 'moveCommander',
          destinations: [],
          startingCoordinate: null,
        };
      }
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
      const moveUnits = getLegalMoveUnits(state) ?? emptyMoveUnits(player);
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
      const rangedAttackers =
        getLegalRangedAttackers(state) ?? emptyRangedAttackers(player);
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
        shooter: legal === null ? null : legal.shooter,
        targets: legal === null ? [] : [...legal.targets],
      };
    }
    case 'setupUnits': {
      // Each player places their whole army in their own zone, one unit per
      // space (§3.5.1); offer the units and spaces still open.
      const setupUnits =
        getLegalSetupUnits(state, player) ?? emptySetupUnits(player);
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

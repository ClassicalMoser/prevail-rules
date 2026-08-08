import type { Coordinate, PlayerSide } from '@entities';
import type {
  ChooseCardEvent,
  ChooseMeleeResolutionEvent,
  ChooseRallyEvent,
  ChooseRetreatOptionEvent,
  ChooseWhetherToRetreatEvent,
  CommitToMeleeEvent,
  CommitToMovementEvent,
  CommitToRangedAttackEvent,
  DoneIssuingCommandsEvent,
  PlayerSource,
} from '@events';
import { getExpectedEvent } from '@expected';
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
  getLegalCommanderMoves,
  getLegalDoneIssuingCommandsEvents,
  getLegalIssueCommands,
  getLegalMoveUnits,
  getLegalRangedAttackers,
  getLegalRoutDiscardCards,
  getLegalSetupUnits,
  getLegalUnitSupportGrants,
} from '@legality';
import type {
  LegalIssueCommands,
  LegalMoveUnits,
  LegalRangedAttackers,
  LegalRoutDiscardCards,
  LegalSetupUnits,
  LegalUnitSupportGrants,
} from '@legality';
import { getCommanderSpace } from '@queries';

/** Shared fields echoed from {@link getExpectedEvent} for actor presentation. */
interface LegalPlayerChoiceOptionsBase {
  playerSource: PlayerSource;
  expectedEventNumber: number;
}

export type LegalPlayerChoiceOptions =
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'assignUnitSupport';
      unitSupportGrants: LegalUnitSupportGrants;
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
      choiceType: 'doneIssuingCommands';
      events: DoneIssuingCommandsEvent[];
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'issueCommand';
      /** Always true while issueCommand is expected (forfeit leftover slots). */
      canDoneIssuing: boolean;
      issueCommands: LegalIssueCommands;
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'moveCommander';
      startingCoordinate: Coordinate | null;
      destinations: Coordinate[];
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'moveUnit';
      moveUnits: LegalMoveUnits;
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'performRangedAttack';
      rangedAttackers: LegalRangedAttackers;
    })
  | (LegalPlayerChoiceOptionsBase & {
      choiceType: 'setupUnits';
      setupUnits: LegalSetupUnits;
    });

function emptyUnitSupportGrants(player: PlayerSide): LegalUnitSupportGrants {
  return { grants: [], player };
}

function concretePlayer(playerSource: PlayerSource): PlayerSide | null {
  if (playerSource === 'bothPlayers') {
    return null;
  }
  return playerSource;
}

function emptyIssueCommands(player: PlayerSide): LegalIssueCommands {
  return { commands: [], player };
}

function emptyMoveUnits(player: PlayerSide): LegalMoveUnits {
  return { player, units: [] };
}

function emptyRangedAttackers(player: PlayerSide): LegalRangedAttackers {
  return { attackers: [], player };
}

function emptyRoutDiscard(player: PlayerSide): LegalRoutDiscardCards {
  return { cardIds: [], numberToDiscard: 0, player };
}

function emptySetupUnits(player: PlayerSide): LegalSetupUnits {
  return { coordinates: [], player, units: [] };
}

function softEvents<T>(enumerate: () => T[]): T[] {
  try {
    return enumerate();
  } catch {
    return [];
  }
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
 * Returns `null` when the next expected action is a game effect. Soft-empty
 * option payloads when enumerators return null/`[]` or throw (race / edge).
 */
export function getLegalPlayerChoiceOptions<S extends GameState>(
  state: S,
): LegalPlayerChoiceOptions | null {
  let expected;
  try {
    expected = getExpectedEvent(state);
  } catch {
    return null;
  }

  if (expected.actionType === 'gameEffect') {
    return null;
  }

  const base: LegalPlayerChoiceOptionsBase = {
    expectedEventNumber: expected.expectedEventNumber,
    playerSource: expected.playerSource,
  };
  const player =
    concretePlayer(expected.playerSource) ?? state.currentInitiative;

  switch (expected.choiceType) {
    case 'assignUnitSupport': {
      let unitSupportGrants: LegalUnitSupportGrants;
      try {
        unitSupportGrants =
          getLegalUnitSupportGrants(state) ?? emptyUnitSupportGrants(player);
      } catch {
        unitSupportGrants = emptyUnitSupportGrants(player);
      }
      return {
        ...base,
        choiceType: 'assignUnitSupport',
        unitSupportGrants,
      };
    }
    case 'chooseCard': {
      return {
        ...base,
        choiceType: 'chooseCard',
        events: softEvents(() => getLegalChooseCardOptions(state)),
      };
    }
    case 'chooseMeleeResolution': {
      return {
        ...base,
        choiceType: 'chooseMeleeResolution',
        events: softEvents(() => getLegalChooseMeleeResolutionEvents(state)),
      };
    }
    case 'chooseRally': {
      return {
        ...base,
        choiceType: 'chooseRally',
        events: softEvents(() => getLegalChooseRallyEvent(state)),
      };
    }
    case 'chooseRoutDiscard': {
      let routDiscard: LegalRoutDiscardCards;
      try {
        routDiscard =
          getLegalRoutDiscardCards(state) ?? emptyRoutDiscard(player);
      } catch {
        routDiscard = emptyRoutDiscard(player);
      }
      return {
        ...base,
        choiceType: 'chooseRoutDiscard',
        routDiscard,
      };
    }
    case 'chooseRetreatOption': {
      return {
        ...base,
        choiceType: 'chooseRetreatOption',
        events: softEvents(() => getLegalChooseRetreatOptionEvents(state)),
      };
    }
    case 'commitToMelee': {
      return {
        ...base,
        choiceType: 'commitToMelee',
        events: softEvents(() => getLegalCommitToMeleeEvents(state)),
      };
    }
    case 'commitToMovement': {
      return {
        ...base,
        choiceType: 'commitToMovement',
        events: softEvents(() => getLegalCommitToMovementEvents(state)),
      };
    }
    case 'chooseWhetherToRetreat': {
      return {
        ...base,
        choiceType: 'chooseWhetherToRetreat',
        events: softEvents(() => getLegalChooseWhetherToRetreatEvents(state)),
      };
    }
    case 'commitToRangedAttack': {
      return {
        ...base,
        choiceType: 'commitToRangedAttack',
        events: softEvents(() => getLegalCommitToRangedAttackEvents(state)),
      };
    }
    case 'doneIssuingCommands': {
      return {
        ...base,
        choiceType: 'doneIssuingCommands',
        events: softEvents(
          () => getLegalDoneIssuingCommandsEvents(state) ?? [],
        ),
      };
    }
    case 'issueCommand': {
      let issueCommands: LegalIssueCommands;
      try {
        issueCommands =
          getLegalIssueCommands(state) ?? emptyIssueCommands(player);
      } catch {
        issueCommands = emptyIssueCommands(player);
      }
      return {
        ...base,
        canDoneIssuing: true,
        choiceType: 'issueCommand',
        issueCommands,
      };
    }
    case 'moveCommander': {
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
      try {
        const destinations = [
          ...getLegalCommanderMoves(player, state, startingCoordinate),
        ];
        return {
          ...base,
          choiceType: 'moveCommander',
          destinations,
          startingCoordinate,
        };
      } catch {
        return {
          ...base,
          choiceType: 'moveCommander',
          destinations: [],
          startingCoordinate,
        };
      }
    }
    case 'moveUnit': {
      let moveUnits: LegalMoveUnits;
      try {
        moveUnits = getLegalMoveUnits(state) ?? emptyMoveUnits(player);
      } catch {
        moveUnits = emptyMoveUnits(player);
      }
      return {
        ...base,
        choiceType: 'moveUnit',
        moveUnits,
      };
    }
    case 'performRangedAttack': {
      let rangedAttackers: LegalRangedAttackers;
      try {
        rangedAttackers =
          getLegalRangedAttackers(state) ?? emptyRangedAttackers(player);
      } catch {
        rangedAttackers = emptyRangedAttackers(player);
      }
      return {
        ...base,
        choiceType: 'performRangedAttack',
        rangedAttackers,
      };
    }
    case 'setupUnits': {
      let setupUnits: LegalSetupUnits;
      try {
        setupUnits =
          getLegalSetupUnits(state, player) ?? emptySetupUnits(player);
      } catch {
        setupUnits = emptySetupUnits(player);
      }
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

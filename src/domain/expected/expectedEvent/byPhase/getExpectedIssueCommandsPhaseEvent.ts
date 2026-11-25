import type { PlayerSide } from '@entities';
import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { getLegalMoveUnits, getLegalRangedAttackers } from '@legality';
import {
  findCurrentCommandResolutionState,
  getCardInPlay,
  getIssueCommandsPhaseState,
  getOtherPlayer,
  getRemainingUnitsForPlayer,
} from '@queries';
import { getExpectedStartCommandResolutionEvent } from '../composable';
import { getExpectedCommandResolutionEvent } from '../iterated';

/**
 * When a shooter is to be chosen and none of the units still to act has a
 * legal target, expect `completeRangedAttackCommand`: those units are skipped
 * (§4.3.11 step 1) and the order ends, instead of stalling on `chooseShooter`.
 * A unit with no target now stays in the order while another may still shoot.
 */
function getExpectedRangedResolveStart(
  state: GameState,
  player: PlayerSide,
): ExpectedEventInfo {
  // The units of the order that may be named to shoot next: unengaged, with
  // Range, and with a target at their own Range (§4.3.11 step 1).
  const legal = getLegalRangedAttackers(state);

  // None of them can shoot, so the order ends with the shots it has had.
  if (legal.attackers.length === 0) {
    const endOrder: ExpectedEventInfo = {
      actionType: 'gameEffect',
      effectType: 'completeRangedAttackCommand',
    };
    return endOrder;
  }

  // Someone can shoot: the player names the next shooter.
  const nextShooter = getExpectedStartCommandResolutionEvent(state, player);
  return nextShooter;
}

/**
 * When resolving a movement command with remaining units but none that can
 * legally start a move (e.g. all engaged), expect `completeMovementCommand`
 * so apply can clear those units and advance instead of stalling on `moveUnit`.
 */
function getExpectedMovementResolveStart(
  state: GameState,
  player: PlayerSide,
): ExpectedEventInfo {
  // The units of the order that may be named to move next: on the board and
  // not locked in a fight (§6.1.2).
  const legal = getLegalMoveUnits(state);

  // None of them can move, so the order ends with the moves it has had.
  if (legal.units.length === 0) {
    const endOrder: ExpectedEventInfo = {
      actionType: 'gameEffect',
      effectType: 'completeMovementCommand',
    };
    return endOrder;
  }

  // Someone can move: the player names the next unit to move.
  const nextMover = getExpectedStartCommandResolutionEvent(state, player);
  return nextMover;
}

/**
 * On their issuing step the player is asked for their whole allocation at
 * once (§4.3). An allocation that orders nobody is always legal, so the
 * phase cannot stall even when no unit can be ordered.
 */
function getExpectedIssueStepEvent(player: PlayerSide): ExpectedEventInfo {
  const expected: ExpectedEventInfo = {
    actionType: 'playerChoice',
    choiceType: 'issueCommands',
    playerSource: player,
  };
  return expected;
}

/**
 * On their resolving step a player carries out the orders they issued, one
 * unit at a time, finishing each before the next begins (§4.3.9): a unit
 * already under way says what it owes next, and between units the next is
 * named, or the order ends.
 *
 * @param state - The game, on this player's resolve step
 * @param player - The player carrying out their orders
 * @returns What the unit under way owes, the naming of the next unit, or the
 * end of the order
 */
function getExpectedResolveStepEvent(
  state: GameState,
  player: PlayerSide,
): ExpectedEventInfo {
  // Check if there's an ongoing command resolution
  // A unit under way is finished before the next is named (§4.3.9), so what
  // it still owes comes first.
  const underWay = findCurrentCommandResolutionState(state);
  if (underWay !== undefined) {
    const unitUnderWay = getExpectedCommandResolutionEvent(
      state,
      underWay,
      player,
    );
    return unitUnderWay;
  }

  // The order is the card the player has in play: a Move or a Shoot (§4.3.1).
  const { command } = getCardInPlay(state.cardState, player);

  // No ongoing resolution - check if there are remaining units to resolve
  // Units the order named that have not yet moved or shot.
  // TODO(composition): this check repeats the start helpers. With no unit
  // still to act, `getLegalMoveUnits` and `getLegalRangedAttackers` list
  // nobody, so the helpers already answer the same completion effect as the
  // two returns below (the nightly mutation run cannot tell `> 0` from
  // `>= 0` here). Settle by asking the helpers on every pending step and
  // dropping the branch below, or by stating why the empty order is answered
  // without asking legality.
  const remainingUnits = getRemainingUnitsForPlayer(state, player);
  if (remainingUnits.length > 0) {
    // A Shoot order names its next shooter; a Move order its next mover.
    if (command.type === 'rangedAttack') {
      const nextShot = getExpectedRangedResolveStart(state, player);
      return nextShot;
    }
    const nextMove = getExpectedMovementResolveStart(state, player);
    return nextMove;
  }

  // Empty remaining after ranged resolve: advance via completeRangedAttackCommand
  // Every unit of the Shoot order has shot, so the order ends.
  if (command.type === 'rangedAttack') {
    const endShootOrder: ExpectedEventInfo = {
      actionType: 'gameEffect',
      effectType: 'completeRangedAttackCommand',
    };
    return endShootOrder;
  }

  // Empty remaining after movement resolve with no movers: complete command
  // A command is a Move or a Shoot, so this is a Move order whose every unit
  // has moved, and the order ends.
  const endMoveOrder: ExpectedEventInfo = {
    actionType: 'gameEffect',
    effectType: 'completeMovementCommand',
  };
  return endMoveOrder;
}

/**
 * Gets information about the expected event for the Issue Commands phase.
 *
 * Phase 3 (§4.3): the first player issues all their orders, then carries
 * them all out; then the second player does the same.
 *
 * @param state - The current game state with Issue Commands phase
 * @returns Information about what event is expected
 */
export function getExpectedIssueCommandsPhaseEvent(
  state: GameState,
): ExpectedEventInfo {
  // Asked only in Phase 3; any other phase throws in the getter.
  const phaseState = getIssueCommandsPhaseState(state);

  // The player who took the initiative in Phase 1 goes first (§4.1.5).
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  switch (phaseState.step) {
    case 'firstPlayerIssueCommands': {
      // The first player issues all their orders.
      const firstIssues = getExpectedIssueStepEvent(firstPlayer);
      return firstIssues;
    }

    case 'firstPlayerResolveCommands': {
      // Then carries them all out.
      const firstResolves = getExpectedResolveStepEvent(state, firstPlayer);
      return firstResolves;
    }

    case 'secondPlayerIssueCommands': {
      // Then the second player issues theirs.
      const secondIssues = getExpectedIssueStepEvent(secondPlayer);
      return secondIssues;
    }

    case 'secondPlayerResolveCommands': {
      // And carries them all out.
      const secondResolves = getExpectedResolveStepEvent(state, secondPlayer);
      return secondResolves;
    }

    case 'complete': {
      // Both players' orders are carried out, so the phase ends and the
      // melees are fought next (§4.4).
      const completePhase: ExpectedEventInfo = {
        actionType: 'gameEffect',
        effectType: 'completeIssueCommandsPhase',
      };
      return completePhase;
    }

    default: {
      // A step this phase does not have is a fault in the state.
      const _exhaustive: never = phaseState.step;
      throw new Error(`Invalid issueCommands phase state: ${_exhaustive}`);
    }
  }
}

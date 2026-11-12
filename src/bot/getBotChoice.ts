import type { PlayerSide } from '@entities';
import type { PlayerChoiceEvent } from '@events';
import type { GameState } from '@game';
import type { RandomSource } from '@utils';
import type { BotContext } from './decisions/botContext';
import type { BotTemperament } from './temperament';
import { getRemainingUnitsForPlayer } from '@queries';
import { getLegalPlayerChoiceOptions } from '@validation';
import { surveyBattlefield } from './appraisal';
import {
  chooseCommanderMove,
  chooseCommitment,
  chooseMovingUnit,
  chooseNextFight,
  chooseOrder,
  choosePlayCard,
  chooseRally,
  chooseRetreatOption,
  chooseRoutDiscard,
  chooseSetup,
  chooseShooter,
  chooseShotTarget,
  chooseUnitMove,
  chooseUnitSupport,
  chooseWhetherToRetreat,
  meleeCommitmentGain,
  movementCommitmentGain,
  rangedAttackCommitmentGain,
  rangedDefenseCommitmentGain,
} from './decisions';

/**
 * The choice a bot makes for its seat. A bot is asked only for a choice its
 * seat owes: being asked when the game is over, when the game owes an
 * effect, when it is the other side's turn, or for a card already laid down,
 * is the caller's mistake, and it throws rather than answering nothing.
 *
 * The bot is given only what its seat may see. The board is public; the
 * opponent's hand is not, and a bot that could read it would play a game no
 * human could. Every choice is drawn from what the rules offer that seat
 * (`getLegalPlayerChoiceOptions`), so a bot cannot make an illegal choice:
 * one the rules refuse is a fault in the rules, not in the bot.
 *
 * This only dispatches: each kind of choice has its own decision.
 *
 * @param view - The game as the bot's seat sees it
 * @param seat - The side the bot plays
 * @param temperament - How it leans when the rules leave it a choice
 * @param random - Where its whims are drawn from
 * @returns Its choice
 * @throws When its seat owes no choice
 */
export function getBotChoice(
  view: GameState,
  seat: PlayerSide,
  temperament: BotTemperament,
  random: RandomSource,
): PlayerChoiceEvent {
  const options = getLegalPlayerChoiceOptions(view);
  if (options === null) {
    throw new Error(`${seat} was asked for a choice when none is owed`);
  }
  if (options.playerSource !== 'bothPlayers' && options.playerSource !== seat) {
    throw new Error(
      `${seat} was asked for ${options.choiceType}, which ${options.playerSource} owes`,
    );
  }
  // While an order is being carried out, some units have still to move.
  const movingNow =
    options.choiceType === 'chooseMovingUnit' ||
    options.choiceType === 'commitToMovement' ||
    options.choiceType === 'moveUnit';
  const stillToMove = movingNow ? getRemainingUnitsForPlayer(view, seat) : [];
  const context: BotContext = {
    random,
    seat,
    survey: surveyBattlefield(view, seat, stillToMove),
    temperament,
    view,
  };
  switch (options.choiceType) {
    case 'assignUnitSupport': {
      return chooseUnitSupport(options.assignUnitSupport, context);
    }
    case 'chooseCard': {
      // Both sides choose at once; a seat is offered only its own hand, and
      // nothing once its card is down.
      if (options.events.length === 0) {
        throw new Error(
          `${seat} was asked for a card it has already laid down`,
        );
      }
      return choosePlayCard(options.events, context);
    }
    case 'chooseMeleeResolution': {
      return chooseNextFight(options.events, context);
    }
    case 'chooseMovingUnit': {
      return chooseMovingUnit(options.moveUnits, context);
    }
    case 'chooseRally': {
      return chooseRally(options.events, context);
    }
    case 'chooseRetreatOption': {
      return chooseRetreatOption(options.events, context);
    }
    case 'chooseRoutDiscard': {
      return chooseRoutDiscard(options.routDiscard, context);
    }
    case 'chooseShooter': {
      return chooseShooter(options.rangedAttackers, context);
    }
    case 'chooseWhetherToRetreat': {
      return chooseWhetherToRetreat(options.events, context);
    }
    case 'commitToMelee': {
      return chooseCommitment(
        options.events,
        meleeCommitmentGain(context),
        context,
      );
    }
    case 'commitToMovement': {
      return chooseCommitment(
        options.events,
        movementCommitmentGain(context),
        context,
      );
    }
    case 'commitToRangedAttack': {
      return chooseCommitment(
        options.events,
        rangedAttackCommitmentGain(context),
        context,
      );
    }
    case 'commitToRangedDefense': {
      return chooseCommitment(
        options.events,
        rangedDefenseCommitmentGain(context),
        context,
      );
    }
    case 'doneIssuingCommands': {
      // No order is left that anyone could be given; stopping is all there is.
      const [done] = options.events;
      if (done === undefined) {
        throw new Error(
          `${seat} was asked to stop giving orders and offered nothing`,
        );
      }
      return done;
    }
    case 'issueCommand': {
      return chooseOrder(
        options.issueCommands,
        options.canDoneIssuing,
        context,
      );
    }
    case 'moveCommander': {
      if (options.startingCoordinate === null) {
        throw new Error(
          `${seat} was asked to move a general that is not on the board`,
        );
      }
      return chooseCommanderMove(
        options.startingCoordinate,
        options.destinations,
        context,
      );
    }
    case 'moveUnit': {
      return chooseUnitMove(options.movingUnit, options.moves, context);
    }
    case 'performRangedAttack': {
      return chooseShotTarget(options.shooter, options.targets, context);
    }
    case 'setupUnits': {
      return chooseSetup(options.setupUnits, context);
    }
    default: {
      const _exhaustive: never = options;
      throw new Error(`Unhandled choice: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

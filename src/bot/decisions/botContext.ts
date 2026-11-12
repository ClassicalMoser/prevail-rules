import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import type { RandomSource } from '@utils';
import type { BattlefieldSurvey } from '@bot/appraisal';
import type { BotTemperament } from '@bot/temperament';

/**
 * Everything a bot decides from: the game as its seat sees it, which side it
 * plays, how it leans, where it draws its whims from, and a survey of the
 * board taken once for the decision.
 */
export interface BotContext {
  /** The game as the bot's seat sees it; the opponent's hand is hidden. */
  view: GameState;
  /** The side the bot plays. */
  seat: PlayerSide;
  /** How it leans when the rules leave it a choice. */
  temperament: BotTemperament;
  /** Where its whims are drawn from. */
  random: RandomSource;
  /** Where everything stands on the board. */
  survey: BattlefieldSurvey;
}

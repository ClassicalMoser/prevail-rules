import type { CommandCard, PlayerSide } from '@entities';
import type { GameState } from '@game';
import type { BotTemperament } from '@bot/temperament';
import {
  getLegalRangedAttackTargets,
  getLegalUnitsForIssueCommand,
} from '@legality';

/** Points for each unit a card's command could order this round. */
const POINTS_PER_ORDERED_UNIT = 2;

/** Points for each step of initiative below the highest (§4.1.2). */
const POINTS_PER_INITIATIVE_STEP = 0.75;

/** The highest initiative a card prints; lower goes first. */
const HIGHEST_INITIATIVE = 4;

/** How many units a line order may move at once (§4.3.5). */
const UNITS_PER_LINE = 8;

/**
 * What a card is worth to keep in hand. A hand holds the army together at a
 * rally, each card steadying as many units as its unit support counts
 * (§10.4), so a card that steadies more is the one to hold on to. A card
 * that wins initiative is worth holding too.
 *
 * @param card - The card
 * @returns Higher is a card more worth keeping
 */
export function appraiseKeeping(card: CommandCard): number {
  const steadies = card.unitSupport.count;
  const initiative =
    (HIGHEST_INITIATIVE - card.initiative) * POINTS_PER_INITIATIVE_STEP;
  return steadies + initiative;
}

/**
 * What a card would do if played this round: how many units its command
 * could reach now, and whether it would win the initiative. A move order
 * counts every unit it could move; a shoot order counts only units with
 * something to shoot at. Units are counted where they stand and against the
 * general where it stands, before the general moves (§4.2), so this is the
 * bot's estimate, not a promise.
 *
 * @param view - The game as the bot sees it
 * @param seat - The side the bot plays
 * @param card - The card it might play
 * @param temperament - How much it wants to be ordering its army forward
 * @returns Higher is a card more worth playing now
 */
export function appraisePlaying(
  view: GameState,
  seat: PlayerSide,
  card: CommandCard,
  temperament: BotTemperament,
): number {
  const { command } = card;
  const eligible = getLegalUnitsForIssueCommand(command, seat, view);
  // A shoot order is worth only the units that would have a target.
  const useful =
    command.type === 'rangedAttack'
      ? eligible.filter(
          (unit) => getLegalRangedAttackTargets(unit, view).length > 0,
        )
      : eligible;
  // An order reaches at most its number of units, or of lines.
  const reach =
    command.size === 'lines' ? command.number * UNITS_PER_LINE : command.number;
  const ordered = Math.min(useful.length, reach);
  // Movement is what closes with the enemy; an aggressive bot wants it more.
  const orderWeight =
    command.type === 'movement'
      ? POINTS_PER_ORDERED_UNIT * (0.5 + temperament.aggression)
      : POINTS_PER_ORDERED_UNIT * 1.5;
  const initiative =
    (HIGHEST_INITIATIVE - card.initiative) * POINTS_PER_INITIATIVE_STEP;
  return ordered * orderWeight + initiative;
}

/**
 * The card a bot plays from hand: the one most worth playing now, less a
 * share of what it is worth to keep. A thrifty bot spends its weak cards and
 * holds its strong ones, since every card it plays waits on the played pile
 * until a rally brings it back (§4.5).
 *
 * @param view - The game as the bot sees it
 * @param seat - The side the bot plays
 * @param card - The card it might play
 * @param temperament - How tightly it holds its hand
 * @returns Higher is the better card to play
 */
export function appraiseCard(
  view: GameState,
  seat: PlayerSide,
  card: CommandCard,
  temperament: BotTemperament,
): number {
  const playing = appraisePlaying(view, seat, card, temperament);
  const keeping = appraiseKeeping(card);
  return playing - temperament.thrift * keeping;
}

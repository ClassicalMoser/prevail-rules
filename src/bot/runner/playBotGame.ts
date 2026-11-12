import type { Army, GameModeName, PlayerSide } from '@entities';
import type { Event } from '@events';
import type { RandomSource } from '@utils';
import type { AuthoritativeGameState, GameState } from '@game';
import type { BotTemperament } from '@bot/temperament';
import { findExpectedEvent } from '@expected';
import { createInitialGameState } from '@factories';
import { generateEventFromProcedure } from '@procedures';
import {
  findGameOverWinner,
  findWinnerFromEmptyHands,
  findWinnerFromNoUnits,
  findWinnerFromUnpayableRoutDiscard,
} from '@queries';
import { applyEvent, projectGameStateForVisibility } from '@transforms';
import { getLegalPlayerChoiceOptions, validatePlayerChoice } from '@validation';
import { getBotChoice } from '@bot/getBotChoice';
import { createSeededRandom } from './createSeededRandom';

/** A game that has run this many events without ending is cut off. */
const MOST_EVENTS = 20_000;

/** One bot game to play: the battle, the two bots, and the seed. */
export interface BotGameSetup {
  /** The mode, which sets the board. */
  gameMode: GameModeName;
  /** The armies each side brings. */
  whiteArmy: Army;
  blackArmy: Army;
  /** How each side's bot leans. */
  whiteTemperament: BotTemperament;
  blackTemperament: BotTemperament;
  /** The seed every draw in the game comes from. */
  seed: number;
}

/** How one bot game went. */
export interface BotGameRecord {
  /** The seed it was played from; the same setup and seed replay it. */
  seed: number;
  /**
   * How it ended. `finished` is a game over by the rules (§11). `fault` is
   * a bot choice the rules refused, which points at the rules' offers rather
   * than the bot. `cutOff` ran past the event limit.
   */
  ending: 'finished' | 'fault' | 'cutOff';
  /** The side that prevailed, when the game finished with a winner. */
  winner: PlayerSide | undefined;
  /** The round it ended in. */
  rounds: number;
  /** How many events it took. */
  events: number;
  /** How long it took to play, in milliseconds. */
  durationMs: number;
  /** What went wrong, for a fault. */
  fault: string | undefined;
  /**
   * How often each kind of event happened, by choice or effect type: how
   * many engagements, melees, retreats and routs the game saw, which is the
   * plainest picture of how the bots played.
   */
  eventCounts: Record<string, number>;
  /** Time spent on each kind of bot decision, in milliseconds. */
  decisionMs: Record<string, number>;
  /**
   * Why the game ended (§11): a hand ran out, a rout could not be paid, or
   * an army was gone. Undefined for a game that did not finish.
   */
  endedBy: 'emptyHand' | 'unpayableRout' | 'noUnits' | undefined;
  /** How many rounds each side played as first player (§4.1.5). */
  roundsFirst: Record<PlayerSide, number>;
  /**
   * The round of each rally each side made, in order (§10). How soon the
   * first comes and how quickly the rest follow is the rhythm of a battle
   * wearing down.
   */
  rallyRounds: Record<PlayerSide, number[]>;
  /**
   * Where each side's cards were when the game ended: still in hand, played
   * and waiting to be rallied back, discarded (paid for routs, §8), or
   * burnt (one for each rally, §10.3.2). A hand is an army's will to fight,
   * so this is where that will went.
   */
  finalCards: Record<PlayerSide, CardTally>;
}

/** How many of one side's cards are in each place. */
export interface CardTally {
  inHand: number;
  played: number;
  discarded: number;
  burnt: number;
}

/** Counts where one side's cards are. */
function tallyCards(state: GameState, side: PlayerSide): CardTally {
  const cards = state.cardState[side];
  const tally: CardTally = {
    burnt: cards.burnt.length,
    discarded: cards.discarded.length,
    inHand: cards.inHand.length,
    played: cards.played.length,
  };
  return tally;
}

/** Which of the ways a game ends (§11) ended this one. */
function findEnding(state: GameState): BotGameRecord['endedBy'] {
  if (findWinnerFromEmptyHands(state) !== undefined) {
    return 'emptyHand';
  }
  if (findWinnerFromUnpayableRoutDiscard(state) !== undefined) {
    return 'unpayableRout';
  }
  if (findWinnerFromNoUnits(state) !== undefined) {
    return 'noUnits';
  }
  return undefined;
}

/** A bot in its seat: how it leans and where its whims come from. */
interface SeatedBot {
  temperament: BotTemperament;
  random: RandomSource;
}

/**
 * The seat that owes the choice now. Usually the expected engine names it.
 * When both choose at once (§4.1.1), the seat still holding its card owes
 * it, and the full state shows whose card is not yet down.
 */
function getOwingSeat(
  state: AuthoritativeGameState,
  playerSource: PlayerSide | 'bothPlayers',
): PlayerSide {
  if (playerSource !== 'bothPlayers') {
    return playerSource;
  }
  const options = getLegalPlayerChoiceOptions(state);
  if (options?.choiceType !== 'chooseCard') {
    throw new Error('Both players owe a choice, and it is not their cards');
  }
  const [first] = options.events;
  if (first === undefined) {
    throw new Error('Both players owe a card, and neither has one to lay');
  }
  return first.player;
}

/**
 * Plays one game between two bots, from setup to the end, through the same
 * engines a real game runs on: the expected engine says what is owed, a
 * procedure builds each effect, each bot chooses from its own seat's view,
 * every choice is validated against the full state before it is applied, and
 * applying an event gives the next state.
 *
 * This is a harness for watching bots play, not part of how a real game is
 * run; a real game goes through `@application`, which stores and broadcasts.
 *
 * @param setup - The battle, the bots and the seed
 * @returns How the game went
 */
export function playBotGame(setup: BotGameSetup): BotGameRecord {
  const started = performance.now();
  // Separate streams for the game's dice and each bot's whims, so changing
  // one bot's temperament does not change the dice the other side sees.
  const dice = createSeededRandom(setup.seed);
  const bots: Record<PlayerSide, SeatedBot> = {
    black: {
      random: createSeededRandom(setup.seed * 2 + 1),
      temperament: setup.blackTemperament,
    },
    white: {
      random: createSeededRandom(setup.seed * 2 + 2),
      temperament: setup.whiteTemperament,
    },
  };
  let state: AuthoritativeGameState = createInitialGameState({
    blackArmy: setup.blackArmy,
    gameMode: setup.gameMode,
    whiteArmy: setup.whiteArmy,
  });
  let events = 0;
  const eventCounts: Record<string, number> = {};
  const decisionMs: Record<string, number> = {};
  const roundsFirst: Record<PlayerSide, number> = { black: 0, white: 0 };
  const rallyRounds: Record<PlayerSide, number[]> = { black: [], white: [] };
  let ending: BotGameRecord['ending'] = 'cutOff';
  let fault: string | undefined;
  while (events < MOST_EVENTS) {
    const expected = findExpectedEvent(state);
    // Nothing more is owed: the game is over.
    if (expected === undefined) {
      ending = 'finished';
      break;
    }
    let event: Event;
    if (expected.actionType === 'gameEffect') {
      event = generateEventFromProcedure(state, expected.effectType, dice);
    } else {
      const asked = performance.now();
      // The seat that owes the choice decides, seeing only its own view.
      const seat = getOwingSeat(state, expected.playerSource);
      const view = projectGameStateForVisibility(
        state,
        seat === 'white' ? 'whiteSeen' : 'blackSeen',
      );
      const choice = getBotChoice(
        view,
        seat,
        bots[seat].temperament,
        bots[seat].random,
      );
      decisionMs[expected.choiceType] =
        (decisionMs[expected.choiceType] ?? 0) + performance.now() - asked;
      const validation = validatePlayerChoice(choice, state);
      if (!validation.result) {
        ending = 'fault';
        fault = `${choice.choiceType} refused: ${validation.errorReason}`;
        break;
      }
      event = choice;
    }
    const kind =
      event.eventType === 'playerChoice' ? event.choiceType : event.effectType;
    eventCounts[kind] = (eventCounts[kind] ?? 0) + 1;
    // A rally is made when it resolves, in the round it resolves in.
    if (
      event.eventType === 'gameEffect' &&
      event.effectType === 'resolveRally'
    ) {
      rallyRounds[event.player].push(state.currentRoundState.roundNumber);
    }
    // Each round's first player is known once initiative is resolved.
    if (kind === 'resolveInitiative') {
      state = applyEvent(event, state);
      roundsFirst[state.currentInitiative] += 1;
      events += 1;
      continue;
    }
    state = applyEvent(event, state);
    events += 1;
  }
  const record: BotGameRecord = {
    decisionMs,
    durationMs: performance.now() - started,
    ending,
    endedBy: ending === 'finished' ? findEnding(state) : undefined,
    eventCounts,
    events,
    fault,
    finalCards: {
      black: tallyCards(state, 'black'),
      white: tallyCards(state, 'white'),
    },
    rallyRounds,
    rounds: state.currentRoundState.roundNumber,
    roundsFirst,
    seed: setup.seed,
    winner: ending === 'finished' ? findGameOverWinner(state) : undefined,
  };
  return record;
}

import type { EnginePorts, GameStateChange } from '@application/ports';
import type { Event } from '@events';
import type { AuthoritativeGameState, Game } from '@game';
import { createInMemoryEnginePorts } from '@application/infra';
import { findExpectedEvent } from '@expected';
import { createEmptyGameState } from '@factories';
import { PLAY_CARDS_PHASE } from '@game';
import {
  blackMiniStarterArmy,
  tempCommandCards,
  whiteMiniStarterArmy,
} from '@sampleValues';
import { updateCardState } from '@testing';
import { updatePhaseState } from '@transforms';
import { throwIfUndefined } from '@utils';
import { advanceEffects } from './advanceEffects';

const gameId = 'game-1';

/** A stored game holding the given state; its players and armies don't matter here. */
function gameWith(gameState: AuthoritativeGameState): Game {
  const game: Game = {
    blackArmy: blackMiniStarterArmy,
    blackPlayer: '22222222-2222-4222-8222-222222222222',
    gameMode: 'standard',
    gameState,
    id: gameId,
    whiteArmy: whiteMiniStarterArmy,
    whitePlayer: '33333333-3333-4333-8333-333333333333',
  };
  return game;
}

/**
 * In-memory ports holding a game in the given state, with its round's stream
 * open, and a subscriber that keeps every change it is told of.
 */
async function portsHolding(
  state: AuthoritativeGameState,
  changes: GameStateChange[],
): Promise<EnginePorts> {
  const ports = createInMemoryEnginePorts({
    gameStateSubscribers: [
      {
        gameId,
        gameMode: 'standard',
        onError: (error) => {
          throw error;
        },
        onGameStateChange: (change) => {
          changes.push(change);
        },
      },
    ],
  });

  // The game is stored and its current round's stream is open, as a game in
  // play would be.
  await ports.gameStorage.saveNewGame(gameWith(state));
  await ports.eventStreamStorage.newEventStream(
    gameId,
    state.currentRoundState.roundNumber,
  );
  return ports;
}

/** The kinds of effect a round's stream holds, in order. */
async function effectsRecorded(
  ports: EnginePorts,
  roundNumber: number,
): Promise<string[]> {
  const stream = await ports.eventStreamStorage.getEventStream(
    gameId,
    roundNumber,
  );

  // Only the effects matter here; a stream that will not read is a failure.
  const events: readonly Event[] =
    stream.result && stream.data !== undefined ? stream.data : [];
  const kinds = events.map((event) =>
    event.eventType === 'gameEffect' ? event.effectType : event.choiceType,
  );
  return kinds;
}

/**
 * The game carries out every effect it owes, one after another, recording and
 * storing each, and stops when it owes a player's choice or nothing at all.
 */
describe('advanceEffects function', () => {
  it('answers that the game is over, without throwing, when it has already finished', async () => {
    // A game Black has already won.
    const finished = {
      ...createEmptyGameState('standard'),
      winner: 'black' as const,
    };
    const changes: GameStateChange[] = [];
    const ports = await portsHolding(finished, changes);

    const result = await advanceEffects(gameId, 'standard', finished, ports);

    // A finished game owes nothing, which is an answer, not a fault.
    expect(result).toStrictEqual({
      errorReason: 'The game is already over',
      result: false,
    });

    // Nothing was carried out, recorded or announced.
    await expect(effectsRecorded(ports, 0)).resolves.toStrictEqual([]);
    expect(changes).toStrictEqual([]);
  });

  it('stops once the game is over, because a finished game owes nothing', async () => {
    // White's hand is empty while Black still holds a card, so the game owes
    // its ending, and Black has won it (§11.1).
    const initial = createEmptyGameState('standard');
    const withEmptyWhite = updateCardState(initial, {
      ...initial.cardState,
      black: { ...initial.cardState.black, inHand: [tempCommandCards[0]] },
      white: { ...initial.cardState.white, inHand: [] },
    });
    const changes: GameStateChange[] = [];
    const ports = await portsHolding(withEmptyWhite, changes);

    const result = await advanceEffects(
      gameId,
      'standard',
      withEmptyWhite,
      ports,
    );

    // The ending was carried out, and then nothing more was owed.
    expect(result).toStrictEqual({ data: undefined, result: true });

    // One effect was recorded: the ending.
    await expect(effectsRecorded(ports, 0)).resolves.toStrictEqual([
      'gameOver',
    ]);

    // The subscriber was told once, of a game Black has won.
    expect(changes.map((change) => change.gameState.winner)).toStrictEqual([
      'black',
    ]);
  });

  it('carries out effects one after another until a player owes a choice', async () => {
    // Both cards are laid face down, each side still holding another, so the
    // game owes the reveal and what follows from it.
    const base = createEmptyGameState('standard');
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        awaitingPlay: tempCommandCards[0],
        inHand: [tempCommandCards[2]],
      },
      white: {
        ...base.cardState.white,
        awaitingPlay: tempCommandCards[1],
        inHand: [tempCommandCards[3]],
      },
    });
    const revealing = updatePhaseState(withCards, {
      phase: PLAY_CARDS_PHASE,
      step: 'revealCards',
    });
    const changes: GameStateChange[] = [];
    const ports = await portsHolding(revealing, changes);

    const result = await advanceEffects(gameId, 'standard', revealing, ports);
    expect(result).toStrictEqual({ data: undefined, result: true });

    // The reveal, then initiative, then the end of the play-cards phase, each
    // recorded in turn.
    await expect(effectsRecorded(ports, 0)).resolves.toStrictEqual([
      'revealCards',
      'resolveInitiative',
      'completePlayCardsPhase',
    ]);

    // The subscriber was told of each, and the last state it saw owes a
    // player's choice: the first player moves their general.
    expect(changes).toHaveLength(3);
    const last = throwIfUndefined(changes.at(-1), 'No change was announced');
    expect(findExpectedEvent(last.gameState)).toMatchObject({
      actionType: 'playerChoice',
      choiceType: 'moveCommander',
    });
  });
});

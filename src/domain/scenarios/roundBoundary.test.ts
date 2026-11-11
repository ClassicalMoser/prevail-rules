import type { AuthoritativeGameState } from '@game';
import {
  createChooseCardEvent,
  createInitialGameState,
  createSetupUnitsEvent,
} from '@factories';
import { getLegalSetupUnits } from '@legality';
import { blackMiniStarterArmy, whiteMiniStarterArmy } from '@sampleValues';
import { throwIfUndefined } from '@utils';
import { validatePlayerChoice } from '@validation';
import { generateEventFromProcedure } from '@procedures';
import { getExpectedEvent } from '@expected';
import { createCleanupPhaseState, createPlayableGame } from '@testing';
import { applyEvent, updatePhaseState } from '@transforms';
import { getOwnedPlayerCardState } from '@queries';

/**
 * Where one round ends and the next begins (§4.5.4). A round's log holds the
 * events of that round and no others, because the position in the log is the
 * cursor for replay and undo: the event that ends a round belongs to the
 * round it ends, and the new round's log starts empty.
 *
 * Each army has one unit; the game is at the last step of Cleanup, with the
 * end of the round the only thing it owes.
 */
function atTheEndOfCleanup() {
  const game = createPlayableGame(
    [
      { coord: 'A-1', facing: 'south', player: 'white' },
      { coord: 'I-9', facing: 'north', player: 'black' },
    ],
    { initiative: 'white' },
  );
  return updatePhaseState(game, createCleanupPhaseState({ step: 'complete' }));
}

describe('the end of a round', () => {
  it('starts the next round with an empty log', () => {
    const start = atTheEndOfCleanup();
    const expected = getExpectedEvent(start);
    // The game owes the effect that ends the round, and nothing else.
    expect(expected).toMatchObject({ effectType: 'roundEnd' });
    if (expected.actionType !== 'gameEffect') {
      throw new Error('the end of the round is an effect the game owes');
    }

    // The ending is built by its procedure and applied, as the engines do.
    const ending = generateEventFromProcedure(start, expected.effectType, {
      nextFloat: () => 0,
    });
    const next = applyEvent(ending, start);

    // The round has turned over, and the new round has seen no event yet:
    // the one that ended the last round is not the first of this one.
    expect(next.currentRoundState.roundNumber).toBe(
      start.currentRoundState.roundNumber + 1,
    );
    expect(next.currentRoundState.events).toStrictEqual([]);
  });

  it('records the first event of the next round as its first', () => {
    const start = atTheEndOfCleanup();
    const expected = getExpectedEvent(start);
    if (expected.actionType !== 'gameEffect') {
      throw new Error('the end of the round is an effect the game owes');
    }
    const next = applyEvent(
      generateEventFromProcedure(start, expected.effectType, {
        nextFloat: () => 0,
      }),
      start,
    );

    // White chooses a card face down, the first thing the new round asks.
    const [card] = getOwnedPlayerCardState(next.cardState, 'white').inHand;
    const choice = createChooseCardEvent({ card, player: 'white' });
    const afterChoice = applyEvent(choice, next);

    // The log now holds that choice and only that choice.
    expect(afterChoice.currentRoundState.events).toStrictEqual([choice]);
  });
});

/**
 * Round 0 is setup (§3.5): White, holding the initiative, places its whole
 * army, then Black does, each legally, and then the round ends and round 1
 * begins. Played through the engines from a new game with the mini starter
 * armies, each unit placed on the first empty space of its own zone.
 */
describe('round 0', () => {
  /** The side expected to set up places its whole reserve, in zone order. */
  function setsUp(state: AuthoritativeGameState): AuthoritativeGameState {
    const expected = getExpectedEvent(state);
    if (
      expected.actionType !== 'playerChoice' ||
      expected.choiceType !== 'setupUnits'
    ) {
      throw new Error('a side should be asked to set up');
    }
    const player = expected.playerSource;
    if (player !== 'white' && player !== 'black') {
      throw new Error('setup is a side’s choice');
    }
    const legal = getLegalSetupUnits(state, player);
    if (legal === null) {
      throw new Error('the side should have units to place');
    }
    const facing = player === 'white' ? 'south' : 'north';
    const unitPlacements = legal.units.map((unit, index) => ({
      placement: {
        coordinate: throwIfUndefined(legal.coordinates[index], 'a space'),
        facing,
      } as const,
      unit,
    }));
    const event = createSetupUnitsEvent({
      commanderCoordinate: throwIfUndefined(legal.coordinates[0], 'a space'),
      player,
      unitPlacements,
    });
    // Each setup is legal: every reserved unit once, in its own zone.
    expect(validatePlayerChoice(event, state)).toStrictEqual({ result: true });
    return applyEvent(event, state);
  }

  it('sets up White, then Black, then ends the round into round 1 with an empty log', () => {
    const game = createInitialGameState({
      blackArmy: blackMiniStarterArmy,
      gameMode: 'mini',
      whiteArmy: whiteMiniStarterArmy,
    });

    // White holds the initiative, so White sets up first.
    expect(getExpectedEvent(game)).toMatchObject({
      choiceType: 'setupUnits',
      playerSource: 'white',
    });
    const whitePlaced = setsUp(game);
    // Then Black.
    expect(getExpectedEvent(whitePlaced)).toMatchObject({
      choiceType: 'setupUnits',
      playerSource: 'black',
    });
    const bothPlaced = setsUp(whitePlaced);
    // Setup is still round 0 until the round ends.
    expect(bothPlaced.currentRoundState.roundNumber).toBe(0);
    expect(bothPlaced.reservedUnits).toStrictEqual([]);

    // With both armies placed, the game owes the end of round 0.
    const expected = getExpectedEvent(bothPlaced);
    expect(expected).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'roundEnd',
    });
    if (expected.actionType !== 'gameEffect') {
      throw new Error('the end of the round is an effect the game owes');
    }
    const ending = generateEventFromProcedure(bothPlaced, expected.effectType, {
      nextFloat: () => 0,
    });
    const roundOne = applyEvent(ending, bothPlaced);

    // Round 1 begins with cards to choose, and its log is empty.
    expect(roundOne.currentRoundState.roundNumber).toBe(1);
    expect(roundOne.currentRoundState.currentPhaseState).toStrictEqual({
      phase: 'playCards',
      step: 'chooseCards',
    });
    expect(roundOne.currentRoundState.events).toStrictEqual([]);
  });
});

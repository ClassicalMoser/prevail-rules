import {
  createChooseCardEvent,
  createEmptyGameState,
  createSetupUnitsEvent,
} from '@factories';
import { generateEventFromProcedure } from '@procedures';
import { getExpectedEvent } from '@expected';
import {
  createCleanupPhaseState,
  createPlayableGame,
  createUnitWithPlacement,
} from '@testing';
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
 * Where setup ends and the first round begins. Setup is round 0, with its own
 * events; the setup that places the last reserved unit belongs to it, so the
 * first round's log starts empty, as every round's does.
 */
describe('the end of setup', () => {
  it('starts round 1 with an empty log, the last setup event having belonged to round 0', () => {
    const placed = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const setup = {
      ...createEmptyGameState('standard'),
      reservedUnits: [placed.unit],
    };

    const started = applyEvent(
      createSetupUnitsEvent({
        commanderCoordinate: 'E-5',
        player: 'black',
        unitPlacements: [placed],
      }),
      setup,
    );

    // Round 1 has begun: the first phase is waiting for cards.
    expect(started.currentRoundState.currentPhaseState).toStrictEqual({
      phase: 'playCards',
      step: 'chooseCards',
    });
    // Its log holds no event, since the setup that started it was round 0's.
    expect(started.currentRoundState.events).toStrictEqual([]);
  });
});

import {
  createEmptyGameState,
  createOpenedRallyResolutionState,
} from '@factories';
import { createCleanupPhaseState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getExpectedCleanupPhaseEvent } from './getExpectedCleanupPhaseEvent';

/**
 * Phase 5 (§4.5): the cards in play go to the played piles, then the first
 * player decides whether to rally and carries it out, then the second does
 * the same, and the round ends. White holds the initiative, as a new game
 * starts, unless a case says otherwise.
 */
describe('getExpectedCleanupPhaseEvent function', () => {
  it('sends the cards in play to the played piles first', () => {
    // Cleanup has just begun.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createCleanupPhaseState({ step: 'cardsLeavePlay' }),
    );

    // The cards leave play before anyone rallies (§4.5.1).
    expect(getExpectedCleanupPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'cardsLeavePlay',
    });
  });

  it('asks the player holding the initiative whether to rally first', () => {
    // White holds the initiative, on the first rally choice.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );

    // White decides first (§4.5.2).
    expect(getExpectedCleanupPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseRally',
      playerSource: 'white',
    });
  });

  it('asks the other player whether to rally second', () => {
    // White holds the initiative and has finished its rally or declined.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: {
          ...createOpenedRallyResolutionState(false),
          completed: true,
        },
        step: 'secondPlayerChooseRally',
      }),
    );

    // Black decides second (§4.5.3).
    expect(getExpectedCleanupPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseRally',
      playerSource: 'black',
    });
  });

  it("carries out the first player's rally, starting with the burn and return", () => {
    // White has chosen to rally, and nothing of it is done yet.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: createOpenedRallyResolutionState(true),
        step: 'firstPlayerResolveRally',
      }),
    );

    // The burn and the return are an effect the game owes (§10.3.2).
    expect(getExpectedCleanupPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRally',
    });
  });

  it('asks the second player, rallying, to assign their unit support', () => {
    // White has finished; Black rallied, and its cards are back in hand.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: {
          ...createOpenedRallyResolutionState(false),
          completed: true,
        },
        secondPlayerRallyResolutionState: {
          ...createOpenedRallyResolutionState(true),
          rallyResolved: true,
        },
        step: 'secondPlayerResolveRally',
      }),
    );

    // Black's own rally owes its support check, which Black assigns (§10.4.4).
    expect(getExpectedCleanupPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'assignUnitSupport',
      playerSource: 'black',
    });
  });

  it("throws when the rallying player's rally has not begun on its resolve step", () => {
    // Black holds the initiative and is on its resolve step, but its rally
    // was never opened.
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );

    // The rally is read through the query that insists on it.
    expect(() => getExpectedCleanupPhaseEvent(state)).toThrow(
      'No black rally resolution state found',
    );
  });

  it('ends the round once both players have rallied or declined', () => {
    // Both rallies are done.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createCleanupPhaseState({ step: 'complete' }),
    );

    // The round ends, and the next begins at Phase 1 (§4.5.4).
    expect(getExpectedCleanupPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'roundEnd',
    });
  });

  it('throws on a step Phase 5 does not have', () => {
    // A step no phase state can hold, forced past the type.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createCleanupPhaseState({ step: 'invalidStep' as never }), // a step the type forbids
    );

    // The exhaustive default names the step it was given.
    expect(() => getExpectedCleanupPhaseEvent(state)).toThrow(
      'Invalid cleanup phase step: invalidStep',
    );
  });
});

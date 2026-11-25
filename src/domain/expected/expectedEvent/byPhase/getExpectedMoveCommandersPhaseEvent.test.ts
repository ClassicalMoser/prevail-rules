import { createEmptyGameState } from '@factories';
import { createMoveCommandersPhaseState, withLostCommander } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getExpectedMoveCommandersPhaseEvent } from './getExpectedMoveCommandersPhaseEvent';

/**
 * Phase 2 (§4.2): the first player moves their commander, then the second.
 * A player whose commander has fallen has nothing to move, and their turn is
 * passed over (§4.2.8).
 */
describe('getExpectedMoveCommandersPhaseEvent function', () => {
  it('asks the player holding the initiative to move first', () => {
    // Black holds the initiative, on the first turn.
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      createMoveCommandersPhaseState({ step: 'moveFirstCommander' }),
    );

    // Black moves its commander first (§4.2.1).
    expect(getExpectedMoveCommandersPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'moveCommander',
      playerSource: 'black',
    });
  });

  it('follows the initiative, whichever side holds it', () => {
    // White holds the initiative, on the first turn.
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'white'),
      createMoveCommandersPhaseState({ step: 'moveFirstCommander' }),
    );

    // White moves its commander first.
    expect(getExpectedMoveCommandersPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'moveCommander',
      playerSource: 'white',
    });
  });

  it('asks the other player to move second', () => {
    // Black holds the initiative, on the second turn.
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      createMoveCommandersPhaseState({ step: 'moveSecondCommander' }),
    );

    // White moves its commander second.
    expect(getExpectedMoveCommandersPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'moveCommander',
      playerSource: 'white',
    });
  });

  it("given the first player's commander has fallen, passes over their move", () => {
    // Black holds the initiative, but its commander was defeated (§4.2.8).
    const state = withLostCommander(
      updatePhaseState(
        updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
        createMoveCommandersPhaseState({ step: 'moveFirstCommander' }),
      ),
      'black',
    );

    // Black has nothing to move, so its turn is passed over.
    expect(getExpectedMoveCommandersPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'skipLostCommanderMove',
    });
  });

  it("given the second player's commander has fallen, passes over their move", () => {
    // White moves second, and its commander was defeated (§4.2.8).
    const state = withLostCommander(
      updatePhaseState(
        updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
        createMoveCommandersPhaseState({ step: 'moveSecondCommander' }),
      ),
      'white',
    );

    // White has nothing to move, so its turn is passed over.
    expect(getExpectedMoveCommandersPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'skipLostCommanderMove',
    });
  });

  it('asks a player whose commander stands to move, though the other has fallen', () => {
    // Black holds the initiative and its commander stands; White's fell.
    const state = withLostCommander(
      updatePhaseState(
        updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
        createMoveCommandersPhaseState({ step: 'moveFirstCommander' }),
      ),
      'white',
    );

    // Only the player whose own commander fell is passed over.
    expect(getExpectedMoveCommandersPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'moveCommander',
      playerSource: 'black',
    });
  });

  it('ends the phase once both turns are taken', () => {
    // Both commanders have moved, or been passed over.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createMoveCommandersPhaseState({ step: 'complete' }),
    );

    // Orders are issued next (§4.3).
    expect(getExpectedMoveCommandersPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeMoveCommandersPhase',
    });
  });

  it('throws on a step Phase 2 does not have', () => {
    // A step no phase state can hold, forced past the type.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createMoveCommandersPhaseState({ step: 'invalidStep' as never }), // a step the type forbids
    );

    // The exhaustive default names the step it was given.
    expect(() => getExpectedMoveCommandersPhaseEvent(state)).toThrow(
      'Invalid moveCommanders phase step: invalidStep',
    );
  });
});

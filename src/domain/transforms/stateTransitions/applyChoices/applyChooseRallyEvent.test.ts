import type { CleanupPhaseState } from '@game';
import { createChooseRallyEvent, createEmptyGameState } from '@factories';
import { getCleanupPhaseState } from '@queries';
import { createCleanupPhaseState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

import { applyChooseRallyEvent } from './applyChooseRallyEvent';

/**
 * Cleanup rally prompts: `performRally` seeds the per-player rally resolution slice and moves
 * the cleanup step forward (resolve rally vs skip to next chooser or complete).
 */
describe('applyChooseRallyEvent function', () => {
  /**
   * Cleanup on the given step. White holds the initiative, as a new game
   * starts, so white chooses first and black second (§10.3.1).
   */
  function cleanupOn(step: CleanupPhaseState['step']) {
    const state = createEmptyGameState('standard');
    const onStep = updatePhaseState(state, createCleanupPhaseState({ step }));
    return onStep;
  }

  it('given firstPlayerChooseRally and performRally true, step firstPlayerResolveRally and playerRallied true', () => {
    // White, first, rallies.
    const newState = applyChooseRallyEvent(
      createChooseRallyEvent({ performRally: true, player: 'white' }),
      cleanupOn('firstPlayerChooseRally'),
    );
    const newPhaseState = getCleanupPhaseState(newState);

    // White's rally is recorded in the first slot, and resolved next.
    expect(newPhaseState.step).toBe('firstPlayerResolveRally');
    expect(
      throwIfPending(newPhaseState.firstPlayerRallyResolutionState, 'rally')
        .playerRallied,
    ).toBe(true);
  });

  it('given firstPlayerChooseRally and performRally false, step secondPlayerChooseRally and playerRallied false', () => {
    // White declines: nothing happens to its cards or units (§10.3.4).
    const newState = applyChooseRallyEvent(
      createChooseRallyEvent({ performRally: false, player: 'white' }),
      cleanupOn('firstPlayerChooseRally'),
    );
    const newPhaseState = getCleanupPhaseState(newState);

    // The refusal is recorded, and the choice passes to black.
    expect(newPhaseState.step).toBe('secondPlayerChooseRally');
    expect(
      throwIfPending(newPhaseState.firstPlayerRallyResolutionState, 'rally')
        .playerRallied,
    ).toBe(false);
  });

  it('given secondPlayerChooseRally and performRally true, step secondPlayerResolveRally and playerRallied true', () => {
    // Black, second, rallies once white is done (§10.3.6).
    const newState = applyChooseRallyEvent(
      createChooseRallyEvent({ performRally: true, player: 'black' }),
      cleanupOn('secondPlayerChooseRally'),
    );
    const newPhaseState = getCleanupPhaseState(newState);

    // Black's rally goes in the second slot, and is resolved next.
    expect(newPhaseState.step).toBe('secondPlayerResolveRally');
    expect(
      throwIfPending(newPhaseState.secondPlayerRallyResolutionState, 'rally')
        .playerRallied,
    ).toBe(true);
  });

  it('given cleanup on cardsLeavePlay, throws chooseRally step guard', () => {
    // Cards leave play before anyone chooses whether to rally (§4.5.1).
    expect(() =>
      applyChooseRallyEvent(
        createChooseRallyEvent({ performRally: true, player: 'white' }),
        cleanupOn('cardsLeavePlay'),
      ),
    ).toThrow('Cleanup phase is not on a chooseRally step: cardsLeavePlay');
  });
});

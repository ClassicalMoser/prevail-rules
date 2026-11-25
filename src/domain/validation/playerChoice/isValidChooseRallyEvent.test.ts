import type { AuthoritativeGameState } from '@game';
import { createChooseRallyEvent, createEmptyGameState } from '@factories';
import {
  createCleanupPhaseState,
  createPlayCardsPhaseState,
  createPlayableGame,
  createTestCard,
} from '@testing';
import { updatePhaseState, updatePlayerCardState } from '@transforms';

import { isValidChooseRallyEvent } from './isValidChooseRallyEvent';

/**
 * In Cleanup each player in turn, first player first, decides whether to
 * rally (§10.3.1). Declining is always open; rallying burns a played card, so
 * it needs one in the played pile (§10.3.2).
 *
 * White holds the initiative, so White decides first.
 */
describe('isValidChooseRallyEvent function', () => {
  /** Cleanup on White's decision, with White's played pile as given. */
  function whiteDeciding(played: number): AuthoritativeGameState {
    const game = createPlayableGame([], { initiative: 'white' });

    // The cards White played in earlier rounds, this round's among them.
    const withPlayed = updatePlayerCardState(game, 'white', {
      ...game.cardState.white,
      played: Array.from({ length: played }, () => createTestCard()),
    });
    const deciding = updatePhaseState(
      withPlayed,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );
    return deciding;
  }

  it('accepts rallying when the played pile holds a card to burn', () => {
    // This round's card went to the played pile as Cleanup began (§10.3.3).
    const event = createChooseRallyEvent({
      performRally: true,
      player: 'white',
    });

    expect(isValidChooseRallyEvent(event, whiteDeciding(1))).toStrictEqual({
      result: true,
    });
  });

  it('accepts declining to rally', () => {
    // Rallying is a "may" (§1.2); declining changes nothing (§10.3.4).
    const event = createChooseRallyEvent({
      performRally: false,
      player: 'white',
    });

    expect(isValidChooseRallyEvent(event, whiteDeciding(1))).toStrictEqual({
      result: true,
    });
  });

  it('refuses rallying with nothing in the played pile to burn', () => {
    // Play always leaves this round's card there by Cleanup (§10.3.3); an
    // empty pile is the case the legal options still guard.
    const event = createChooseRallyEvent({
      performRally: true,
      player: 'white',
    });

    expect(isValidChooseRallyEvent(event, whiteDeciding(0))).toStrictEqual({
      errorReason: 'Choose rally option is not legal for white',
      result: false,
    });
  });

  it('refuses the second player deciding while the first player decides', () => {
    // Black declines, which would be open to Black in its own turn; the
    // first player finishes first (§10.3.6).
    const event = createChooseRallyEvent({
      performRally: false,
      player: 'black',
    });

    expect(isValidChooseRallyEvent(event, whiteDeciding(1))).toStrictEqual({
      errorReason: 'Choose rally option is not legal for black',
      result: false,
    });
  });

  it('throws, naming the phase, when the game is not in cleanup', () => {
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );
    const event = createChooseRallyEvent({
      performRally: true,
      player: 'black',
    });

    // Choosing to rally belongs to cleanup, so the enumerator refuses to list
    // options anywhere else; the boundary turns that into a refusal.
    expect(() => isValidChooseRallyEvent(event, state)).toThrow(
      'Expected cleanup phase, got playCards',
    );
  });
});

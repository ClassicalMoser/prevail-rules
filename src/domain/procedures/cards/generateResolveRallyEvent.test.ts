import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';

import {
  createCleanupPhaseState,
  createEmptyGameState,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { generateResolveRallyEvent } from './generateResolveRallyEvent';

/**
 * Cleanup: resolve rally burns one played command card. Procedure picks a card from the
 * acting player’s `played` pile (non-deterministic); player comes from resolve-rally step + initiative.
 */
describe(generateResolveRallyEvent, () => {
  /** Seeds `played` for `played` side and lands on firstPlayerResolveRally. */
  function cleanupResolveRallyState(played: 'black' | 'white'): GameState {
    const base = createEmptyGameState();
    const card = base.cardState[played].inPlay!;
    const withPlayed = updateCardState(base, {
      ...base.cardState,
      [played]: {
        ...base.cardState[played],
        played: [card],
      },
    });
    return updatePhaseState(
      withPlayed,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );
  }

  it('uses initiative player on firstPlayerResolveRally and burns from their played pile', () => {
    const full = cleanupResolveRallyState('black');
    const event = generateResolveRallyEvent(full, 0);
    expect(event.effectType).toBe('resolveRally');
    expect(event.player).toBe('black');
    expect(full.cardState.black.played).toContain(event.card);
  });

  it('uses non-initiative player on secondPlayerResolveRally', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const card = base.cardState.black.inPlay!;
    const withPlayed = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        played: [card],
      },
    });
    const full = updatePhaseState(
      withPlayed,
      createCleanupPhaseState({ step: 'secondPlayerResolveRally' }),
    );
    const event = generateResolveRallyEvent(full, 0);
    expect(event.player).toBe('black');
    expect(full.cardState.black.played).toContain(event.card);
  });

  it('uses white as first player when initiative is white on firstPlayerResolveRally', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const card = base.cardState.white.inPlay!;
    const withPlayed = updateCardState(base, {
      ...base.cardState,
      white: {
        ...base.cardState.white,
        played: [card],
      },
    });
    const full = updatePhaseState(
      withPlayed,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );
    const event = generateResolveRallyEvent(full, 0);
    expect(event.player).toBe('white');
    expect(full.cardState.white.played).toContain(event.card);
  });

  it('throws when the acting player has an empty played pile', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(
      base,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );
    expect(() => generateResolveRallyEvent(full, 0)).toThrow(
      'Player black has no played cards to burn for rally',
    );
  });

  it('throws when cleanup is still on a chooseRally step', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(
      base,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );
    expect(() => generateResolveRallyEvent(full, 0)).toThrow(
      'Cleanup phase is not on a resolveRally step: firstPlayerChooseRally',
    );
  });

  it('throws when not in cleanup phase', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveRallyEvent(full, 0)).toThrow(
      'Expected cleanup phase, got playCards',
    );
  });
});

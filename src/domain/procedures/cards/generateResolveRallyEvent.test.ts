import type { StandardBoard } from '@entities';
import type { GameStateWithBoard, StandardGameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';

import { createCleanupPhaseState, createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';

import { generateResolveRallyEvent } from './generateResolveRallyEvent';

/**
 * Cleanup: choose rally burns one played command card. Procedure picks a card from the
 * acting player’s `played` pile (non-deterministic); player comes from cleanup step + initiative.
 */
describe('generateResolveRallyEvent', () => {
  /** Moves testing-helper `inPlay` card into `played` for `played` side; firstPlayerChooseRally. */
  function cleanupChooseRallyState(
    played: 'black' | 'white',
  ): StandardGameState {
    const base = createEmptyGameState();
    const card = base.cardState[played].inPlay!;
    const withPlayed = updateCardState(base, (c) => ({
      ...c,
      [played]: {
        ...c[played],
        played: [card],
      },
    }));
    return updatePhaseState(
      withPlayed,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );
  }

  it('given firstPlayerChooseRally with black played pile seeded, event player black and card from that pile', () => {
    const full = cleanupChooseRallyState('black');
    const event = generateResolveRallyEvent(full, 0);
    expect(event.effectType).toBe('resolveRally');
    expect(event.player).toBe('black');
    expect(full.cardState.black.played).toContain(event.card);
  });

  it('given white initiative and secondPlayerChooseRally, acting side without initiative (black) supplies card', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const card = base.cardState.black.inPlay!;
    const withPlayed = updateCardState(base, (c) => ({
      ...c,
      black: {
        ...c.black,
        played: [card],
      },
    }));
    const full = updatePhaseState(
      withPlayed,
      createCleanupPhaseState({ step: 'secondPlayerChooseRally' }),
    );
    const event = generateResolveRallyEvent(full, 0);
    expect(event.player).toBe('black');
    expect(full.cardState.black.played).toContain(event.card);
  });

  it('given chooseRally step but empty played pile for acting player, throws', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(
      base,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );
    expect(() => generateResolveRallyEvent(full, 0)).toThrow(
      'Player black has no played cards to burn for rally',
    );
  });

  it('given playCards phase instead of cleanup, throws phase guard', () => {
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

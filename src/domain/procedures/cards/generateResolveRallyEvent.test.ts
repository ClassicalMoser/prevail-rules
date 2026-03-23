import type { GameState, StandardBoard } from '@entities';
import { PLAY_CARDS_PHASE } from '@entities';
import { createCleanupPhaseState, createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';

import { generateResolveRallyEvent } from './generateResolveRallyEvent';

describe('generateResolveRallyEvent', () => {
  function cleanupChooseRallyState(
    played: 'black' | 'white',
  ): GameState<StandardBoard> {
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

  it('returns resolveRally with player and a card from that player played pile', () => {
    const full = cleanupChooseRallyState('black');
    const event = generateResolveRallyEvent(full);
    expect(event.effectType).toBe('resolveRally');
    expect(event.player).toBe('black');
    expect(full.cardState.black.played).toContain(event.card);
  });

  it('on secondPlayerChooseRally, selects a card from the player without initiative', () => {
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
    const event = generateResolveRallyEvent(full);
    expect(event.player).toBe('black');
    expect(full.cardState.black.played).toContain(event.card);
  });

  it('throws when rallying player has no played cards', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(
      base,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );
    expect(() => generateResolveRallyEvent(full)).toThrow(
      'Player black has no played cards to burn for rally',
    );
  });

  it('throws when not in cleanup phase', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveRallyEvent(full)).toThrow(
      'Expected cleanup phase, got playCards',
    );
  });
});

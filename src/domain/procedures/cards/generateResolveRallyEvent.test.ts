import type { CommandCard } from '@entities';
import type { GameState } from '@game';
import type { RandomSource } from '@utils';
import { defaultRandom } from '@utils';
import { PLAY_CARDS_PHASE } from '@game';

import {
  createCleanupPhaseState,
  createTestCard,
  updateCardState,
} from '@testing';
import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { generateResolveRallyEvent } from './generateResolveRallyEvent';

import { createEmptyGameState } from '@factories';

/**
 * Cleanup: resolve rally burns one played command card. Procedure picks a card from the
 * acting player’s `played` pile (non-deterministic); player comes from resolve-rally step + initiative.
 */
describe('generateResolveRallyEvent function', () => {
  /** Seeds `played` for `played` side and lands on firstPlayerResolveRally. */
  function cleanupResolveRallyState(played: 'black' | 'white'): GameState {
    const base = createEmptyGameState('standard');
    const playedCard = createTestCard();
    const withPlayed = updateCardState(base, {
      ...base.cardState,
      [played]: {
        ...base.cardState[played],
        played: [playedCard],
      },
    });
    return updatePhaseState(
      withPlayed,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );
  }

  it('uses initiative player on firstPlayerResolveRally and burns from their played pile', () => {
    const full = cleanupResolveRallyState('black');
    const event = generateResolveRallyEvent(full, defaultRandom);
    expect(event.effectType).toBe('resolveRally');
    expect(event.player).toBe('black');
    expect(full.cardState.black.played).toContain(event.card);
  });

  it('uses non-initiative player on secondPlayerResolveRally', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const playedCard = createTestCard();
    const withPlayed = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        played: [playedCard],
      },
    });
    const full = updatePhaseState(
      withPlayed,
      createCleanupPhaseState({ step: 'secondPlayerResolveRally' }),
    );
    const event = generateResolveRallyEvent(full, defaultRandom);
    expect(event.player).toBe('black');
    expect(full.cardState.black.played).toContain(event.card);
  });

  it('uses white as first player when initiative is white on firstPlayerResolveRally', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const playedCard = createTestCard();
    const withPlayed = updateCardState(base, {
      ...base.cardState,
      white: {
        ...base.cardState.white,
        played: [playedCard],
      },
    });
    const full = updatePhaseState(
      withPlayed,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );
    const event = generateResolveRallyEvent(full, defaultRandom);
    expect(event.player).toBe('white');
    expect(full.cardState.white.played).toContain(event.card);
  });

  /** A source that always draws `value`, so the burn index is fixed. */
  function fixedRandom(value: number): RandomSource {
    return { nextFloat: () => value };
  }

  /** Three distinguishable cards in black's played pile, on resolve-rally. */
  function cleanupWithThreePlayed(): {
    first: CommandCard;
    full: GameState;
    third: CommandCard;
  } {
    const first = createTestCard();
    const second = createTestCard();
    const third = createTestCard();
    const base = createEmptyGameState('standard');
    const withPlayed = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        played: [first, second, third],
      },
    });
    const full = updatePhaseState(
      withPlayed,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );
    return { first, full, third };
  }

  it('burns the first played card when the source draws zero', () => {
    const { first, full } = cleanupWithThreePlayed();
    const event = generateResolveRallyEvent(full, fixedRandom(0));
    expect(event.card.id).toBe(first.id);
  });

  it('burns the last played card when the source draws near one', () => {
    const { full, third } = cleanupWithThreePlayed();
    const event = generateResolveRallyEvent(full, fixedRandom(0.99));
    expect(event.card.id).toBe(third.id);
  });

  it('burns the same card twice from one fixed source', () => {
    const { full } = cleanupWithThreePlayed();
    const first = generateResolveRallyEvent(full, fixedRandom(0.5));
    const second = generateResolveRallyEvent(full, fixedRandom(0.5));
    expect(second.card.id).toBe(first.card.id);
  });

  it('throws when the acting player has an empty played pile', () => {
    const base = createEmptyGameState('standard');
    const full = updatePhaseState(
      base,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );
    expect(() => generateResolveRallyEvent(full, defaultRandom)).toThrow(
      'Player black has no played cards to burn for rally',
    );
  });

  it('throws when cleanup is still on a chooseRally step', () => {
    const base = createEmptyGameState('standard');
    const full = updatePhaseState(
      base,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );
    expect(() => generateResolveRallyEvent(full, defaultRandom)).toThrow(
      'Cleanup phase is not on a resolveRally step: firstPlayerChooseRally',
    );
  });

  it('throws when not in cleanup phase', () => {
    const base = createEmptyGameState('standard');
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveRallyEvent(full, defaultRandom)).toThrow(
      'Expected cleanup phase, got playCards',
    );
  });
});

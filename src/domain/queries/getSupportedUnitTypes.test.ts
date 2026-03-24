import { createEmptyGameState, createTestCard } from '@testing';
import { describe, expect, it } from 'vitest';
import { getSupportedUnitTypes } from './getSupportedUnitTypes';

/**
 * getSupportedUnitTypes: union of unit-preservation types listed on all cards in the player's hand.
 */
describe('getSupportedUnitTypes', () => {
  it('given empty hand, returns empty set', () => {
    const state = createEmptyGameState();

    expect(getSupportedUnitTypes(state, 'white')).toEqual(new Set());
  });

  it('given multiple in-hand cards, returns deduped preservation types', () => {
    const state = createEmptyGameState();
    state.cardState.white.inHand = [
      createTestCard({ unitPreservation: ['unit-type-1', 'unit-type-2'] }),
      createTestCard({ unitPreservation: ['unit-type-2', 'unit-type-3'] }),
      createTestCard({ unitPreservation: [] }),
    ];

    expect(getSupportedUnitTypes(state, 'white')).toEqual(
      new Set(['unit-type-1', 'unit-type-2', 'unit-type-3']),
    );
  });
});

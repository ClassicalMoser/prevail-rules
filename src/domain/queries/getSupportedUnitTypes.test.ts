import { createEmptyGameState, createTestCard } from '@testing';
import { describe, expect, it } from 'vitest';
import { getSupportedUnitTypes } from './getSupportedUnitTypes';

describe('getSupportedUnitTypes', () => {
  it('should return an empty set when the player has no cards in hand', () => {
    const state = createEmptyGameState();

    expect(getSupportedUnitTypes(state, 'white')).toEqual(new Set());
  });

  it('should return unique supported unit types from all cards in hand', () => {
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

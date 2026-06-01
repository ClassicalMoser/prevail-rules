import { createEmptyGameState, createTestCard } from '@testing';

import { getSupportedUnitTypes } from './getSupportedUnitTypes';

/**
 * GetSupportedUnitTypes: union of unit-preservation types listed on all cards in the player's hand.
 */
describe(getSupportedUnitTypes, () => {
  it('given empty hand, returns empty set', () => {
    expect.hasAssertions();
    const state = createEmptyGameState();

    expect(getSupportedUnitTypes(state, 'white')).toStrictEqual(new Set());
  });

  it('given multiple in-hand cards, returns deduped preservation types', () => {
    expect.hasAssertions();
    const state = createEmptyGameState();
    state.cardState.white.inHand = [
      createTestCard({
        unitSupport: [
          {
            count: 1,
            supportType: 'unitType',
            unitTypeId: '00000000-0000-4000-8000-000000000001',
          },
          {
            count: 1,
            supportType: 'unitType',
            unitTypeId: '00000000-0000-4000-8000-000000000002',
          },
        ],
      }),
      createTestCard({
        unitSupport: [
          {
            count: 1,
            supportType: 'unitType',
            unitTypeId: '00000000-0000-4000-8000-000000000002',
          },
          {
            count: 1,
            supportType: 'unitType',
            unitTypeId: '00000000-0000-4000-8000-000000000003',
          },
        ],
      }),
      createTestCard({ unitSupport: [] }),
    ];

    expect(getSupportedUnitTypes(state, 'white')).toStrictEqual(
      new Set([
        '00000000-0000-4000-8000-000000000001',
        '00000000-0000-4000-8000-000000000002',
        '00000000-0000-4000-8000-000000000003',
      ]),
    );
  });
});

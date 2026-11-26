import { createEmptyGameState } from '@factories';
import { createTestCard } from '@testing/testHelpers';
import { updatePlayerCardState } from '@transforms';

import { createMovementResolutionState } from './movementResolutionState';

/** Black's move under way, its commitment made and no enemy met yet. */
describe('createMovementResolutionState function', () => {
  it('moves a Black unit toward E-6 facing north, having met nobody', () => {
    const resolution = createMovementResolutionState(
      createEmptyGameState('standard'),
    );

    expect(resolution.commandResolutionType).toBe('movement');
    expect(resolution.movingUnit.playerSide).toBe('black');
    expect(resolution.targetPlacement).toStrictEqual({
      coordinate: 'E-6',
      facing: 'north',
    });
    expect(resolution.engagementState).toBe('pending');
    expect(resolution.moveCommander).toBe(false);
    expect(resolution.completed).toBe(false);
  });

  it('records the commitment as made with Black’s card in play', () => {
    // Black has a card in play this round.
    const card = createTestCard();
    const base = createEmptyGameState('standard');
    const state = updatePlayerCardState(base, 'black', {
      ...base.cardState.black,
      inPlay: card,
    });

    const resolution = createMovementResolutionState(state);

    expect(resolution.commitment).toStrictEqual({
      card,
      commitmentType: 'completed',
    });
  });
});

import { createEmptyGameState } from '@factories';
import { createTestCard } from '@testing/testHelpers';
import { updateCurrentInitiative, updatePlayerCardState } from '@transforms';

import { createMeleeResolutionState } from './meleeResolutionState';

/** A melee on E-5 with both commitments made, so a spec starts at the blows. */
describe('createMeleeResolutionState function', () => {
  it('fights on E-5, both sides having committed', () => {
    const melee = createMeleeResolutionState(createEmptyGameState('standard'));

    expect(melee.substepType).toBe('meleeResolution');
    expect(melee.location).toBe('E-5');
    expect(melee.firstPlayerCommitment.commitmentType).toBe('completed');
    expect(melee.secondPlayerCommitment.commitmentType).toBe('completed');
  });

  it('gives the first player’s slot the card of the side holding the initiative', () => {
    // Black holds the initiative, and each side has its own card in play.
    const blackCard = createTestCard();
    const whiteCard = createTestCard();
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const withBlack = updatePlayerCardState(base, 'black', {
      ...base.cardState.black,
      inPlay: blackCard,
    });
    const state = updatePlayerCardState(withBlack, 'white', {
      ...withBlack.cardState.white,
      inPlay: whiteCard,
    });

    const melee = createMeleeResolutionState(state);

    // The first player commits first (§7.2.2): this round, Black.
    expect(melee.firstPlayerCommitment).toMatchObject({ card: blackCard });
    expect(melee.secondPlayerCommitment).toMatchObject({ card: whiteCard });
  });
});

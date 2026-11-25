import type { PlayerSide } from '@entities';
import type { AuthoritativeGameState } from '@game';
import { createEmptyGameState } from '@factories';
import { createPlayCardsPhaseState, createTestCard } from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms';

import { generateResolveInitiativeEvent } from './generateResolveInitiativeEvent';

/**
 * Play cards, assignInitiative: compare each side’s revealed in-play card `initiative` number.
 * Lower wins the round’s tempo; equal numbers leave `currentInitiative` unchanged.
 */
describe('generateResolveInitiativeEvent function', () => {
  /**
   * Phase 1 just after the reveal (§4.1.2): each side has a card in play with
   * the given initiative value, and `holder` held the initiative going in.
   */
  function revealed(
    whiteInitiative: number,
    blackInitiative: number,
    holder: PlayerSide,
  ): AuthoritativeGameState {
    // The play cards phase, on the step that settles the initiative.
    const assigning = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'assignInitiative' }),
    );

    // Each side's revealed card, a different card on each side.
    const whiteRevealed = updatePlayerCardState(assigning, 'white', {
      ...assigning.cardState.white,
      inPlay: createTestCard({ initiative: whiteInitiative }),
    });
    const bothRevealed = updatePlayerCardState(whiteRevealed, 'black', {
      ...whiteRevealed.cardState.black,
      inPlay: createTestCard({ initiative: blackInitiative }),
    });

    // Who held the initiative going into the round, for a tie.
    const state = updateCurrentInitiative(bothRevealed, holder);
    return state;
  }

  describe('winner selection', () => {
    it('gives the initiative to White when White revealed the lower value', () => {
      // White's 1 against Black's 2, with Black holding the initiative.
      const state = revealed(1, 2, 'black');

      // The lower value takes it from the holder (§4.1.3).
      expect(generateResolveInitiativeEvent(state)).toStrictEqual({
        effectType: 'resolveInitiative',
        eventType: 'gameEffect',
        player: 'white',
      });
    });

    it('gives the initiative to Black when Black revealed the lower value', () => {
      // White's 2 against Black's 1, with White holding the initiative.
      const state = revealed(2, 1, 'white');

      // The lower value takes it from the holder (§4.1.3).
      expect(generateResolveInitiativeEvent(state)).toStrictEqual({
        effectType: 'resolveInitiative',
        eventType: 'gameEffect',
        player: 'black',
      });
    });

    it('leaves the initiative with whoever held it when the values tie', () => {
      // Both sides revealed a 3.
      // On a tie the initiative stays where it was (§4.1.4), whichever side
      // that is.
      expect(
        generateResolveInitiativeEvent(revealed(3, 3, 'black')).player,
      ).toBe('black');
      expect(
        generateResolveInitiativeEvent(revealed(3, 3, 'white')).player,
      ).toBe('white');
    });
  });

  describe('preconditions', () => {
    it('throws while the players are still choosing their cards', () => {
      // Phase 1 before the reveal: nothing is face up to compare.
      const state = updatePhaseState(
        createEmptyGameState('standard'),
        createPlayCardsPhaseState({ step: 'chooseCards' }),
      );

      // Initiative is settled only on its own step.
      expect(() => generateResolveInitiativeEvent(state)).toThrow(
        'Play cards phase is not on assignInitiative step',
      );
    });

    it('throws when White has no card in play to compare', () => {
      // Only Black's card is in play; the reveal would have put both there.
      const assigning = updatePhaseState(
        createEmptyGameState('standard'),
        createPlayCardsPhaseState({ step: 'assignInitiative' }),
      );
      const state = updatePlayerCardState(assigning, 'black', {
        ...assigning.cardState.black,
        inPlay: createTestCard(),
      });

      // The missing side is named.
      expect(() => generateResolveInitiativeEvent(state)).toThrow(
        'white has no card in play',
      );
    });

    it('throws when Black has no card in play to compare', () => {
      // Only White's card is in play; the reveal would have put both there.
      const assigning = updatePhaseState(
        createEmptyGameState('standard'),
        createPlayCardsPhaseState({ step: 'assignInitiative' }),
      );
      const state = updatePlayerCardState(assigning, 'white', {
        ...assigning.cardState.white,
        inPlay: createTestCard(),
      });

      // The missing side is named.
      expect(() => generateResolveInitiativeEvent(state)).toThrow(
        'black has no card in play',
      );
    });
  });
});

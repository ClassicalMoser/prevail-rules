import type { CommandCard } from '@entities';
import type { GameState } from '@game';
import {
  createCommitToMeleeEvent,
  createEmptyGameState,
  createOpenedMeleeResolutionState,
  createOwnedCardState,
} from '@factories';
import {
  createGameStateResolvingMelee,
  createPlayCardsPhaseState,
  createTestCard,
} from '@testing';
import { updatePhaseState, updatePlayerCardState } from '@transforms';

import { isValidCommitToMeleeEvent } from './isValidCommitToMeleeEvent';

/** Eligible: carries a melee-applicable attack modifier. */
const attackCard = createTestCard({ modifiers: ['attack'] });
/** Same modifiers as the hand card; a fresh id keeps it out of membership. */
const otherCard = createTestCard({ modifiers: ['attack'] });

/**
 * A melee just chosen to be fought, in which white, holding the initiative,
 * is the first to commit (§7.2.2), with these cards in hand.
 */
function meleeAwaitingWhite(hand: CommandCard[] = [attackCard]): GameState {
  // Neither player has committed yet, so the first player is asked.
  const melee = createOpenedMeleeResolutionState('E-5');
  const fighting = createGameStateResolvingMelee(melee, 'white');

  // White's hand, the cards it may commit from.
  const withHand = updatePlayerCardState(
    fighting,
    'white',
    createOwnedCardState({ inHand: hand }),
  );
  return withHand;
}

/**
 * IsValidCommitToMeleeEvent: membership against getLegalCommitToMeleeEvents.
 */
describe('isValidCommitToMeleeEvent function', () => {
  it('accepts committing the in-hand card with all of its melee modifiers', () => {
    const state = meleeAwaitingWhite();
    const event = createCommitToMeleeEvent({
      committedCard: attackCard,
      player: 'white',
    });

    // White's Attack card is offered, so committing it is legal.
    expect(isValidCommitToMeleeEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts committing a card that names two melee stats', () => {
    // A card giving +1 Attack and +1 Defence (§8.2) may be committed as the
    // card it is; the event does not list its stats, so no order can matter.
    const bothStats = createTestCard({ modifiers: ['attack', 'defense'] });
    const state = meleeAwaitingWhite([bothStats]);
    const event = createCommitToMeleeEvent({
      committedCard: bothStats,
      player: 'white',
    });

    expect(isValidCommitToMeleeEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a card that is not in hand', () => {
    const state = meleeAwaitingWhite();
    const event = createCommitToMeleeEvent({
      committedCard: otherCard,
      player: 'white',
    });

    // Only a card in hand may be committed (§8.6); the reason names the melee.
    expect(isValidCommitToMeleeEvent(event, state)).toStrictEqual({
      errorReason: `Commit to melee is not legal for white with card ${otherCard.id}`,
      result: false,
    });
  });

  it("rejects a card that bears a hand card's id but claims stronger stats", () => {
    // A player holds one Attack card. Its id is legal, but the card sent
    // lists Attack three times, which would count three times over as a
    // melee bonus (§8.4) if it were taken at its word.
    const state = meleeAwaitingWhite();
    const inflated = createTestCard({
      id: attackCard.id,
      modifiers: ['attack', 'attack', 'attack'],
    });
    const event = createCommitToMeleeEvent({
      committedCard: inflated,
      player: 'white',
    });

    // Refused with the part of the card that differs.
    expect(isValidCommitToMeleeEvent(event, state)).toStrictEqual({
      errorReason: `Card ${attackCard.id} differs from the card held in its commit stats`,
      result: false,
    });
  });

  it('refuses the second player while the first player’s commitment is owed', () => {
    // White holds the initiative and commits first (§7.2.2); black's turn
    // comes after, so even black's refusal is not yet an answer.
    const state = meleeAwaitingWhite();
    const event = createCommitToMeleeEvent({
      committedCard: 'none',
      player: 'black',
    });

    expect(isValidCommitToMeleeEvent(event, state)).toStrictEqual({
      errorReason: 'Commit to melee is not legal for black with refuse',
      result: false,
    });
  });

  it('throws when no melee is being fought, which the expected check rules out first', () => {
    // Phase 1: cards are being chosen, and no melee is under way.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );
    const event = createCommitToMeleeEvent({
      committedCard: attackCard,
      player: 'white',
    });

    // A choice sent out of turn is refused by the expected check before
    // membership is asked; reaching here is a fault.
    expect(() => isValidCommitToMeleeEvent(event, state)).toThrow(
      'No melee is being fought',
    );
  });

  it('accepts refusing the melee commitment', () => {
    const state = meleeAwaitingWhite();
    const event = createCommitToMeleeEvent({
      committedCard: 'none',
      player: 'white',
    });

    // Declining is always open (§8.3).
    expect(isValidCommitToMeleeEvent(event, state)).toStrictEqual({
      result: true,
    });
  });
});

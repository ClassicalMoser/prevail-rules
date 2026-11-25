import type { GameState } from '@game';
import {
  createCommitToMovementEvent,
  createEmptyGameState,
  createOwnedCardState,
} from '@factories';
import {
  createGameStateResolvingCommand,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createTestCard,
} from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms';

import { isValidCommitToMovementEvent } from './isValidCommitToMovementEvent';

/** Eligible: carries a movement-applicable speed modifier. */
const speedCard = createTestCard({ modifiers: ['speed'] });
/**
 * Not the hand card. A fresh id keeps membership from matching it.
 */
const otherCard = createTestCard({ modifiers: ['attack'] });

/**
 * Black, the first player, carrying out a Move: its unit has been chosen and
 * may set off once black has committed or declined (§4.3.10 step 2). Black
 * holds one Speed card.
 */
function moveAwaitingBlack(): GameState {
  // Black holds the initiative, so its orders are the ones being resolved.
  const base = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );

  // Black's unit is about to move, and its commitment is still owed.
  const movement = createMovementResolutionState(base, {
    commitment: { commitmentType: 'pending' },
  });
  const moving = createGameStateResolvingCommand(movement, base);

  // Black's hand, the cards it may commit from.
  const withHand = updatePlayerCardState(
    moving,
    'black',
    createOwnedCardState({ inHand: [speedCard] }),
  );
  return withHand;
}

/**
 * IsValidCommitToMovementEvent: membership against getLegalCommitToMovementEvents.
 */
describe('isValidCommitToMovementEvent function', () => {
  it('accepts committing the in-hand card with all of its movement modifiers', () => {
    const state = moveAwaitingBlack();
    const event = createCommitToMovementEvent({
      committedCard: speedCard,
      player: 'black',
    });

    // Black's Speed card is offered, so committing it is legal.
    expect(isValidCommitToMovementEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it("rejects a card that bears a hand card's id but claims stronger stats", () => {
    // The real card lists Speed once. A copy listing it twice would count
    // double as a movement bonus (§8.4).
    const state = moveAwaitingBlack();
    const inflated = createTestCard({
      id: speedCard.id,
      modifiers: ['speed', 'speed'],
    });
    const event = createCommitToMovementEvent({
      committedCard: inflated,
      player: 'black',
    });

    expect(isValidCommitToMovementEvent(event, state)).toStrictEqual({
      errorReason: `Card ${speedCard.id} differs from the card held in its commit stats`,
      result: false,
    });
  });

  // TODO(misleading): "and empty modifiers" is left from when a commitment
  // event carried its modifiers; it now carries only the card or 'none'.
  // Settled by a title that states the refusal alone.
  it('accepts refusing with no card and empty modifiers', () => {
    const state = moveAwaitingBlack();
    const event = createCommitToMovementEvent({
      committedCard: 'none',
      player: 'black',
    });

    // Declining is always open (§8.3).
    expect(isValidCommitToMovementEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a card that is not in hand', () => {
    const state = moveAwaitingBlack();
    const event = createCommitToMovementEvent({
      committedCard: otherCard,
      player: 'black',
    });

    // Only a card in hand may be committed (§8.6); the reason names the move.
    expect(isValidCommitToMovementEvent(event, state)).toStrictEqual({
      errorReason: `Commit to movement is not legal for black with card ${otherCard.id}`,
      result: false,
    });
  });

  it('throws when no movement is being carried out, which the expected check rules out first', () => {
    // Phase 1: cards are being chosen, and no order is being carried out.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );
    const event = createCommitToMovementEvent({
      committedCard: speedCard,
      player: 'black',
    });

    // A choice sent out of turn is refused by the expected check before
    // membership is asked; reaching here is a fault.
    expect(() => isValidCommitToMovementEvent(event, state)).toThrow(
      'No movement is being carried out',
    );
  });
});

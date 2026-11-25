import type { GameState } from '@game';
import {
  createCommitToRangedAttackEvent,
  createEmptyGameState,
  createOwnedCardState,
} from '@factories';
import {
  createGameStateResolvingCommand,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
} from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms';

import { isValidCommitToRangedAttackEvent } from './isValidCommitToRangedAttackEvent';

/** Eligible: carries a ranged-applicable attack modifier. */
const attackCard = createTestCard({ modifiers: ['attack'] });
/** Same modifiers as the hand card; a fresh id keeps it out of membership. */
const otherCard = createTestCard({ modifiers: ['attack'] });

/**
 * Black, the first player, carrying out a Shoot order: its shooter is chosen
 * and black has not yet committed or declined (§4.3.11 step 2). Black holds
 * one Attack card.
 */
function shotAwaitingBlack(): GameState {
  // Black holds the initiative, so its orders are the ones being resolved.
  const base = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );

  // Black's shooter is named, and its commitment is still owed. The target
  // is named after it, so the target and the target's answer wait too.
  const shot = createRangedAttackResolutionState(base, {
    attackingCommitment: { commitmentType: 'pending' },
    defendingCommitment: { commitmentType: 'pending' },
    defendingUnit: 'pending',
    supportingUnits: 'pending',
  });
  const shooting = createGameStateResolvingCommand(shot, base);

  // Black's hand, the cards it may commit from.
  const withHand = updatePlayerCardState(
    shooting,
    'black',
    createOwnedCardState({ inHand: [attackCard] }),
  );
  return withHand;
}

/**
 * IsValidCommitToRangedAttackEvent: membership against
 * getLegalCommitToRangedAttackEvents.
 */
describe('isValidCommitToRangedAttackEvent function', () => {
  it('accepts committing the in-hand card with all of its ranged modifiers', () => {
    const state = shotAwaitingBlack();
    const event = createCommitToRangedAttackEvent({
      committedCard: attackCard,
      player: 'black',
    });

    // Black's Attack card is offered, so committing it is legal.
    expect(isValidCommitToRangedAttackEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it("rejects a card that bears a hand card's id but claims stronger stats", () => {
    // The real card lists Attack once. A copy listing it twice would count
    // double as a shot's attack bonus (§8.4).
    const state = shotAwaitingBlack();
    const inflated = createTestCard({
      id: attackCard.id,
      modifiers: ['attack', 'attack'],
    });
    const event = createCommitToRangedAttackEvent({
      committedCard: inflated,
      player: 'black',
    });

    expect(isValidCommitToRangedAttackEvent(event, state)).toStrictEqual({
      errorReason: `Card ${attackCard.id} differs from the card held in its commit stats`,
      result: false,
    });
  });

  it('rejects a card that is not in hand', () => {
    const state = shotAwaitingBlack();
    const event = createCommitToRangedAttackEvent({
      committedCard: otherCard,
      player: 'black',
    });

    // Only a card in hand may be committed (§8.6); the reason names the shot.
    expect(isValidCommitToRangedAttackEvent(event, state)).toStrictEqual({
      errorReason: `Commit to ranged attack is not legal for black with card ${otherCard.id}`,
      result: false,
    });
  });

  it('throws when no ranged attack is being carried out, which the expected check rules out first', () => {
    // Phase 1: cards are being chosen, and no order is being carried out.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );
    const event = createCommitToRangedAttackEvent({
      committedCard: attackCard,
      player: 'black',
    });

    // A choice sent out of turn is refused by the expected check before
    // membership is asked; reaching here is a fault.
    expect(() => isValidCommitToRangedAttackEvent(event, state)).toThrow(
      'No ranged attack is being carried out',
    );
  });

  it('accepts refusing the ranged commitment', () => {
    const state = shotAwaitingBlack();
    const event = createCommitToRangedAttackEvent({
      committedCard: 'none',
      player: 'black',
    });

    // Declining is always open (§8.3).
    expect(isValidCommitToRangedAttackEvent(event, state)).toStrictEqual({
      result: true,
    });
  });
});

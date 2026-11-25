import type { MovementResolutionState } from '@game';
import { createCommitToMovementEvent, createEmptyGameState } from '@factories';
import {
  getFrontEngagementStateFromMovement,
  getMovementResolutionState,
} from '@queries';
import {
  createFrontEngagementState,
  createGameStateResolvingCommand,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
  updateCardState,
} from '@testing';

import { applyCommitToMovementEvent } from './applyCommitToMovementEvent';

/**
 * A Move order asks for a commitment twice at most: the mover may commit a
 * card for Speed or Flexibility before its unit sets off (§4.3.10 step 2), and
 * a defender it meets head on may do the same before the two Speeds are
 * compared (§6.3.2 step 1). The card goes to the discard pile, and the
 * commitment is written to whichever of the two is owed.
 */
describe('applyCommitToMovementEvent function', () => {
  // A card committable for Speed (§8.4), and a card each side keeps: committing
  // a last card would lose the game (§11.1).
  const speedCard = createTestCard({ modifiers: ['speed'] });
  const kept = { black: createTestCard(), white: createTestCard() };

  /**
   * White, holding the initiative, carries out a Move order with its own
   * unit, and the given player holds the Speed card.
   */
  function whiteMoving(
    holder: 'white' | 'black',
    movement: Partial<MovementResolutionState>,
  ) {
    // The holder has the Speed card besides the one it keeps.
    const empty = createEmptyGameState('standard');
    const handOf = (side: 'white' | 'black') =>
      side === holder ? [speedCard, kept[side]] : [kept[side]];
    const withHand = updateCardState(empty, {
      ...empty.cardState,
      black: { ...empty.cardState.black, inHand: handOf('black') },
      white: { ...empty.cardState.white, inHand: handOf('white') },
    });

    // White's unit is the one moving; the spec says how far the move has got.
    const move = createMovementResolutionState(withHand, {
      movingUnit: createTestUnit('white'),
      ...movement,
    });
    const moving = createGameStateResolvingCommand(move, withHand);
    return moving;
  }

  it("records the mover's card on the move, before its unit sets off, and spends it", () => {
    // White's commitment is owed, and no one has been met yet.
    const state = whiteMoving('white', {
      commitment: { commitmentType: 'pending' },
    });

    const next = applyCommitToMovementEvent(
      createCommitToMovementEvent({
        committedCard: speedCard,
        player: 'white',
      }),
      state,
    );

    // The move counts the card for its Speed (§5.1.1)…
    expect(getMovementResolutionState(next).commitment).toStrictEqual({
      card: speedCard,
      commitmentType: 'completed',
    });
    // …and the card has left white's hand (§8.1).
    expect(next.cardState.white.inHand).toStrictEqual([kept.white]);
  });

  it("records a front engagement's defender's card on the engagement, not on the move", () => {
    // White's unit has met black's head on; white declined its own
    // commitment, and black's is owed.
    const state = whiteMoving('black', {
      commitment: { commitmentType: 'declined' },
      engagementState: createFrontEngagementState(),
    });

    const next = applyCommitToMovementEvent(
      createCommitToMovementEvent({
        committedCard: speedCard,
        player: 'black',
      }),
      state,
    );

    // The defender's Speed counts the card when the two are compared…
    expect(
      getFrontEngagementStateFromMovement(next).engagementResolutionState
        .defensiveCommitment,
    ).toStrictEqual({ card: speedCard, commitmentType: 'completed' });
    // …the mover's refusal stands as it was…
    expect(getMovementResolutionState(next).commitment).toStrictEqual({
      commitmentType: 'declined',
    });
    // …and the card has left black's hand.
    expect(next.cardState.black.inHand).toStrictEqual([kept.black]);
  });

  it("records a defender's refusal on the engagement and leaves its hand alone", () => {
    // As above, but black refuses (§8.3).
    const state = whiteMoving('black', {
      commitment: { commitmentType: 'declined' },
      engagementState: createFrontEngagementState(),
    });

    const next = applyCommitToMovementEvent(
      createCommitToMovementEvent({ committedCard: 'none', player: 'black' }),
      state,
    );

    // The defender declined, and keeps its card.
    expect(
      getFrontEngagementStateFromMovement(next).engagementResolutionState
        .defensiveCommitment,
    ).toStrictEqual({ commitmentType: 'declined' });
    expect(next.cardState.black.inHand).toStrictEqual([speedCard, kept.black]);
  });

  it('leaves the state it was given unchanged', () => {
    // White's commitment is owed.
    const state = whiteMoving('white', {
      commitment: { commitmentType: 'pending' },
    });

    applyCommitToMovementEvent(
      createCommitToMovementEvent({
        committedCard: speedCard,
        player: 'white',
      }),
      state,
    );

    // The original still holds the card and still owes the commitment.
    expect(state.cardState.white.inHand).toStrictEqual([speedCard, kept.white]);
    expect(getMovementResolutionState(state).commitment).toStrictEqual({
      commitmentType: 'pending',
    });
  });
});

import type { CommandCard } from '@entities';
import type { EngagementState, GameState } from '@game';
import { createEmptyGameState, createOwnedCardState } from '@factories';
import {
  createFlankEngagementState,
  createFrontEngagementState,
  createGameStateResolvingCommand,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createTestCard,
} from '@testing';
import { updatePhaseState, updatePlayerCardState } from '@transforms';

import { getLegalCommitToMovementEvents } from './getLegalCommitToMovementEvents';

/** Eligible: carries a movement-applicable speed modifier. */
const speedCard = createTestCard({ modifiers: ['speed'] });
/** Not eligible: attack is a combat modifier, not a movement one. */
const attackCard = createTestCard({ modifiers: ['attack'] });

/**
 * Black carrying out a Move order, with the given player holding the given
 * hand. The mover's own commitment is owed unless the case says it was made,
 * and the move has met an enemy only where the case says so.
 */
function movingWithHand(
  player: 'white' | 'black',
  hand: CommandCard[],
  progress: {
    moverCommitted: boolean;
    engagementState: EngagementState | 'pending';
  },
): GameState {
  // The hand of the player the case is about.
  const withHand = updatePlayerCardState(
    createEmptyGameState('standard'),
    player,
    createOwnedCardState({ inHand: hand }),
  );

  // Black's unit is the one moving (the fixture's default mover). A made
  // commitment is the fixture's default; an owed one is written as pending.
  const movement = createMovementResolutionState(withHand, {
    engagementState: progress.engagementState,
    ...(progress.moverCommitted
      ? {}
      : { commitment: { commitmentType: 'pending' } }),
  });
  const moving = createGameStateResolvingCommand(movement, withHand);
  return moving;
}

/**
 * GetLegalCommitToMovementEvents: one CommitToMovementEvent per eligible
 * in-hand card (has ≥1 movement modifier).
 *
 * A movement commitment is owed at two moments (§8.4): the mover's, before
 * the unit sets off (§4.3.10 step 2), and a front engagement's defender's, at
 * the start of the engagement (§6.3.2 step 1). Each card in hand naming Speed
 * or Flexibility is offered, and the refusal always is.
 */
describe('getLegalCommitToMovementEvents function', () => {
  it('offers the mover each card naming Speed or Flexibility, then the refusal', () => {
    // Black is about to move and holds an Attack card and a Speed card.
    const state = movingWithHand('black', [attackCard, speedCard], {
      engagementState: 'pending',
      moverCommitted: false,
    });

    // The Speed card and the refusal; the Attack card is no use to a move.
    expect(getLegalCommitToMovementEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToMovement',
        committedCard: speedCard,
        eventType: 'playerChoice',
        player: 'black',
      },
      {
        choiceType: 'commitToMovement',
        committedCard: 'none',
        eventType: 'playerChoice',
        player: 'black',
      },
    ]);
  });

  it('returns events for the front-engagement defender when defensive commitment is pending', () => {
    // Black has moved head on into white's unit; white has not yet answered.
    const state = movingWithHand('white', [speedCard], {
      engagementState: createFrontEngagementState(),
      moverCommitted: true,
    });

    // White, the defender, may commit for Speed to fall back.
    expect(getLegalCommitToMovementEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToMovement',
        committedCard: speedCard,
        eventType: 'playerChoice',
        player: 'white',
      },
      {
        choiceType: 'commitToMovement',
        committedCard: 'none',
        eventType: 'playerChoice',
        player: 'white',
      },
    ]);
  });

  it('throws once the mover has committed and its move has met no one', () => {
    // Black has answered for its move, and the move has engaged nobody.
    const state = movingWithHand('black', [speedCard], {
      engagementState: 'pending',
      moverCommitted: true,
    });

    // No commitment is owed, so nothing asks.
    expect(() => getLegalCommitToMovementEvents(state)).toThrow(
      'No movement commitment is owed',
    );
  });

  it('throws once the front engagement defender has answered', () => {
    // White has already refused; whether it can fall back is next.
    const state = movingWithHand('white', [speedCard], {
      engagementState: createFrontEngagementState({
        defensiveCommitment: { commitmentType: 'declined' },
      }),
      moverCommitted: true,
    });

    // The defender commits once.
    expect(() => getLegalCommitToMovementEvents(state)).toThrow(
      'No movement commitment is owed',
    );
  });

  it('throws for a flank engagement, whose defender is turned and not offered a commitment', () => {
    // Black has struck white's unit in the flank: it wheels to face black and
    // may not fall back (§6.3.4), so no commitment is owed to it.
    const state = movingWithHand('white', [speedCard], {
      engagementState: createFlankEngagementState(),
      moverCommitted: true,
    });

    // Only a front engagement's defender commits (§8.4).
    expect(() => getLegalCommitToMovementEvents(state)).toThrow(
      'No movement commitment is owed',
    );
  });

  it('throws when no movement is being carried out, where nothing asks', () => {
    // The players are still choosing their cards.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );

    // No move, so no commitment to it.
    expect(() => getLegalCommitToMovementEvents(state)).toThrow(
      'No movement is being carried out',
    );
  });
});

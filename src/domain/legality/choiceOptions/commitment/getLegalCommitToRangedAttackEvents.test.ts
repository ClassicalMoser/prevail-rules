import type { CommandCard } from '@entities';
import type { Commitment, GameState } from '@game';
import { createEmptyGameState, createOwnedCardState } from '@factories';
import {
  createGameStateResolvingCommand,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
} from '@testing';
import { updatePhaseState, updatePlayerCardState } from '@transforms';

import { getLegalCommitToRangedAttackEvents } from './getLegalCommitToRangedAttackEvents';

/** Eligible: carries a ranged-applicable attack modifier. */
const attackCard = createTestCard({ modifiers: ['attack'] });
/** Not eligible: speed is a movement modifier, not a ranged one. */
const speedCard = createTestCard({ modifiers: ['speed'] });
/** Eligible: carries a range modifier. */
const rangeCard = createTestCard({ modifiers: ['range'] });

/**
 * Black's unit shooting at white's, the given player holding the given hand,
 * with each side's commitment as the case has it.
 */
function shootingWithHand(
  player: 'white' | 'black',
  hand: CommandCard[],
  commitments: {
    attackingCommitment: Commitment;
    defendingCommitment?: Commitment;
  },
): GameState {
  // The hand of the player the case is about.
  const withHand = updatePlayerCardState(
    createEmptyGameState('standard'),
    player,
    createOwnedCardState({ inHand: hand }),
  );

  // Black's unit is the shooter, and white's its target (the fixture's
  // defaults).
  const shot = createRangedAttackResolutionState(withHand, commitments);
  const shooting = createGameStateResolvingCommand(shot, withHand);
  return shooting;
}

/**
 * GetLegalCommitToRangedAttackEvents: one CommitToRangedAttackEvent per
 * eligible in-hand card (has ≥1 ranged modifier), plus refuse. Only the
 * shooter is offered these (§4.3.11 step 2); the target commits through
 * `commitToRangedDefense`.
 */
describe('getLegalCommitToRangedAttackEvents function', () => {
  const refuseBlack = {
    choiceType: 'commitToRangedAttack' as const,
    committedCard: 'none',
    eventType: 'playerChoice' as const,
    player: 'black' as const,
  };

  it('offers the shooter each card naming Range, Attack or Flexibility, then the refusal', () => {
    // Black holds a Speed card, a Range card and an Attack card.
    const state = shootingWithHand(
      'black',
      [speedCard, rangeCard, attackCard],
      {
        attackingCommitment: { commitmentType: 'pending' },
      },
    );

    // The Range and Attack cards, then the refusal; Speed is no use to a shot.
    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToRangedAttack',
        committedCard: rangeCard,
        eventType: 'playerChoice',
        player: 'black',
      },
      {
        choiceType: 'commitToRangedAttack',
        committedCard: attackCard,
        eventType: 'playerChoice',
        player: 'black',
      },
      refuseBlack,
    ]);
  });

  it('a card naming Range and Attack is offered with both, since it counts for the whole shot', () => {
    // One card, two stats (§8.2): its Range for the aim, its Attack for the attack value.
    const rangeAndAttackCard = createTestCard({
      modifiers: ['range', 'attack'],
    });
    const state = shootingWithHand('black', [rangeAndAttackCard], {
      attackingCommitment: { commitmentType: 'pending' },
    });

    // Offered once, as one commitment.
    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToRangedAttack',
        committedCard: rangeAndAttackCard,
        eventType: 'playerChoice',
        player: 'black',
      },
      refuseBlack,
    ]);
  });

  it('throws once the shooter has committed: the target’s commitment is a separate choice', () => {
    // White holds an Attack card while its commitment is owed.
    // Black has refused; the next commitment in the shot is white's, as target.
    const state = shootingWithHand('white', [attackCard], {
      attackingCommitment: { commitmentType: 'declined' },
      defendingCommitment: { commitmentType: 'pending' },
    });

    // The shooter commits once (§7.4.5).
    expect(() => getLegalCommitToRangedAttackEvents(state)).toThrow(
      'The shooter has already committed or refused a card',
    );
  });

  it('throws when no ranged attack is being carried out, where nothing asks', () => {
    // The players are still choosing their cards.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );

    // No shot, so no commitment to it.
    expect(() => getLegalCommitToRangedAttackEvents(state)).toThrow(
      'No ranged attack is being carried out',
    );
  });
});

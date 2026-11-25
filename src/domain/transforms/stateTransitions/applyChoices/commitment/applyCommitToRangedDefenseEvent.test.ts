import type { CommandCard } from '@entities';
import {
  createCommitToRangedDefenseEvent,
  createEmptyGameState,
} from '@factories';
import { getRangedAttackResolutionState } from '@queries';
import {
  createGameStateResolvingCommand,
  createRangedAttackResolutionState,
  createTestCard,
  createTestUnit,
  updateCardState,
} from '@testing';
import { updateCurrentInitiative } from '@transforms/pureTransforms';

import { applyCommitToRangedDefenseEvent } from './applyCommitToRangedDefenseEvent';

/**
 * The target's commitment (§4.3.11 step 5): once a shot is aimed, the
 * target's owner commits a card for Defence or Flexibility, or refuses, and the shot records
 * it for when the attack takes effect (§8.5).
 */
describe('applyCommitToRangedDefenseEvent function', () => {
  /**
   * Black's shot at a white unit, aimed, with white's commitment owed; white
   * holds the given hand.
   */
  function shotAwaitingDefence(whiteHand: CommandCard[]) {
    // Black holds the initiative and carries out the Shoot order.
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const withHand = updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: whiteHand },
    });
    // The target is a white unit; where it stands is not read here.
    const shot = createRangedAttackResolutionState(withHand, {
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit: createTestUnit('white'),
    });
    const awaiting = createGameStateResolvingCommand(shot, withHand);
    return awaiting;
  }

  // A card committable for Defence (§8.4).
  const defenceCard = createTestCard({ modifiers: ['defense'] });

  it('a Defence card committed by the target is recorded on the shot and leaves its hand', () => {
    // White's only card names Defence.
    const state = shotAwaitingDefence([defenceCard]);

    // White commits it against the shot.
    const committed = applyCommitToRangedDefenseEvent(
      createCommitToRangedDefenseEvent({
        committedCard: defenceCard,
        player: 'white',
      }),
      state,
    );

    // The shot holds the card as the target's commitment (§8.5)...
    expect(
      getRangedAttackResolutionState(committed).defendingCommitment,
    ).toStrictEqual({ card: defenceCard, commitmentType: 'completed' });
    // ...and it has left white's hand for the discard pile (§8.1).
    expect(committed.cardState.white.inHand).toStrictEqual([]);
  });

  it('a target that refuses keeps its hand, and the shot records the refusal', () => {
    // White holds a Defence card it chooses not to spend.
    const state = shotAwaitingDefence([defenceCard]);

    // White refuses (§8.3).
    const refused = applyCommitToRangedDefenseEvent(
      createCommitToRangedDefenseEvent({
        committedCard: 'none',
        player: 'white',
      }),
      state,
    );

    expect(
      getRangedAttackResolutionState(refused).defendingCommitment,
    ).toStrictEqual({ commitmentType: 'declined' });
    expect(refused.cardState.white.inHand).toStrictEqual([defenceCard]);
  });
});

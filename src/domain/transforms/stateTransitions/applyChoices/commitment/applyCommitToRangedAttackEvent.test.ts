import {
  createCommitToRangedAttackEvent,
  createEmptyGameState,
} from '@factories';
import { getRangedAttackResolutionState } from '@queries';
import {
  createGameStateResolvingCommand,
  createRangedAttackResolutionState,
  createTestCard,
  updateCardState,
} from '@testing';
import { updateCurrentInitiative } from '@transforms/pureTransforms';

import { applyCommitToRangedAttackEvent } from './applyCommitToRangedAttackEvent';

/**
 * The shooter's commitment (§4.3.11 step 2): the attacker locks in its card;
 * `attackingCommitment` flips to completed and the card leaves hand. The
 * target's commitment is its own event (`applyCommitToRangedDefenseEvent`).
 */
describe('applyCommitToRangedAttackEvent function', () => {
  it("records the shooter's card on the shot, before its target is named, and spends it", () => {
    // Black, holding the initiative, carries out a Shoot order with its own
    // unit. It holds a card committable for Range, and one it keeps.
    const rangeCard = createTestCard({ modifiers: ['range'] });
    const kept = createTestCard();
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const withHand = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inHand: [rangeCard, kept] },
    });

    // The shot's default shooter is black's; its commitment is owed, and no
    // target or supporter is named yet.
    const shot = createRangedAttackResolutionState(withHand, {
      attackingCommitment: { commitmentType: 'pending' },
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit: 'pending',
      supportingUnits: 'pending',
    });
    const state = createGameStateResolvingCommand(shot, withHand);

    const next = applyCommitToRangedAttackEvent(
      createCommitToRangedAttackEvent({
        committedCard: rangeCard,
        player: 'black',
      }),
      state,
    );

    // The shot counts the card: its Range for the arc, its Attack for the
    // blow (§7.4.5)…
    expect(
      getRangedAttackResolutionState(next).attackingCommitment,
    ).toStrictEqual({ card: rangeCard, commitmentType: 'completed' });
    // …and it has left black's hand (§8.1).
    expect(next.cardState.black.inHand).toStrictEqual([kept]);
  });
});

import { tempCommandCards } from '@sampleValues';
import { getRangedAttackResolutionState } from '@queries';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  updateCardState,
} from '@testing';

import { updatePhaseState } from '@transforms/pureTransforms';

import { applyCommitToRangedAttackEvent } from './applyCommitToRangedAttackEvent';

import {
  createCommitToRangedAttackEvent,
  createEmptyGameState,
} from '@factories';
/**
 * The shooter's commitment (§4.3.11 step 2): the attacker locks in its card;
 * `attackingCommitment` flips to completed and the card leaves hand. The
 * target's commitment is its own event (`applyCommitToRangedDefenseEvent`).
 */
describe('applyCommitToRangedAttackEvent function', () => {
  it('given pending attackingCommitment and black holds the card, attacking completed and black hand empty', () => {
    const state = createEmptyGameState('standard');
    const stateWithBlackCardInHand = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inHand: [tempCommandCards[0]] },
    });
    const rangedState = createRangedAttackResolutionState(
      stateWithBlackCardInHand,
      {
        attackingCommitment: { commitmentType: 'pending' },
      },
    );
    const stateInPhase = updatePhaseState(
      stateWithBlackCardInHand,
      createIssueCommandsPhaseState(stateWithBlackCardInHand, {
        currentCommandResolutionState: rangedState,
      }),
    );
    const event = createCommitToRangedAttackEvent({
      committedCard: tempCommandCards[0],
      eventNumber: 0,
      modifierTypes: [],
      player: 'black',
    });

    const newState = applyCommitToRangedAttackEvent(event, stateInPhase);
    const newRanged = getRangedAttackResolutionState(newState);

    expect(newRanged.attackingCommitment).toStrictEqual({
      card: tempCommandCards[0],
      commitmentType: 'completed',
    });
    expect(newState.cardState.black.inHand).toHaveLength(0);
  });
});

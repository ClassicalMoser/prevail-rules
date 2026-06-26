import type { CommitToRangedAttackEvent } from '@events';
import { getRangedAttackResolutionState } from '@queries';
import { tempCommandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyCommitToRangedAttackEvent } from './applyCommitToRangedAttackEvent';

/**
 * Ranged strike commitments: attacker or defender locks in their reaction card; the matching
 * `attackingCommitment` / `defendingCommitment` flips to completed and the card leaves hand.
 */
describe(applyCommitToRangedAttackEvent, () => {
  it('given pending attackingCommitment and black holds the card, attacking completed and black hand empty', () => {
    const state = createEmptyGameState();
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
    const event: CommitToRangedAttackEvent = {
      choiceType: 'commitToRangedAttack',
      committedCard: tempCommandCards[0],
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'black',
    };

    const newState = applyCommitToRangedAttackEvent(event, stateInPhase);
    const newRanged = getRangedAttackResolutionState(newState);

    expect(newRanged.attackingCommitment).toStrictEqual({
      card: tempCommandCards[0],
      commitmentType: 'completed',
    });
    expect(newState.cardState.black.inHand).toHaveLength(0);
  });

  it('given pending defendingCommitment and white holds the card, defending completed and white hand empty', () => {
    const state = createEmptyGameState();
    const stateWithWhiteCardInHand = updateCardState(state, {
      ...state.cardState,
      white: { ...state.cardState.white, inHand: [tempCommandCards[0]] },
    });
    const rangedState = createRangedAttackResolutionState(
      stateWithWhiteCardInHand,
      {
        defendingCommitment: { commitmentType: 'pending' },
      },
    );
    const stateInPhase = updatePhaseState(
      stateWithWhiteCardInHand,
      createIssueCommandsPhaseState(stateWithWhiteCardInHand, {
        currentCommandResolutionState: rangedState,
      }),
    );
    const event: CommitToRangedAttackEvent = {
      choiceType: 'commitToRangedAttack',
      committedCard: tempCommandCards[0],
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'white',
    };

    const newState = applyCommitToRangedAttackEvent(event, stateInPhase);
    const newRanged = getRangedAttackResolutionState(newState);

    expect(newRanged.defendingCommitment).toStrictEqual({
      card: tempCommandCards[0],
      commitmentType: 'completed',
    });
    expect(newState.cardState.white.inHand).toHaveLength(0);
  });
});

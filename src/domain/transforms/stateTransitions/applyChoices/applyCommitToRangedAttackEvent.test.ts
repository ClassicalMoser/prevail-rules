import type { StandardBoard } from '@entities';
import type { CommitToRangedAttackEvent } from '@events';
import { getRangedAttackResolutionState } from '@queries';
import { tempCommandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
} from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyCommitToRangedAttackEvent } from './applyCommitToRangedAttackEvent';

/**
 * Ranged strike commitments: attacker or defender locks in their reaction card; the matching
 * `attackingCommitment` / `defendingCommitment` flips to completed and the card leaves hand.
 */
describe('applyCommitToRangedAttackEvent', () => {
  it('given pending attackingCommitment and black holds the card, attacking completed and black hand empty', () => {
    const state = createEmptyGameState();
    const stateWithBlackCardInHand = updateCardState(state, (c) => ({
      ...c,
      black: { ...c.black, inHand: [tempCommandCards[0]] },
    }));
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
    const event: CommitToRangedAttackEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'commitToRangedAttack',
      player: 'black',
      committedCard: tempCommandCards[0],
      modifierTypes: [],
    };

    const newState = applyCommitToRangedAttackEvent(event, stateInPhase);
    const newRanged = getRangedAttackResolutionState(newState);

    expect(newRanged.attackingCommitment).toEqual({
      commitmentType: 'completed',
      card: tempCommandCards[0],
    });
    expect(newState.cardState.black.inHand).toHaveLength(0);
  });

  it('given pending defendingCommitment and white holds the card, defending completed and white hand empty', () => {
    const state = createEmptyGameState();
    const stateWithWhiteCardInHand = updateCardState(state, (c) => ({
      ...c,
      white: { ...c.white, inHand: [tempCommandCards[0]] },
    }));
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
    const event: CommitToRangedAttackEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'commitToRangedAttack',
      player: 'white',
      committedCard: tempCommandCards[0],
      modifierTypes: [],
    };

    const newState = applyCommitToRangedAttackEvent(event, stateInPhase);
    const newRanged = getRangedAttackResolutionState(newState);

    expect(newRanged.defendingCommitment).toEqual({
      commitmentType: 'completed',
      card: tempCommandCards[0],
    });
    expect(newState.cardState.white.inHand).toHaveLength(0);
  });
});

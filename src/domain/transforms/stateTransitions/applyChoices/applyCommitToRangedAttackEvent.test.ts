import type { StandardBoard } from '@entities';
import type { CommitToRangedAttackEvent } from '@events';
import { getRangedAttackResolutionState } from '@queries';
import { commandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
} from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyCommitToRangedAttackEvent } from './applyCommitToRangedAttackEvent';

describe('applyCommitToRangedAttackEvent', () => {
  it('completes attacking commitment and discards card from attacker hand', () => {
    const state = createEmptyGameState();
    const stateWithBlackCardInHand = updateCardState(state, (c) => ({
      ...c,
      black: { ...c.black, inHand: [commandCards[0]] },
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
      eventType: 'playerChoice',
      choiceType: 'commitToRangedAttack',
      player: 'black',
      committedCard: commandCards[0],
      modifierTypes: [],
    };

    const newState = applyCommitToRangedAttackEvent(event, stateInPhase);
    const newRanged = getRangedAttackResolutionState(newState);

    expect(newRanged.attackingCommitment).toEqual({
      commitmentType: 'completed',
      card: commandCards[0],
    });
    expect(newState.cardState.black.inHand).toHaveLength(0);
  });

  it('completes defending commitment and discards card from defender hand', () => {
    const state = createEmptyGameState();
    const stateWithWhiteCardInHand = updateCardState(state, (c) => ({
      ...c,
      white: { ...c.white, inHand: [commandCards[0]] },
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
      eventType: 'playerChoice',
      choiceType: 'commitToRangedAttack',
      player: 'white',
      committedCard: commandCards[0],
      modifierTypes: [],
    };

    const newState = applyCommitToRangedAttackEvent(event, stateInPhase);
    const newRanged = getRangedAttackResolutionState(newState);

    expect(newRanged.defendingCommitment).toEqual({
      commitmentType: 'completed',
      card: commandCards[0],
    });
    expect(newState.cardState.white.inHand).toHaveLength(0);
  });
});

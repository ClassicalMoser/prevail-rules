import type { StandardBoard } from '@entities';
import type { CommitToMovementEvent } from '@events';
import { getMovementResolutionState } from '@queries';
import { commandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
} from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyCommitToMovementEvent } from './applyCommitToMovementEvent';

describe('applyCommitToMovementEvent', () => {
  it('completes black commitment and discards card from hand', () => {
    const state = createEmptyGameState();
    const stateWithBlackCardInHand = updateCardState(state, (c) => ({
      ...c,
      black: { ...c.black, inHand: [commandCards[0]] },
    }));
    const movementState = createMovementResolutionState(
      stateWithBlackCardInHand,
      {
        commitment: { commitmentType: 'pending' },
      },
    );
    const stateInPhase = updatePhaseState(
      stateWithBlackCardInHand,
      createIssueCommandsPhaseState(stateWithBlackCardInHand, {
        currentCommandResolutionState: movementState,
      }),
    );
    const event: CommitToMovementEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'commitToMovement',
      player: 'black',
      committedCard: commandCards[0],
      modifierTypes: [],
    };

    const newState = applyCommitToMovementEvent(event, stateInPhase);
    const newMovement = getMovementResolutionState(newState);

    expect(newMovement.commitment).toEqual({
      commitmentType: 'completed',
      card: commandCards[0],
    });
    expect(newState.cardState.black.inHand).toHaveLength(0);
  });

  it('completes white commitment and discards card from hand', () => {
    const state = createEmptyGameState();
    const stateWithWhiteCardInHand = updateCardState(state, (c) => ({
      ...c,
      white: { ...c.white, inHand: [commandCards[0]] },
    }));
    const movementState = createMovementResolutionState(
      stateWithWhiteCardInHand,
      {
        commitment: { commitmentType: 'pending' },
      },
    );
    const stateInPhase = updatePhaseState(
      stateWithWhiteCardInHand,
      createIssueCommandsPhaseState(stateWithWhiteCardInHand, {
        currentCommandResolutionState: movementState,
      }),
    );
    const event: CommitToMovementEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'commitToMovement',
      player: 'white',
      committedCard: commandCards[0],
      modifierTypes: [],
    };

    const newState = applyCommitToMovementEvent(event, stateInPhase);
    const newMovement = getMovementResolutionState(newState);

    expect(newMovement.commitment).toEqual({
      commitmentType: 'completed',
      card: commandCards[0],
    });
    expect(newState.cardState.white.inHand).toHaveLength(0);
  });

  it('does not mutate the input state', () => {
    const state = createEmptyGameState();
    const stateWithBlackCardInHand = updateCardState(state, (c) => ({
      ...c,
      black: { ...c.black, inHand: [commandCards[0]] },
    }));
    const movementState = createMovementResolutionState(
      stateWithBlackCardInHand,
      {
        commitment: { commitmentType: 'pending' },
      },
    );
    const stateInPhase = updatePhaseState(
      stateWithBlackCardInHand,
      createIssueCommandsPhaseState(stateWithBlackCardInHand, {
        currentCommandResolutionState: movementState,
      }),
    );
    const event: CommitToMovementEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'commitToMovement',
      player: 'black',
      committedCard: commandCards[0],
      modifierTypes: [],
    };

    const handBefore = [...stateInPhase.cardState.black.inHand];
    const commitmentBefore =
      getMovementResolutionState(stateInPhase).commitment;

    applyCommitToMovementEvent(event, stateInPhase);

    expect(stateInPhase.cardState.black.inHand).toEqual(handBefore);
    expect(getMovementResolutionState(stateInPhase).commitment).toEqual(
      commitmentBefore,
    );
  });
});

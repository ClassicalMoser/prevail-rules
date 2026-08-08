import type { CommitToMovementEvent } from '@events';
import {
  getFrontEngagementStateFromMovement,
  getMovementResolutionState,
} from '@queries';
import { tempCommandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyCommitToMovementEvent } from './applyCommitToMovementEvent';

/**
 * Movement command commitment: pending `commitment` on the movement CRS becomes completed with
 * the played card, and that card is removed from the moving player’s hand.
 */
describe(applyCommitToMovementEvent, () => {
  it('given black pending movement and one card in hand, commitment completed and hand empty', () => {
    const state = createEmptyGameState();
    const stateWithBlackCardInHand = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inHand: [tempCommandCards[0]] },
    });
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
    const event: CommitToMovementEvent = {
      choiceType: 'commitToMovement',
      committedCard: tempCommandCards[0],
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'black',
    };

    const newState = applyCommitToMovementEvent(event, stateInPhase);
    const newMovement = getMovementResolutionState(newState);

    expect(newMovement.commitment).toStrictEqual({
      card: tempCommandCards[0],
      commitmentType: 'completed',
    });
    expect(newState.cardState.black.inHand).toHaveLength(0);
  });

  it('given white pending movement and one card in hand, same shape for white side', () => {
    const state = createEmptyGameState();
    const stateWithWhiteCardInHand = updateCardState(state, {
      ...state.cardState,
      white: { ...state.cardState.white, inHand: [tempCommandCards[0]] },
    });
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
    const event: CommitToMovementEvent = {
      choiceType: 'commitToMovement',
      committedCard: tempCommandCards[0],
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'white',
    };

    const newState = applyCommitToMovementEvent(event, stateInPhase);
    const newMovement = getMovementResolutionState(newState);

    expect(newMovement.commitment).toStrictEqual({
      card: tempCommandCards[0],
      commitmentType: 'completed',
    });
    expect(newState.cardState.white.inHand).toHaveLength(0);
  });

  it('given front engagement refuse (null card), declines defensiveCommitment without discarding', () => {
    const state = createEmptyGameState();
    const card = tempCommandCards[0]!;
    const withWhiteCard = updateCardState(state, {
      ...state.cardState,
      white: { ...state.cardState.white, inHand: [card] },
    });
    const movementState = createMovementResolutionState(withWhiteCard, {
      commitment: { commitmentType: 'declined' },
      engagementState: createFrontEngagementState(),
    });
    const stateInPhase = updatePhaseState(
      withWhiteCard,
      createIssueCommandsPhaseState(withWhiteCard, {
        currentCommandResolutionState: movementState,
      }),
    );
    const event: CommitToMovementEvent = {
      choiceType: 'commitToMovement',
      committedCard: null,
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'white',
    };

    const newState = applyCommitToMovementEvent(event, stateInPhase);
    const front = getFrontEngagementStateFromMovement(newState);

    expect(front.engagementResolutionState.defensiveCommitment).toStrictEqual({
      commitmentType: 'declined',
    });
    expect(newState.cardState.white.inHand).toStrictEqual([card]);
  });

  it('given front engagement defensive commit pending, completes defensiveCommitment and leaves mover commitment declined', () => {
    const state = createEmptyGameState();
    const card = tempCommandCards[0]!;
    const withWhiteCard = updateCardState(state, {
      ...state.cardState,
      white: { ...state.cardState.white, inHand: [card] },
    });
    const movementState = createMovementResolutionState(withWhiteCard, {
      commitment: { commitmentType: 'declined' },
      engagementState: createFrontEngagementState(),
    });
    const stateInPhase = updatePhaseState(
      withWhiteCard,
      createIssueCommandsPhaseState(withWhiteCard, {
        currentCommandResolutionState: movementState,
      }),
    );
    const event: CommitToMovementEvent = {
      choiceType: 'commitToMovement',
      committedCard: card,
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: ['speed'],
      player: 'white',
    };

    const newState = applyCommitToMovementEvent(event, stateInPhase);
    const newMovement = getMovementResolutionState(newState);
    const front = getFrontEngagementStateFromMovement(newState);

    expect(newMovement.commitment).toStrictEqual({
      commitmentType: 'declined',
    });
    expect(front.engagementResolutionState.defensiveCommitment).toStrictEqual({
      card,
      commitmentType: 'completed',
    });
    expect(newState.cardState.white.inHand).toHaveLength(0);
  });

  it('given hand and commitment snapshot before apply, input state hand and movement slice unchanged', () => {
    const state = createEmptyGameState();
    const stateWithBlackCardInHand = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inHand: [tempCommandCards[0]] },
    });
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
    const event: CommitToMovementEvent = {
      choiceType: 'commitToMovement',
      committedCard: tempCommandCards[0],
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'black',
    };

    const handBefore = [...stateInPhase.cardState.black.inHand];
    const commitmentBefore =
      getMovementResolutionState(stateInPhase).commitment;

    applyCommitToMovementEvent(event, stateInPhase);

    expect(stateInPhase.cardState.black.inHand).toStrictEqual(handBefore);
    expect(getMovementResolutionState(stateInPhase).commitment).toStrictEqual(
      commitmentBefore,
    );
  });
});

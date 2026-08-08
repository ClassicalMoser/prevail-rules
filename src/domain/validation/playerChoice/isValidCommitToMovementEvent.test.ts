import type { CommitToMovementEvent } from '@events';
import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidCommitToMovementEvent } from './isValidCommitToMovementEvent';

const moveCard = tempCommandCards[4];
const strikeCard = tempCommandCards[0];

/**
 * IsValidCommitToMovementEvent: membership against getLegalCommitToMovementEvents.
 */
describe(isValidCommitToMovementEvent, () => {
  function stateBlackPendingCommit() {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        awaitingPlay: null,
        inHand: [moveCard],
        inPlay: null,
      },
    });
    const movement = createMovementResolutionState(withCards, {
      commitment: { commitmentType: 'pending' },
    });
    return updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: movement,
      }),
    );
  }

  it('accepts committing the in-hand card with all of its movement modifiers', () => {
    const state = stateBlackPendingCommit();
    const event: CommitToMovementEvent = {
      choiceType: 'commitToMovement',
      committedCard: moveCard,
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: ['speed'],
      player: 'black',
    };

    expect(isValidCommitToMovementEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts refusing with null card and empty modifiers', () => {
    const state = stateBlackPendingCommit();
    const event: CommitToMovementEvent = {
      choiceType: 'commitToMovement',
      committedCard: null,
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'black',
    };

    expect(isValidCommitToMovementEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects committing with an empty modifier list', () => {
    const state = stateBlackPendingCommit();
    const event: CommitToMovementEvent = {
      choiceType: 'commitToMovement',
      committedCard: moveCard,
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'black',
    };

    expect(isValidCommitToMovementEvent(event, state).result).toBe(false);
  });

  it('rejects a card that is not in hand', () => {
    const state = stateBlackPendingCommit();
    const event: CommitToMovementEvent = {
      choiceType: 'commitToMovement',
      committedCard: strikeCard,
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: ['speed'],
      player: 'black',
    };

    expect(isValidCommitToMovementEvent(event, state).result).toBe(false);
  });

  it('rejects when commit is not expected', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event: CommitToMovementEvent = {
      choiceType: 'commitToMovement',
      committedCard: moveCard,
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: ['speed'],
      player: 'black',
    };

    expect(isValidCommitToMovementEvent(event, state).result).toBe(false);
  });
});

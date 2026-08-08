import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getLegalCommitToMovementEvents } from './getLegalCommitToMovementEvents';

/** Move: modifiers ['speed'] — eligible for commitToMovement. */
const moveCard = tempCommandCards[4];
/** Strike: modifiers ['attack'] — not eligible for commitToMovement. */
const strikeCard = tempCommandCards[0];

/**
 * GetLegalCommitToMovementEvents: one CommitToMovementEvent per eligible
 * in-hand card (has ≥1 movement modifier); modifierTypes are all of that
 * card's movement modifiers.
 */
describe(getLegalCommitToMovementEvents, () => {
  function stateBlackPendingMovementCommit(hand = [moveCard]) {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        awaitingPlay: null,
        inHand: hand,
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

  it('returns one event per hand card with all of its movement modifiers applied', () => {
    const state = stateBlackPendingMovementCommit([moveCard]);

    expect(getLegalCommitToMovementEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToMovement',
        committedCard: moveCard,
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: ['speed'],
        player: 'black',
      },
    ]);
  });

  it('skips cards with no movement-applicable modifiers', () => {
    const state = stateBlackPendingMovementCommit([strikeCard, moveCard]);

    expect(getLegalCommitToMovementEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToMovement',
        committedCard: moveCard,
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: ['speed'],
        player: 'black',
      },
    ]);
  });

  it('returns events for the front-engagement defender when defensive commitment is pending', () => {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, {
      ...base.cardState,
      white: {
        ...base.cardState.white,
        awaitingPlay: null,
        inHand: [moveCard],
        inPlay: null,
      },
    });
    const movement = createMovementResolutionState(withCards, {
      engagementState: createFrontEngagementState(),
    });
    const state = updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: movement,
      }),
    );

    expect(getLegalCommitToMovementEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToMovement',
        committedCard: moveCard,
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: ['speed'],
        player: 'white',
      },
    ]);
  });

  it('returns empty when not in issueCommands movement commitment', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(getLegalCommitToMovementEvents(state)).toStrictEqual([]);
  });

  it('returns empty when the pending player has no eligible cards in hand', () => {
    const state = stateBlackPendingMovementCommit([strikeCard]);
    expect(getLegalCommitToMovementEvents(state)).toStrictEqual([]);
  });
});

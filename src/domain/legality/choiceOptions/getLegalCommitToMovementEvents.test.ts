import { PLAY_CARDS_PHASE } from '@game';
import {
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getLegalCommitToMovementEvents } from './getLegalCommitToMovementEvents';

import { createEmptyGameState } from '@factories';
/** Eligible: carries a movement-applicable speed modifier. */
const speedCard = createTestCard({ modifiers: ['speed'] });
/** Not eligible: attack is a combat modifier, not a movement one. */
const attackCard = createTestCard({ modifiers: ['attack'] });

/**
 * GetLegalCommitToMovementEvents: one CommitToMovementEvent per eligible
 * in-hand card (has ≥1 movement modifier); modifierTypes are all of that
 * card's movement modifiers.
 */
describe('getLegalCommitToMovementEvents function', () => {
  function stateBlackPendingMovementCommit(hand = [speedCard]) {
    const base = createEmptyGameState('standard');
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

  const refuseBlack = {
    choiceType: 'commitToMovement' as const,
    committedCard: null,
    eventNumber: 0,
    eventType: 'playerChoice' as const,
    modifierTypes: [] as const,
    player: 'black' as const,
  };

  it('returns one event per eligible card plus a refuse option', () => {
    const state = stateBlackPendingMovementCommit([speedCard]);

    expect(getLegalCommitToMovementEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToMovement',
        committedCard: speedCard,
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: ['speed'],
        player: 'black',
      },
      refuseBlack,
    ]);
  });

  it('skips cards with no movement-applicable modifiers but still offers refuse', () => {
    const state = stateBlackPendingMovementCommit([attackCard, speedCard]);

    expect(getLegalCommitToMovementEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToMovement',
        committedCard: speedCard,
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: ['speed'],
        player: 'black',
      },
      refuseBlack,
    ]);
  });

  it('returns events for the front-engagement defender when defensive commitment is pending', () => {
    const base = createEmptyGameState('standard');
    const withCards = updateCardState(base, {
      ...base.cardState,
      white: {
        ...base.cardState.white,
        awaitingPlay: null,
        inHand: [speedCard],
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
        committedCard: speedCard,
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: ['speed'],
        player: 'white',
      },
      {
        choiceType: 'commitToMovement',
        committedCard: null,
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: [],
        player: 'white',
      },
    ]);
  });

  it('returns empty when not in issueCommands movement commitment', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(getLegalCommitToMovementEvents(state)).toStrictEqual([]);
  });

  it('returns only refuse when the pending player has no eligible cards in hand', () => {
    const state = stateBlackPendingMovementCommit([attackCard]);
    expect(getLegalCommitToMovementEvents(state)).toStrictEqual([refuseBlack]);
  });
});

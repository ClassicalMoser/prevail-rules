import type { CommitToMeleeEvent } from '@events';
import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidCommitToMeleeEvent } from './isValidCommitToMeleeEvent';

/**
 * IsValidCommitToMeleeEvent: membership against getLegalCommitToMeleeEvents.
 */
describe(isValidCommitToMeleeEvent, () => {
  function stateWhitePendingCommit() {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const withCards = updateCardState(base, {
      ...base.cardState,
      white: {
        ...base.cardState.white,
        awaitingPlay: null,
        inHand: [tempCommandCards[0]],
        inPlay: null,
      },
    });
    const melee = createMeleeResolutionState(withCards, {
      whiteCommitment: { commitmentType: 'pending' },
    });
    return updatePhaseState(
      withCards,
      createResolveMeleePhaseState(withCards, {
        currentMeleeResolutionState: melee,
      }),
    );
  }

  it('accepts committing the in-hand card with all of its melee modifiers', () => {
    const state = stateWhitePendingCommit();
    const event: CommitToMeleeEvent = {
      choiceType: 'commitToMelee',
      committedCard: tempCommandCards[0],
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: ['attack'],
      player: 'white',
    };

    expect(isValidCommitToMeleeEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects committing with an empty modifier list', () => {
    const state = stateWhitePendingCommit();
    const event: CommitToMeleeEvent = {
      choiceType: 'commitToMelee',
      committedCard: tempCommandCards[0],
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'white',
    };

    expect(isValidCommitToMeleeEvent(event, state).result).toBe(false);
  });

  it('rejects a card that is not in hand', () => {
    const state = stateWhitePendingCommit();
    const event: CommitToMeleeEvent = {
      choiceType: 'commitToMelee',
      committedCard: tempCommandCards[2],
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: ['attack'],
      player: 'white',
    };

    expect(isValidCommitToMeleeEvent(event, state).result).toBe(false);
  });

  it('rejects when commit is not expected', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event: CommitToMeleeEvent = {
      choiceType: 'commitToMelee',
      committedCard: tempCommandCards[0],
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: ['attack'],
      player: 'white',
    };

    expect(isValidCommitToMeleeEvent(event, state).result).toBe(false);
  });

  it('accepts refusing the melee commitment', () => {
    const state = stateWhitePendingCommit();
    const event: CommitToMeleeEvent = {
      choiceType: 'commitToMelee',
      committedCard: null,
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'white',
    };

    expect(isValidCommitToMeleeEvent(event, state)).toStrictEqual({
      result: true,
    });
  });
});

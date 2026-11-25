import { tempCommandCards } from '@sampleValues';
import type { CommitToMeleeEvent } from '@events';
import { getMeleeResolutionState } from '@queries';
import {
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  updateCardState,
} from '@testing';

import {
  updatePhaseState,
  updateCurrentInitiative,
} from '@transforms/pureTransforms';

import { applyCommitToMeleeEvent } from './applyCommitToMeleeEvent';

import { createEmptyGameState } from '@factories';
/**
 * Melee commitment: pending side locks in their played command card (and empty modifiers here),
 * moves the card out of hand, and marks `secondPlayerCommitment` / `firstPlayerCommitment` completed.
 */
describe('applyCommitToMeleeEvent function', () => {
  it('given white pending and one card in hand, commit completes white and empties white hand', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const stateWithWhiteCardInHand = updateCardState(state, {
      ...state.cardState,
      white: { ...state.cardState.white, inHand: [tempCommandCards[0]] },
    });
    const meleeState = createMeleeResolutionState(stateWithWhiteCardInHand, {
      secondPlayerCommitment: { commitmentType: 'pending' },
    });
    const stateInPhase = updatePhaseState(
      stateWithWhiteCardInHand,
      createResolveMeleePhaseState(stateWithWhiteCardInHand, {
        currentMeleeResolutionState: meleeState,
      }),
    );
    const event: CommitToMeleeEvent = {
      choiceType: 'commitToMelee',
      committedCard: tempCommandCards[0],
      eventType: 'playerChoice',
      player: 'white',
    };

    const newState = applyCommitToMeleeEvent(event, stateInPhase);
    const newMelee = getMeleeResolutionState(newState);

    expect(newMelee.secondPlayerCommitment).toStrictEqual({
      card: tempCommandCards[0],
      commitmentType: 'completed',
    });
    expect(newState.cardState.white.inHand).not.toContainEqual(
      expect.objectContaining({ id: tempCommandCards[0].id }),
    );
    expect(newState.cardState.white.inHand).toHaveLength(0);
  });

  it('records the card the hand holds, not the copy the commitment names', () => {
    // White, second to commit, holds one card committable for Attack.
    const held = tempCommandCards[0];
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const withHand = updateCardState(state, {
      ...state.cardState,
      white: { ...state.cardState.white, inHand: [held] },
    });
    const melee = createMeleeResolutionState(withHand, {
      secondPlayerCommitment: { commitmentType: 'pending' },
    });
    const committing = updatePhaseState(
      withHand,
      createResolveMeleePhaseState(withHand, {
        currentMeleeResolutionState: melee,
      }),
    );

    // The commitment names that card, who it is, but prints it committable
    // for Defence as well.
    const claimed = {
      ...held,
      modifiers: [...held.modifiers, 'defense' as const],
    };
    const committed = applyCommitToMeleeEvent(
      {
        choiceType: 'commitToMelee',
        committedCard: claimed,
        eventType: 'playerChoice',
        player: 'white',
      },
      committing,
    );

    // The commitment holds the card White actually had, so its bonus is read
    // from what the card prints.
    expect(
      getMeleeResolutionState(committed).secondPlayerCommitment,
    ).toStrictEqual({ card: held, commitmentType: 'completed' });
  });

  it('given black pending and one card in hand, commit completes black and empties black hand', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const stateWithBlackCardInHand = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inHand: [tempCommandCards[0]] },
    });
    const meleeState = createMeleeResolutionState(stateWithBlackCardInHand, {
      firstPlayerCommitment: { commitmentType: 'pending' },
    });
    const stateInPhase = updatePhaseState(
      stateWithBlackCardInHand,
      createResolveMeleePhaseState(stateWithBlackCardInHand, {
        currentMeleeResolutionState: meleeState,
      }),
    );
    const event: CommitToMeleeEvent = {
      choiceType: 'commitToMelee',
      committedCard: tempCommandCards[0],
      eventType: 'playerChoice',
      player: 'black',
    };

    const newState = applyCommitToMeleeEvent(event, stateInPhase);
    const newMelee = getMeleeResolutionState(newState);

    expect(newMelee.firstPlayerCommitment).toStrictEqual({
      card: tempCommandCards[0],
      commitmentType: 'completed',
    });
    expect(newState.cardState.black.inHand).toHaveLength(0);
  });

  it('given white pending, refuse declines white and leaves hand intact', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const stateWithWhiteCardInHand = updateCardState(state, {
      ...state.cardState,
      white: { ...state.cardState.white, inHand: [tempCommandCards[0]] },
    });
    const meleeState = createMeleeResolutionState(stateWithWhiteCardInHand, {
      secondPlayerCommitment: { commitmentType: 'pending' },
    });
    const stateInPhase = updatePhaseState(
      stateWithWhiteCardInHand,
      createResolveMeleePhaseState(stateWithWhiteCardInHand, {
        currentMeleeResolutionState: meleeState,
      }),
    );
    const event: CommitToMeleeEvent = {
      choiceType: 'commitToMelee',
      committedCard: 'none',
      eventType: 'playerChoice',
      player: 'white',
    };

    const newState = applyCommitToMeleeEvent(event, stateInPhase);
    const newMelee = getMeleeResolutionState(newState);

    expect(newMelee.secondPlayerCommitment).toStrictEqual({
      commitmentType: 'declined',
    });
    expect(newState.cardState.white.inHand).toHaveLength(1);
  });
});

import { tempCommandCards } from '@sampleValues';
import type { CommitToMeleeEvent } from '@events';
import { getMeleeResolutionState } from '@queries';
import {
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
  updateCardState,
} from '@testing';

import { updatePhaseState } from '@transforms/pureTransforms';

import { applyCommitToMeleeEvent } from './applyCommitToMeleeEvent';

import { createEmptyGameState } from '@factories';
/**
 * Melee commitment: pending side locks in their played command card (and empty modifiers here),
 * moves the card out of hand, and marks `secondPlayerCommitment` / `firstPlayerCommitment` completed.
 */
describe('applyCommitToMeleeEvent function', () => {
  it('given white pending and one card in hand, commit completes white and empties white hand', () => {
    const state = createEmptyGameState('standard');
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
      modifierTypes: [],
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

  it('given black pending and one card in hand, commit completes black and empties black hand', () => {
    const state = createEmptyGameState('standard');
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
      modifierTypes: [],
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
    const state = createEmptyGameState('standard');
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
      committedCard: null,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'white',
    };

    const newState = applyCommitToMeleeEvent(event, stateInPhase);
    const newMelee = getMeleeResolutionState(newState);

    expect(newMelee.secondPlayerCommitment).toStrictEqual({
      commitmentType: 'declined',
    });
    expect(newState.cardState.white.inHand).toHaveLength(1);
  });

  it('records the card the hand held, not a copy that claims more', () => {
    // White holds one Attack card. The event names its id but lists Attack
    // three times, which would count three times over as a melee bonus
    // (§8.4) if the commitment took the event at its word. A commitment
    // records the card as the hand held it.
    const real = createTestCard({ modifiers: ['attack'] });
    const state = createEmptyGameState('standard');
    const withCard = updateCardState(state, {
      ...state.cardState,
      white: { ...state.cardState.white, inHand: [real] },
    });
    const melee = createMeleeResolutionState(withCard, {
      secondPlayerCommitment: { commitmentType: 'pending' },
    });
    const stateInPhase = updatePhaseState(
      withCard,
      createResolveMeleePhaseState(withCard, {
        currentMeleeResolutionState: melee,
      }),
    );
    const event: CommitToMeleeEvent = {
      choiceType: 'commitToMelee',
      committedCard: { ...real, modifiers: ['attack', 'attack', 'attack'] },
      eventType: 'playerChoice',
      modifierTypes: ['attack'],
      player: 'white',
    };

    const newState = applyCommitToMeleeEvent(event, stateInPhase);

    expect(
      getMeleeResolutionState(newState).secondPlayerCommitment,
    ).toStrictEqual({
      card: real,
      commitmentType: 'completed',
    });
  });
});

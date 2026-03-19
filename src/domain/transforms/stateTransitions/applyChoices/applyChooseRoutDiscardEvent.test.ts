import type { StandardBoard } from '@entities';
import type { ChooseRoutDiscardEvent } from '@events';
import { getCurrentRallyResolutionState } from '@queries';
import {
  createCleanupPhaseState,
  createEmptyGameState,
  createPlayCardsPhaseState,
  createRallyResolutionState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyChooseRoutDiscardEvent } from './applyChooseRoutDiscardEvent';

describe('applyChooseRoutDiscardEvent', () => {
  function createStateInResolveRallyWithRout(
    step: 'firstPlayerResolveRally' | 'secondPlayerResolveRally',
    player: 'white' | 'black',
  ) {
    const state = createEmptyGameState({ currentInitiative: 'white' });
    const unit = createTestUnit(player, { attack: 2 });
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: createRoutState(player, unit),
    });
    const phaseState = createCleanupPhaseState({
      step,
      firstPlayerRallyResolutionState:
        step === 'firstPlayerResolveRally' ? rallyState : undefined,
      secondPlayerRallyResolutionState:
        step === 'secondPlayerResolveRally' ? rallyState : undefined,
    });
    return updatePhaseState(state, phaseState);
  }

  it('sets cardsChosen true and keeps step when first player chooses rout discard', () => {
    const state = createStateInResolveRallyWithRout(
      'firstPlayerResolveRally',
      'white',
    );
    const event: ChooseRoutDiscardEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseRoutDiscard',
      player: 'white',
      cardIds: [],
    };

    const newState = applyChooseRoutDiscardEvent(event, state);
    const phase = newState.currentRoundState.currentPhaseState;
    const rallyState = getCurrentRallyResolutionState(newState);

    expect(phase?.phase).toBe('cleanup');
    expect(phase?.step).toBe('firstPlayerResolveRally');
    expect(rallyState.routState?.cardsChosen).toBe(true);
  });

  it('sets cardsChosen true and keeps step when second player chooses rout discard', () => {
    const state = createStateInResolveRallyWithRout(
      'secondPlayerResolveRally',
      'black',
    );
    const event: ChooseRoutDiscardEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseRoutDiscard',
      player: 'black',
      cardIds: [],
    };

    const newState = applyChooseRoutDiscardEvent(event, state);
    const phase = newState.currentRoundState.currentPhaseState;
    const rallyState = getCurrentRallyResolutionState(newState);

    expect(phase?.phase).toBe('cleanup');
    expect(phase?.step).toBe('secondPlayerResolveRally');
    expect(rallyState.routState?.cardsChosen).toBe(true);
  });

  it('throws when not in cleanup phase', () => {
    const state = createEmptyGameState();
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    const event: ChooseRoutDiscardEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseRoutDiscard',
      player: 'white',
      cardIds: [],
    };

    expect(() => applyChooseRoutDiscardEvent(event, stateInPlayCards)).toThrow(
      'Expected cleanup phase',
    );
  });

  it('throws when not on a resolveRally step', () => {
    const state = createEmptyGameState();
    const phaseState = createCleanupPhaseState({
      step: 'discardPlayedCards',
    });
    const stateInCleanup = updatePhaseState(state, phaseState);
    const event: ChooseRoutDiscardEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseRoutDiscard',
      player: 'white',
      cardIds: [],
    };

    expect(() => applyChooseRoutDiscardEvent(event, stateInCleanup)).toThrow(
      'Not in a resolveRally step',
    );
  });
});

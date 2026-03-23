import type { GameState, StandardBoard } from '@entities';
import { MOVE_COMMANDERS_PHASE } from '@entities';
import { commandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import { generateCompleteMoveCommandersPhaseEvent } from './generateCompleteMoveCommandersPhaseEvent';

describe('generateCompleteMoveCommandersPhaseEvent', () => {
  function createGameStateInCompleteStep(): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const stateWithCards = updateCardState(state, (current) => ({
      ...current,
      black: { ...current.black, inPlay: commandCards[0] },
      white: { ...current.white, inPlay: commandCards[1] },
    }));
    return updatePhaseState(stateWithCards, {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    });
  }

  it('should return a completeMoveCommandersPhase event with command sets', () => {
    const state = createGameStateInCompleteStep();

    const event = generateCompleteMoveCommandersPhaseEvent(state);

    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeMoveCommandersPhase');
    expect(event.remainingCommandsFirstPlayer).toEqual(
      new Set([commandCards[0].command]),
    );
    expect(event.remainingCommandsSecondPlayer).toEqual(
      new Set([commandCards[1].command]),
    );
  });

  it('should return empty command sets when inPlay is null', () => {
    const state = createEmptyGameState();
    const withoutInPlay = updateCardState(state, (current) => ({
      ...current,
      black: { ...current.black, inPlay: null },
      white: { ...current.white, inPlay: null },
    }));
    const stateWithPhase = updatePhaseState(withoutInPlay, {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    });

    const event = generateCompleteMoveCommandersPhaseEvent(stateWithPhase);

    expect(event.remainingCommandsFirstPlayer.size).toBe(0);
    expect(event.remainingCommandsSecondPlayer.size).toBe(0);
  });

  it('should reflect initiative when building first vs second command sets', () => {
    const base = createEmptyGameState({ currentInitiative: 'white' });
    const withCards = updateCardState(base, (current) => ({
      ...current,
      black: { ...current.black, inPlay: commandCards[0] },
      white: { ...current.white, inPlay: commandCards[1] },
    }));
    const state = updatePhaseState(withCards, {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    });

    const event = generateCompleteMoveCommandersPhaseEvent(state);

    expect(event.remainingCommandsFirstPlayer).toEqual(
      new Set([commandCards[1].command]),
    );
    expect(event.remainingCommandsSecondPlayer).toEqual(
      new Set([commandCards[0].command]),
    );
  });
});

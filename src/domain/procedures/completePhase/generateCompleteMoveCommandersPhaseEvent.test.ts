import { tempCommandCards } from '@sampleValues';
import type { GameState } from '@game';

import { MOVE_COMMANDERS_PHASE } from '@game';
import { createTestCard, createTestCommand, updateCardState } from '@testing';

import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { generateCompleteMoveCommandersPhaseEvent } from './generateCompleteMoveCommandersPhaseEvent';

import { createEmptyGameState } from '@factories';
/**
 * Move-commanders phase complete: each player’s `inPlay` command (if any) becomes
 * remaining issue-commands slots (lines ×N expand to N× number:1). First vs second
 * player sets follow `currentInitiative`.
 */
describe('generateCompleteMoveCommandersPhaseEvent function', () => {
  // Lines ×2 expands into two remaining number:1 slots.
  const multiLineCard = {
    ...createTestCard(),
    command: createTestCommand({ number: 2, size: 'lines' }),
  };

  /** Black initiative, both inPlay set, MOVE_COMMANDERS_PHASE step `complete`. */
  function createGameStateInCompleteStep(): GameState {
    const state = createEmptyGameState('standard');
    const stateWithCards = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: tempCommandCards[0] },
      white: { ...state.cardState.white, inPlay: tempCommandCards[1] },
    });
    return updatePhaseState(stateWithCards, {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    });
  }

  it('given both inPlay populated, maps each side command into remainingCommands sets', () => {
    const state = createGameStateInCompleteStep();

    const event = generateCompleteMoveCommandersPhaseEvent(state);

    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeMoveCommandersPhase');
    expect(event.remainingCommandsFirstPlayer).toStrictEqual([
      tempCommandCards[0].command,
    ]);
    expect(event.remainingCommandsSecondPlayer).toStrictEqual([
      tempCommandCards[1].command,
    ]);
  });

  it('throws when a player has no card in play, since every player reveals one before orders', () => {
    // Both players reached the end of the commander moves with no card in play.
    const state = createEmptyGameState('standard');
    const withoutInPlay = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: null },
      white: { ...state.cardState.white, inPlay: null },
    });
    const stateWithPhase = updatePhaseState(withoutInPlay, {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    });

    // Each player's revealed card grants the round's orders (§4.1.6); none in
    // play is a fault, not a round without orders.
    expect(() =>
      generateCompleteMoveCommandersPhaseEvent(stateWithPhase),
    ).toThrow('black has no card in play');
  });

  it('given white initiative, white command is first-player set and black is second', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: tempCommandCards[0] },
      white: { ...base.cardState.white, inPlay: tempCommandCards[1] },
    });
    const state = updatePhaseState(withCards, {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    });

    const event = generateCompleteMoveCommandersPhaseEvent(state);

    expect(event.remainingCommandsFirstPlayer).toStrictEqual([
      tempCommandCards[1].command,
    ]);
    expect(event.remainingCommandsSecondPlayer).toStrictEqual([
      tempCommandCards[0].command,
    ]);
  });

  it('given lines ×2 inPlay, expands into two number:1 remaining slots', () => {
    const state = createEmptyGameState('standard');
    const withMultiLine = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: multiLineCard },
      white: { ...state.cardState.white, inPlay: tempCommandCards[1] },
    });
    const inComplete = updatePhaseState(withMultiLine, {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    });

    const event = generateCompleteMoveCommandersPhaseEvent(inComplete);

    const expectedSlot = { ...multiLineCard.command, number: 1 };
    expect(event.remainingCommandsFirstPlayer).toStrictEqual([
      expectedSlot,
      expectedSlot,
    ]);
    expect(event.remainingCommandsSecondPlayer).toStrictEqual([
      tempCommandCards[1].command,
    ]);
  });
});

import type { CompletePlayCardsPhaseEvent } from '@events';
import { createEmptyGameState } from '@factories';
import { getCurrentPhaseState } from '@queries';
import {
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
  withLostCommander,
} from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyCompletePlayCardsPhaseEvent } from './applyCompletePlayCardsPhaseEvent';

/** The effect that ends card play; it carries nothing. */
const event: CompletePlayCardsPhaseEvent = {
  effectType: 'completePlayCardsPhase',
  eventType: 'gameEffect',
};

/**
 * Once both cards are in play and initiative is decided, Phase 2 opens with
 * the first player moving their commander (§4.2.1).
 */
describe('applyCompletePlayCardsPhaseEvent function', () => {
  it("opens Phase 2 on the first player's commander, and records card play as done", () => {
    // Black holds the initiative, and card play is complete.
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      createPlayCardsPhaseState({ step: 'complete' }),
    );

    const next = applyCompletePlayCardsPhaseEvent(event, state);

    // The first player's commander moves first.
    expect(getCurrentPhaseState(next)).toStrictEqual({
      phase: 'moveCommanders',
      step: 'moveFirstCommander',
    });

    // No query reads the round's record of finished phases, so the field is
    // read as written: Phase 1, as it ended.
    expect(next.currentRoundState.completedPhases).toStrictEqual([
      { phase: 'playCards', step: 'complete' },
    ]);
  });

  it('when the first player’s commander has fallen, Move Commanders still opens on the first player’s turn', () => {
    // Black holds initiative, but its commander was defeated (§4.2.8).
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const full = updatePhaseState(
      withLostCommander(base, 'black'),
      createPlayCardsPhaseState({ step: 'complete' }),
    );

    const next = applyCompletePlayCardsPhaseEvent(event, full);

    // The phase opens on Black's turn as always. Passing it over is
    // skipLostCommanderMove's, which the expected engine asks for.
    expect(getCurrentPhaseState(next).step).toBe('moveFirstCommander');
  });

  it('throws when the game is not playing cards', () => {
    // The commanders are already moving.
    const moving = updatePhaseState(
      createEmptyGameState('standard'),
      createMoveCommandersPhaseState(),
    );

    // Phase 1 ends only from Phase 1.
    expect(() => applyCompletePlayCardsPhaseEvent(event, moving)).toThrow(
      'Expected playCards phase, got moveCommanders',
    );
  });
});

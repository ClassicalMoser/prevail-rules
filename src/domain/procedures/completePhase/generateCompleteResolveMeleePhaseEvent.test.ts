import type { GameState } from '@game';

import { generateCompleteResolveMeleePhaseEvent } from './generateCompleteResolveMeleePhaseEvent';

import { createEmptyGameState } from '@factories';
/**
 * Closes the resolve-melee phase after all engagements are processed. Generator returns
 * only the `completeResolveMeleePhase` effect marker; no per-state branching in procedure.
 */
describe('generateCompleteResolveMeleePhaseEvent function', () => {
  it('given any game state, emits gameEffect with effectType completeResolveMeleePhase', () => {
    const state: GameState = createEmptyGameState('standard');
    const event = generateCompleteResolveMeleePhaseEvent(state);
    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('completeResolveMeleePhase');
  });

  it('given two separately constructed empty states, emits deeply equal events (state-independent)', () => {
    const a = generateCompleteResolveMeleePhaseEvent(
      createEmptyGameState('standard'),
    );
    const b = generateCompleteResolveMeleePhaseEvent(
      createEmptyGameState('standard'),
    );
    expect(a).toStrictEqual(b);
  });
});

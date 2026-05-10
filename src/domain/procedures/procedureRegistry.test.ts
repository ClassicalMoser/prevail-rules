import type { StandardBoard } from '@entities';
import type { GameStateForBoard } from '@game';
import type { GameEffectType } from '@events';
import { gameEffects } from '@events';
import {
  createEmptyGameState,
  procedureRegistryStateFactories,
} from '@testing';

import { generateEventFromProcedure } from './procedureRegistry';

/**
 * For each registered game effect, builds factory state and asserts the procedure emits a
 * matching `gameEffect` with the same `effectType`.
 */
describe(generateEventFromProcedure, () => {
  it.each([...gameEffects])(
    'given factory state for %s, returns gameEffect with matching effectType',
    (effectType) => {
      expect.hasAssertions();
      const state = procedureRegistryStateFactories[effectType]();
      const event = generateEventFromProcedure(state, 0, effectType);
      expect(event.eventType).toBe('gameEffect');
      expect(event.effectType).toBe(effectType);
    },
  );

  it('given effectType not in registry, throws naming the non-existent key', () => {
    expect.hasAssertions();
    const state: GameStateForBoard<StandardBoard> = createEmptyGameState();
    // Deliberate use of unsafe cast to GameEffectType to test the error message
    expect(() =>
      generateEventFromProcedure(state, 0, 'notARealEffect' as GameEffectType),
    ).toThrow('No procedure exists for effect type: notARealEffect');
  });
});

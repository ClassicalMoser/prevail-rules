import type { GameState } from '@game';
import type { GameEffectType } from '@events';
import { gameEffects } from '@events';
import type { RandomSource } from '@utils';
import { procedureRegistryStateFactories } from '@testing';

import { generateEventFromProcedure } from './procedureRegistry';

import { createEmptyGameState } from '@factories';
/**
 * For each registered game effect, builds factory state and asserts the procedure emits a
 * matching `gameEffect` with the same `effectType`.
 */
describe('generateEventFromProcedure function', () => {
  // Only the rally burn draws, and these cases check only the effect type.
  const anyDraw: RandomSource = { nextFloat: () => 0 };

  it.each([...gameEffects])(
    'given factory state for %s, returns gameEffect with matching effectType',
    (effectType) => {
      expect.hasAssertions();
      const state = procedureRegistryStateFactories[effectType]();
      const event = generateEventFromProcedure(state, effectType, anyDraw);
      expect(event.eventType).toBe('gameEffect');
      expect(event.effectType).toBe(effectType);
    },
  );

  it('given effectType not in registry, throws naming the non-existent key', () => {
    expect.hasAssertions();
    const state: GameState = createEmptyGameState('standard');
    // Deliberate use of unsafe cast to GameEffectType to test the error message
    expect(() =>
      generateEventFromProcedure(
        state,
        'notARealEffect' as GameEffectType,
        anyDraw,
      ),
    ).toThrow('No procedure exists for effect type: notARealEffect');
  });
});

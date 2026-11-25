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
    'hands %s to the procedure that builds that effect',
    (effectType) => {
      // A state on the step where the game owes this effect.
      const state = procedureRegistryStateFactories[effectType]();

      // The event built is the effect asked for: each type reaches its own
      // procedure, not a neighbour's.
      const event = generateEventFromProcedure(state, effectType, anyDraw);
      expect(event.eventType).toBe('gameEffect');
      expect(event.effectType).toBe(effectType);
    },
  );

  it('throws naming an effect type that has no procedure', () => {
    const state = createEmptyGameState('standard');
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

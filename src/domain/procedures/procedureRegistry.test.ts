import type { GameState, StandardBoard } from '@entities';
import type { GameEffectEvent, GameEffectType } from '@events';
import { gameEffects } from '@events';
import {
  createEmptyGameState,
  procedureRegistryStateFactories,
} from '@testing';
import { describe, expect, it } from 'vitest';

import { generateEventFromProcedure } from './procedureRegistry';

/**
 * Central dispatch: `generateEventFromProcedure` is overloaded per `effectType` literal.
 * Each row builds minimal valid state from `procedureRegistryStateFactories` and checks the
 * emitted `gameEffect` matches that key. `effectType as never` satisfies overload resolution
 * when the argument is a dynamic union element.
 */
describe('generateEventFromProcedure', () => {
  it.each([...gameEffects])(
    'given factory state for %s, returns gameEffect with matching effectType',
    (effectType) => {
      const state = procedureRegistryStateFactories[effectType]();
      const event = generateEventFromProcedure(
        state,
        0,
        effectType as never,
      ) as GameEffectEvent<StandardBoard, GameEffectType>;
      expect(event.eventType).toBe('gameEffect');
      expect(event.effectType).toBe(effectType);
    },
  );

  it('given effectType not in registry, throws naming the non-existent key', () => {
    const state: GameState<StandardBoard> = createEmptyGameState();
    expect(() =>
      generateEventFromProcedure(state, 0, 'notARealEffect' as never),
    ).toThrow('No procedure exists for effect type: notARealEffect');
  });
});

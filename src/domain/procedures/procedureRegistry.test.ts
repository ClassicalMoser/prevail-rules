import type { GameState, StandardBoard } from '@entities';
import type { GameEffectEvent, GameEffectType } from '@events';
import { gameEffects } from '@events';
import {
  createEmptyGameState,
  procedureRegistryStateFactories,
} from '@testing';
import { describe, expect, it } from 'vitest';

import { generateEventFromProcedure } from './procedureRegistry';

describe('generateEventFromProcedure', () => {
  it.each([...gameEffects])(
    'dispatches %s with a valid procedure state',
    (effectType) => {
      const state = procedureRegistryStateFactories[effectType]();
      const event = generateEventFromProcedure(
        state,
        effectType as never,
      ) as GameEffectEvent<StandardBoard, GameEffectType>;
      expect(event.eventType).toBe('gameEffect');
      expect(event.effectType).toBe(effectType);
    },
  );

  it('throws when effect type is not registered', () => {
    const state: GameState<StandardBoard> = createEmptyGameState();
    expect(() =>
      generateEventFromProcedure(state, 'notARealEffect' as never),
    ).toThrow('No procedure exists for effect type: notARealEffect');
  });
});

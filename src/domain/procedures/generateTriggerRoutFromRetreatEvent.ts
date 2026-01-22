import type { Board, GameState } from '@entities';
import type { TriggerRoutFromRetreatEvent } from '@events';
import { GAME_EFFECT_EVENT_TYPE } from '@events';

export function generateTriggerRoutFromRetreatEvent<TBoard extends Board>(
  _state: GameState<TBoard>,
): TriggerRoutFromRetreatEvent<TBoard, 'triggerRoutFromRetreat'> {
  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: 'triggerRoutFromRetreat',
  };
}

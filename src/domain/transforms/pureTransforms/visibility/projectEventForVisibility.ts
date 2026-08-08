import type { PlayerSide } from '@entities';
import type {
  Event,
  GameEffectEvent,
  ProjectedPlayerChoiceEvent,
} from '@events';

/** Event as delivered to one seat after hidden-information redaction. */
export type ProjectedEvent = ProjectedPlayerChoiceEvent | GameEffectEvent;

/**
 * Projects an authoritative event for a seated observer.
 * Opponent chooseCard / commit* card fields become `'hidden'`.
 * Game effects (including revealCards) pass through unchanged.
 */
export function projectEventForVisibility(
  event: Event,
  observerSide: PlayerSide,
): ProjectedEvent {
  if (event.eventType === 'gameEffect') {
    return event;
  }

  if (event.player === observerSide) {
    return event;
  }

  switch (event.choiceType) {
    case 'chooseCard': {
      return {
        ...event,
        card: 'hidden',
      };
    }
    case 'commitToMelee':
    case 'commitToMovement':
    case 'commitToRangedAttack': {
      return {
        ...event,
        committedCard: 'hidden',
      };
    }
    default: {
      return event;
    }
  }
}

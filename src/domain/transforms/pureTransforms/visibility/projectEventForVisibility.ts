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
 * Opponent chooseCard card fields become `'hidden'`.
 * Commits are public as soon as they are made, so the card is left intact.
 * Game effects (including revealCards) pass through unchanged.
 */
export function projectEventForVisibility(
  event: Event,
  observerSide: PlayerSide,
): ProjectedEvent {
  if (event.eventType === 'gameEffect') {
    // Game effects never need redaction.
    return event;
  }

  if (event.player === observerSide) {
    // The event is already visible to the observer.
    return event;
  }

  // Opponent case
  switch (event.choiceType) {
    case 'chooseCard': {
      // The card is hidden from the observer.
      return {
        ...event,
        card: 'hidden',
      };
    }
    default: {
      // Other event types pass through unchanged.
      return event;
    }
  }
}

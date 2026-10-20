import type { PlayerSide } from '@entities';
import type {
  Event,
  GameEffectEvent,
  ProjectedPlayerChoiceEvent,
} from '@events';

/** Event as delivered to one seat after hidden-information redaction. */
export type ProjectedEvent = ProjectedPlayerChoiceEvent | GameEffectEvent;

/**
 * Projects an authoritative event for one observer.
 * A seated observer sees their own chooseCard; the other seat's card becomes `'hidden'`.
 * A spectator sees neither chooseCard.
 * Commits are public as soon as they are made, so the card is left intact.
 * Game effects (including revealCards) pass through unchanged.
 */
export function projectEventForVisibility(
  event: Event,
  observer: PlayerSide | 'spectator',
): ProjectedEvent {
  if (event.eventType === 'gameEffect') {
    // Game effects never need redaction.
    return event;
  }

  if (observer !== 'spectator' && event.player === observer) {
    // The acting seat already sees this event. A spectator is neither seat.
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

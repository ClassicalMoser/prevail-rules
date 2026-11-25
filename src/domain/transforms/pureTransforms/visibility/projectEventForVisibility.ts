import type { PlayerSide } from '@entities';
import type { Event, ProjectedEvent } from '@events';

/**
 * Projects an authoritative event for one observer.
 * A seated observer sees their own chooseCard; the other seat's card becomes `'hidden'`.
 * A spectator sees neither chooseCard.
 * Commits are public as soon as they are made, so the card is left intact.
 * Game effects (including revealCards) pass through unchanged.
 *
 * `projectGameForVisibility` maps a game's whole stream through this, so a
 * client joining or resyncing folds the same events a seated client was
 * sent as they happened.
 *
 * @param event - The event as the server recorded it
 * @param observer - The seat the event is sent to, or a spectator
 * @returns The event as that observer may read it
 */
export function projectEventForVisibility(
  event: Event,
  observer: PlayerSide | 'spectator',
): ProjectedEvent {
  // This test also narrows the event to a player choice, which is what lets
  // `event.player` be read below; at run time a game effect would reach the
  // `default` branch and pass through just the same.
  if (event.eventType === 'gameEffect') {
    // Game effects never need redaction.
    // Nothing a game effect carries is secret: the cards it names were
    // revealed together (§4.1.2) or shown as they were spent (§1.4).
    return event;
  }

  // No player is `'spectator'`, so the first test only says in words what
  // the second already ensures.
  if (observer !== 'spectator' && event.player === observer) {
    // The acting seat already sees this event. A spectator is neither seat.
    // Its own choice, card and all.
    return event;
  }

  // Opponent case
  switch (event.choiceType) {
    case 'chooseCard': {
      // The card is hidden from the observer.
      // A card played in Phase 1 is laid face down and secret until both
      // are revealed (§4.1.1): the observer learns only that a card was
      // chosen.
      const faceDown: ProjectedEvent = {
        ...event,
        card: 'hidden',
      };

      // The choice with its card face down.
      return faceDown;
    }
    default: {
      // Other event types pass through unchanged.
      // Every other choice is made in the open: a commitment is revealed as
      // it is made, and a rout's Morale is paid face up (§1.4, §8).
      return event;
    }
  }
}

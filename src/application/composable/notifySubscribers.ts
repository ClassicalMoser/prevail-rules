import type { GameStateChange, GameStateSubscriber } from '@application/ports';

/**
 * Tells every subscriber to a game of a change to it, once that change is
 * already stored. A subscriber that fails hears of it through its own
 * `onError`, and the rest are still told: what the game has done stands
 * however a listener takes the news, so nothing here can fail the call that
 * made the change. Used by `recordEvent` and `startNewGame`.
 *
 * @param change - The game, its mode, and the state it now holds
 * @param gameStateSubscribers - Every subscriber; only those to this game are told
 */
export function notifySubscribers(
  change: GameStateChange,
  gameStateSubscribers: GameStateSubscriber[],
): void {
  for (const subscriber of gameStateSubscribers) {
    // A subscriber listens to one game, named by its id and mode.
    if (
      subscriber.gameId !== change.gameId ||
      subscriber.gameMode !== change.gameMode
    ) {
      continue;
    }

    // One subscriber's failure is its own: it is told, and the loop goes on
    // to the next. An `onError` that throws in turn is left to throw.
    try {
      subscriber.onGameStateChange(change);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      subscriber.onError(err);
    }
  }
}

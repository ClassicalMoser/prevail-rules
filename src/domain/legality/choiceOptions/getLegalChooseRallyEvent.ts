import type { ChooseRallyEvent } from '@events';
import type { GameState } from '@game';
import { createChooseRallyEvent } from '@factories';
import { getCleanupPhaseState, getRallyingPlayer } from '@queries';

/**
 * The rally choices open to the player whose turn it is to choose (§10.3).
 *
 * A rally burns a card from the played pile and takes the rest back, so it
 * can be chosen only while that pile holds something to burn. A player with
 * an empty pile may decline, and nothing else. In play the round's own card
 * is always in the pile by cleanup, so this guards a state the game does not
 * reach.
 *
 * @param gameState - The game, in a choose-rally step of cleanup
 * @returns The choices open to that player, declining always among them
 * @throws Error when cleanup is not on a choose-rally step
 */
export function getLegalChooseRallyEvent(
  gameState: GameState,
): ChooseRallyEvent[] {
  // Make sure we're in the choose rally step
  const phaseState = getCleanupPhaseState(gameState);
  if (
    phaseState.step !== 'firstPlayerChooseRally' &&
    phaseState.step !== 'secondPlayerChooseRally'
  ) {
    throw new Error('Not in choose rally step');
  }

  // The first player chooses first, then the second (§10.3).
  const choosingPlayer = getRallyingPlayer(gameState);

  // Rallying needs a card to burn; declining is always allowed.
  // Only hands are secret (§1.4): the played pile is in every view, so a seat
  // reads the opponent's as plainly as its own.
  // TODO(composition): this reads the played pile off the card state inline,
  // where only a query should walk the state (DESIGN.md, "Who reads and who
  // writes"). Settled by a `@queries/card` reader for a player's played pile,
  // or by a query that says whether a player has a card to burn.
  const canRally = gameState.cardState[choosingPlayer].played.length > 0;
  const performRallyChoices = canRally ? [true, false] : [false];

  // Each choice becomes the event that player would send to make it.
  const result = performRallyChoices.map((performRally) =>
    createChooseRallyEvent({
      performRally,
      player: choosingPlayer,
    }),
  );

  // What `isValidChooseRallyEvent` checks the player's answer against.
  return result;
}

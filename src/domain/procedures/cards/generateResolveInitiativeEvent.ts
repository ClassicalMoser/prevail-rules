import type { ResolveInitiativeEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_INITIATIVE_EFFECT_TYPE,
} from '@events';
import {
  calculateInitiative,
  getCardInPlay,
  getPlayCardsPhaseState,
} from '@queries';
/**
 * Generates a ResolveInitiativeEvent by calculating which player receives initiative
 * based on the cards currently in play.
 * The player with the lower initiative value receives initiative.
 * In a tie, the player who currently has initiative keeps it.
 *
 * @param state - The current game state
 * @returns A complete ResolveInitiativeEvent with the player who receives initiative
 * @throws Error if cards are not in play for both players
 *
 * @example
 * ```typescript
 * // After revealCards, cards are in inPlay
 * const event = generateResolveInitiativeEvent(state);
 *
 * // Apply to engine
 * const newState = applyEvent(event, state);
 *
 * // Event is now in the log with the initiative result baked in
 * ```
 */
export function generateResolveInitiativeEvent(
  state: GameState,
): ResolveInitiativeEvent {
  const phaseState = getPlayCardsPhaseState(state);

  if (phaseState.step !== 'assignInitiative') {
    throw new Error('Play cards phase is not on assignInitiative step');
  }

  const whiteCard = getCardInPlay(state.cardState, 'white');
  const blackCard = getCardInPlay(state.cardState, 'black');

  // Calculate which player receives initiative
  const playerWithInitiative = calculateInitiative(
    whiteCard,
    blackCard,
    state.currentInitiative,
  );

  return {
    effectType: RESOLVE_INITIATIVE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    player: playerWithInitiative,
  };
}

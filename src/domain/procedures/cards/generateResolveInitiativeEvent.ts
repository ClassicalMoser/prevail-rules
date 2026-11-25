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
 * @throws Error if the game is not on the assignInitiative step of play cards
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
  // Initiative is settled once both cards are face up, on its own step of
  // Phase 1 (§4.1.3). Asked on any other step, the procedure was asked out of
  // turn.
  const phaseState = getPlayCardsPhaseState(state);

  if (phaseState.step !== 'assignInitiative') {
    throw new Error('Play cards phase is not on assignInitiative step');
  }

  // The two cards just revealed, each now in play (§4.1.2). The reveal put
  // them there, so a side with no card in play is a fault in the state.
  const whiteCard = getCardInPlay(state.cardState, 'white');
  const blackCard = getCardInPlay(state.cardState, 'black');

  // Calculate which player receives initiative
  // The lower initiative value takes it, and on a tie it stays with whoever
  // already held it (§4.1.3, §4.1.4). The holder is read before this event
  // rewrites it.
  const playerWithInitiative = calculateInitiative(
    whiteCard,
    blackCard,
    state.currentInitiative,
  );

  // The comparison's answer goes on the event, so the apply only records it.
  const resolveInitiative: ResolveInitiativeEvent = {
    effectType: RESOLVE_INITIATIVE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    player: playerWithInitiative,
  };

  // The effect that makes this player the first player for the round (§4.1.5).
  return resolveInitiative;
}

import type { Board, GameState } from '@entities';
import type { ResolveInitiativeEvent } from '@events';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_INITIATIVE_EFFECT_TYPE,
} from '@events';
import { calculateInitiative } from '@queries';

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
export function generateResolveInitiativeEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ResolveInitiativeEvent<TBoard, 'resolveInitiative'> {
  const phaseState = state.currentRoundState.currentPhaseState;

  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  if (phaseState.phase !== 'playCards') {
    throw new Error('Current phase is not playCards');
  }

  if (phaseState.step !== 'assignInitiative') {
    throw new Error('Play cards phase is not on assignInitiative step');
  }

  const whiteCard = state.cardState.white.inPlay;
  const blackCard = state.cardState.black.inPlay;

  if (!whiteCard) {
    throw new Error('White player has no card in play');
  }

  if (!blackCard) {
    throw new Error('Black player has no card in play');
  }

  // Calculate which player receives initiative
  const playerWithInitiative = calculateInitiative(
    whiteCard,
    blackCard,
    state.currentInitiative,
  );

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_INITIATIVE_EFFECT_TYPE,
    player: playerWithInitiative,
  };
}

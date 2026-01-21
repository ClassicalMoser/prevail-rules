import type { Board, GameState } from '@entities';
import type { GameEffectEvent, GameEffectType } from '@events';
import { generateResolveRallyEvent } from './generateResolveRallyEvent';
import { generateResolveUnitsBrokenEvent } from './generateResolveUnitsBrokenEvent';

/**
 * Generates a game effect event using the appropriate procedure
 * based on the effect type.
 * Procedures are non-deterministic (they generate randomness);
 * the event (with results) is what makes it replayable.
 * TypeScript will enforce the correct return types based on the effect type.
 *
 * @param state - The current game state
 * @param effectType - The type of game effect to generate
 * @returns The generated game effect event with the specific type for the effect
 * @throws Error if the effect type doesn't have a procedure
 *
 * @example
 * ```typescript
 * // Generate resolveRally event (randomly selects card)
 * const event = generateEventFromProcedure(state, 'resolveRally');
 * // event is ResolveRallyEvent<TBoard, 'resolveRally'>
 *
 * // Generate resolveUnitsBroken event
 * const event = generateEventFromProcedure(state, 'resolveUnitsBroken');
 * // event is ResolveUnitsBrokenEvent<TBoard, 'resolveUnitsBroken'>
 * ```
 */
export function generateEventFromProcedure<
  TBoard extends Board,
  TGameEffectType extends GameEffectType,
>(
  state: GameState<TBoard>,
  effectType: TGameEffectType,
): GameEffectEvent<TBoard, TGameEffectType> {
  switch (effectType) {
    case 'resolveRally': {
      return generateResolveRallyEvent(state);
    }
    case 'resolveUnitsBroken': {
      return generateResolveUnitsBrokenEvent(state);
    }
    case 'completeCleanupPhase':
    case 'completeIssueCommandsPhase':
    case 'completeMoveCommandersPhase':
    case 'completePlayCardsPhase':
    case 'completeResolveMeleePhase':
    case 'discardPlayedCards':
    case 'resolveInitiative':
    case 'resolveEngagement':
    case 'resolveMelee':
    case 'resolveRangedAttack':
    case 'resolveRetreat':
    case 'resolveReverse':
    case 'resolveRout':
    case 'resolveRoutDiscard':
    case 'revealCards':
      throw new Error(`No procedure exists for effect type: ${effectType}`);

    default: {
      const _exhaustive: never = effectType;
      throw new Error(
        `No procedure exists for effect type: ${_exhaustive as string}`,
      );
    }
  }
}

import type { PlayerSide } from '@entities';
import type {
  CommandResolutionState,
  EngagementState,
  GameState,
  MeleeResolutionState,
} from '@game';
import { createEmptyGameState } from '@factories';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { createMovementResolutionState } from './commandResolutionStates';
import {
  createIssueCommandsPhaseState,
  createResolveMeleePhaseState,
} from './phaseStates';

/**
 * A game in Phase 3, the first player carrying out the order a spec built:
 * a move or a shot, or none chosen yet (`'pending'`). For a spec about what
 * that order holds, so the phase around it is the usual one.
 *
 * @param resolution - The order being carried out
 * @param base - The game to put it in; an empty standard game unless the spec
 * needs a board or cards of its own
 * @returns That game, carrying out the order
 */
export function createGameStateResolvingCommand(
  resolution: CommandResolutionState | 'pending',
  base: GameState = createEmptyGameState('standard'),
): GameState {
  // Phase 3 on the first player's resolve step, with this order under way.
  const phase = createIssueCommandsPhaseState(base, {
    currentCommandResolutionState: resolution,
  });
  const resolving = updatePhaseState(base, phase);
  return resolving;
}

/**
 * A game in Phase 4, fighting the melee a spec built, or with none chosen
 * yet (`'pending'`). Who holds the initiative decides whose unit is first and
 * whose second in it (§4.1.5), so a spec that depends on it says which.
 *
 * @param melee - The melee being fought
 * @param initiative - The side holding the initiative; White, as a new game
 * starts, unless the spec says otherwise
 * @returns An empty standard game fighting that melee
 */
export function createGameStateResolvingMelee(
  melee: MeleeResolutionState | 'pending',
  initiative: PlayerSide = 'white',
): GameState {
  // The empty game, with the initiative where the spec puts it.
  const base = updateCurrentInitiative(
    createEmptyGameState('standard'),
    initiative,
  );

  // Phase 4 on its one step, with this melee under way.
  const phase = createResolveMeleePhaseState(base, {
    currentMeleeResolutionState: melee,
  });
  const fighting = updatePhaseState(base, phase);
  return fighting;
}

/**
 * A game in Phase 3 carrying out a Move whose unit has walked into an enemy
 * with this engagement, or has not met anyone yet (`'pending'`).
 *
 * @param engagementState - The engagement the move reached
 * @returns An empty standard game carrying out that move
 */
export function createGameStateMovingInto(
  engagementState: EngagementState | 'pending',
): GameState {
  // The move, holding the engagement its unit walked into.
  const empty = createEmptyGameState('standard');
  const movement = createMovementResolutionState(empty, { engagementState });

  // That move is the order being carried out.
  const moving = createGameStateResolvingCommand(movement, empty);
  return moving;
}

import type { ResolveMeleeEvent } from '@events';
import type { GameState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_MELEE_EFFECT_TYPE } from '@events';
import {
  applyAttackValue,
  getMeleeResolutionReadyForAttackCalculation,
  getMeleeSupportValue,
  getMeleeCombatants,
  getMeleeCommitmentForPlayer,
  getRawUnitStat,
  modifiersFromCompletedCommitment,
} from '@queries';
/**
 * Generates a ResolveMeleeEvent by calculating attack values for both units
 * and determining the results (routed, reversed, retreated for each).
 *
 * Melee is bidirectional - both units attack each other simultaneously.
 *
 * Attack value calculation for each unit:
 * - Base attack stat
 * - + Melee support bonuses (from adjacent friendly units)
 * - + CommandCard modifiers (from committed cards)
 * - + Active card modifiers (if unit was commanded)
 * - + Round effect modifiers (if applicable)
 *
 * @param state - The current game state
 * @returns A complete ResolveMeleeEvent with location and results for both units
 * @throws Error if not in a valid state for melee resolution
 */
export function generateResolveMeleeEvent(state: GameState): ResolveMeleeEvent {
  const meleeState = getMeleeResolutionReadyForAttackCalculation(state);
  // The two units engaged in the melee's space.
  const { black: blackUnit, white: whiteUnit } = getMeleeCombatants(state);
  // Each side's card committed for its own unit (§8.4.1) adds to that unit's
  // blow; the melee holds the two in the order they were asked for.
  const whiteCommitment = getMeleeCommitmentForPlayer(
    state,
    meleeState,
    'white',
  );
  const whiteCommitmentModifiers =
    modifiersFromCompletedCommitment(whiteCommitment);

  // The unit's Attack is summed raw: the attack value adds support to it
  // and is floored once, as a whole, when it lands (§7.1.4).
  const whiteAttackValue = getRawUnitStat(
    whiteUnit.unit,
    'attack',
    state,
    whiteCommitmentModifiers,
  );

  const whiteSupportValue = getMeleeSupportValue(state.boardState, whiteUnit);

  const totalWhiteAttackValue = whiteAttackValue + whiteSupportValue;

  const blackCommitment = getMeleeCommitmentForPlayer(
    state,
    meleeState,
    'black',
  );
  const blackCommitmentModifiers =
    modifiersFromCompletedCommitment(blackCommitment);

  const blackAttackValue = getRawUnitStat(
    blackUnit.unit,
    'attack',
    state,
    blackCommitmentModifiers,
  );

  const blackSupportValue = getMeleeSupportValue(state.boardState, blackUnit);

  const totalBlackAttackValue = blackAttackValue + blackSupportValue;

  // Each side's attack is measured against the other unit's thresholds. A
  // Defence card committed by a side raises its own unit's thresholds for
  // this fight (§8.5); the rest of its card does nothing to the enemy's attack.
  // White unit attacks black unit
  const blackUnitResult = applyAttackValue(
    state,
    totalWhiteAttackValue,
    blackUnit.unit,
    blackCommitmentModifiers,
  );

  // Black unit attacks white unit
  const whiteUnitResult = applyAttackValue(
    state,
    totalBlackAttackValue,
    whiteUnit.unit,
    whiteCommitmentModifiers,
  );

  // Legal retreat hexes are computed when the retreat opens, not on this event.
  return {
    blackAttackResult: blackUnitResult,
    effectType: RESOLVE_MELEE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    whiteAttackResult: whiteUnitResult,
  };
}

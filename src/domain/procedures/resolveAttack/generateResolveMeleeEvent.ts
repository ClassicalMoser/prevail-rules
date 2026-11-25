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
  // The melee is fought only once both players have had their chance to
  // commit, the first player first (§7.2.2 steps 1–2), and only once: asking
  // before then, or after the results are written, throws there.
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

  // White's friends beside its fighter add to its attack (§7.3.1), counted
  // on the board as it stands now, before either unit is touched (§7.2.2
  // step 3).
  const whiteSupportValue = getMeleeSupportValue(state.boardState, whiteUnit);

  // White's attack value: Attack with its modifiers, plus support (§7.1.3).
  const totalWhiteAttackValue = whiteAttackValue + whiteSupportValue;

  // Black's side is counted the same way, from the same board: melee is
  // mutual and simultaneous, so neither blow is counted after the other
  // lands (§7.2.1). Black's own card is read the same way, first or second by
  // who holds the initiative.
  const blackCommitment = getMeleeCommitmentForPlayer(
    state,
    meleeState,
    'black',
  );
  const blackCommitmentModifiers =
    modifiersFromCompletedCommitment(blackCommitment);

  // Black's Attack, summed raw for the same reason as White's (§7.1.4).
  const blackAttackValue = getRawUnitStat(
    blackUnit.unit,
    'attack',
    state,
    blackCommitmentModifiers,
  );

  // Black's friends beside its fighter, on the same untouched board.
  const blackSupportValue = getMeleeSupportValue(state.boardState, blackUnit);

  // Black's attack value: Attack with its modifiers, plus support.
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
  // TODO(misleading): "hexes" — the board is square spaces (§2.1.1). Settle by
  // saying "spaces", or "retreats" as `getLegalRetreats` does.
  // The event records what each blow reached, by the colour of the unit it
  // struck; the transform writes each unit's apply, and the results are
  // carried out a stage at a time, the second player's unit first (§7.5.6).
  const resolved: ResolveMeleeEvent = {
    attackResultOnBlackUnit: blackUnitResult,
    attackResultOnWhiteUnit: whiteUnitResult,
    effectType: RESOLVE_MELEE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // Both results of the one exchange, for the transform to write.
  return resolved;
}

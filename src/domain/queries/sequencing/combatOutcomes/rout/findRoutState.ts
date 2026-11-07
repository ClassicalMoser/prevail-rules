import type { GameState, RoutState } from '@game';
import { isNone, isPending } from '@utils';
import { getOtherPlayer } from '@queries/player';
import { isOpenSubstep } from '../isOpenSubstep';

/**
 * The rout in play, or `undefined` when nothing is routing.
 *
 * Four places hold a rout: a rear engagement during a movement, the apply on a
 * ranged attack, either side's apply in a melee, and a rally during cleanup.
 * This walks them in sequencing order and answers.
 *
 * Nothing routing is an ordinary state — most of a game has no rout open — so
 * this reads each slot's own sentinel rather than asking a getter that would
 * throw. Callers that know a rout must be there use `getRoutState`.
 *
 * @param state - The game state
 * @returns The rout in play, or `undefined` when none is
 */
export function findRoutState(state: GameState): RoutState | undefined {
  // Setup has no phase yet, and asking before the round starts is fair.
  const phaseState = state.currentRoundState.currentPhaseState;
  if (isNone(phaseState)) {
    return undefined;
  }

  if (phaseState.phase === 'issueCommands') {
    const commandResolution = phaseState.currentCommandResolutionState;
    // Between commands there is nothing to rout from.
    if (isPending(commandResolution)) {
      return undefined;
    }

    if (commandResolution.commandResolutionType === 'movement') {
      // A movement routs the defender only by engaging it from the rear.
      const engagement = commandResolution.engagementState;
      if (isPending(engagement)) {
        return undefined;
      }
      const resolution = engagement.engagementResolutionState;
      if (resolution.engagementType !== 'rear') {
        return undefined;
      }
      const rearRout = resolution.routState;
      return rearRout;
    }

    // A ranged rout sits on the attack apply.
    const apply = commandResolution.attackApplyState;
    if (isPending(apply)) {
      return undefined;
    }
    const rangedRout = apply.routState;
    if (!isOpenSubstep(rangedRout)) {
      return undefined;
    }
    return rangedRout;
  }

  if (phaseState.phase === 'resolveMelee') {
    const melee = phaseState.currentMeleeResolutionState;
    if (isPending(melee)) {
      return undefined;
    }

    // Initiative order, matching the order the applies resolve in.
    const firstPlayer = state.currentInitiative;
    for (const player of [firstPlayer, getOtherPlayer(firstPlayer)]) {
      const sideApply = melee[`${player}AttackApplyState`];
      if (isPending(sideApply)) {
        continue;
      }
      const sideRout = sideApply.routState;
      if (isOpenSubstep(sideRout)) {
        return sideRout;
      }
    }
    return undefined;
  }

  if (phaseState.phase === 'cleanup') {
    // Choosing and resolving a rally share one slot per player.
    const firstPlayerStep =
      phaseState.step === 'firstPlayerChooseRally' ||
      phaseState.step === 'firstPlayerResolveRally';
    const rally = firstPlayerStep
      ? phaseState.firstPlayerRallyResolutionState
      : phaseState.secondPlayerRallyResolutionState;
    if (isPending(rally)) {
      return undefined;
    }
    const rallyRout = rally.routState;
    if (isPending(rallyRout)) {
      return undefined;
    }
    return rallyRout;
  }

  // Play-cards and move-commanders rout nobody.
  return undefined;
}

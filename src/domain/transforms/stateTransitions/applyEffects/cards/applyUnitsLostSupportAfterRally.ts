import type { PlayerSide, UnitInstance } from '@entities';
import type { CleanupPhaseState, GameState, RoutState } from '@game';
import { createOpenedRoutState } from '@factories';
import {
  getCleanupPhaseState,
  getNextStepForResolveRally,
  getPlayerUnitsWithPlacementOnBoard,
  getRallyResolutionStateAwaitingUnitSupport,
  hasUnitInArray,
} from '@queries';
import {
  routUnit,
  updateCleanupStep,
  updateRallyResolutionState,
} from '@transforms/pureTransforms';

/**
 * Routes uncovered (unsupported) units after rally support assignment:
 * removes them from the board, seeds rout discard when morale &gt; 0, and
 * either stays on the resolve-rally step or advances cleanup.
 * TODO(misleading): the rout opens for any uncovered unit, whatever its
 * Morale; a debt of zero is settled later by `resolveRout`, as the body says.
 * Settle by rewording "when morale > 0" (and the `&gt;` entity) to match.
 *
 * TODO(composition): this is not an effect apply. Its one caller is the
 * player choice `applyAssignUnitSupportEvent`, which deep-imports it from
 * here past the `cards/` barrel. Settle by moving it beside that caller, or
 * into `pureTransforms/` as the writer of the support check's outcome.
 *
 * The support check (§10.4): every unit the player's cards could not find a
 * place for routs, all at once, and its owner pays their summed Morale
 * (§10.4.6, §10.4.7). The player chose the places; this carries out what
 * their choice left uncovered.
 *
 * @param state - The game in Cleanup, on the rallying player's resolve step,
 * the burn done and the support check not yet made
 * @param player - The player who rallied; only their units are checked
 * (§10.4.1)
 * @param uncoveredUnits - Their units given no place, by identity
 * @returns The game with those units routed and the rout open, or, when
 * none was left uncovered, the rally over and Cleanup moved on
 * @throws Error when the game is not in Cleanup, or it is not that player's
 * support check. A unit named that is not on their side of the board is
 * passed over, not refused.
 */
export function applyUnitsLostSupportAfterRally<S extends GameState>(
  state: S,
  player: PlayerSide,
  uncoveredUnits: readonly UnitInstance[],
): S {
  // The rally whose support check this is: the cards are back in hand and the
  // check has not been made yet. The step after this player's rally is read
  // now, before anything changes, for the case where nothing routs.
  const phaseState = getCleanupPhaseState(state);
  const rallyState = getRallyResolutionStateAwaitingUnitSupport(state, player);
  const defaultNextStep = getNextStepForResolveRally(state);

  // The uncovered units as the board holds them, so the routed list and the
  // rout carry the state's own copy of each unit, not the caller's. Only the
  // rallying player's units are looked at: a rally checks no one else's army
  // (§10.4.1).
  const playerUnits = getPlayerUnitsWithPlacementOnBoard(state, player);
  const unitsToRout = [...playerUnits].filter((unitWithPlacement) =>
    hasUnitInArray(uncoveredUnits, unitWithPlacement.unit),
  );

  // Every uncovered unit leaves the board at once (§10.4.6).
  let newState = state;
  for (const unitWithPlacement of unitsToRout) {
    // Off the board and out of the game; the support check's rout takes no
    // commander with it (§10.4).
    newState = routUnit(newState, unitWithPlacement.unit);
  }

  // Uncovered units always open a rout. The discard debt (possibly zero) is
  // filled by resolveRout; a zero penalty closes that substep without a choice.
  // With every unit still supported, nothing routs.
  const routState: RoutState | 'bypassed' =
    unitsToRout.length > 0
      ? createOpenedRoutState(
          player,
          unitsToRout.map((u) => u.unit),
        )
      : 'bypassed';

  // The check is made: the rally records who lost their place, and the rout
  // that costs, if any. With nothing to pay the rally is over now; with a
  // rout open, `settleRout` closes it once the Morale is paid.
  const updatedRallyState = {
    ...rallyState,
    completed: unitsToRout.length === 0,
    routState,
    unitsLostSupport: unitsToRout.map((u) => u.unit),
  };

  // Stay on this step while a rout is open; otherwise advance cleanup.
  // An open rout keeps this player's rally going until its Morale is paid,
  // all before the second player decides (§10.3.6); `settleRout` moves
  // Cleanup on then. With nothing to pay, the rally is over now.
  // TODO(composition): the no-rout advance repeats `closeRally` in
  // `settleRout` (the rally closed, then `getNextStepForResolveRally`).
  // Settle by one writer for "this rally is over" that both call.
  const finalNextStep: CleanupPhaseState['step'] =
    unitsToRout.length > 0 ? phaseState.step : defaultNextStep;

  // The rally written back in its player's slot, then the step.
  const withRally = updateRallyResolutionState(
    newState,
    player,
    updatedRallyState,
  );
  const advanced = updateCleanupStep(withRally, finalNextStep);

  // The army that is left, and either the rout to pay or the next rally.
  return advanced;
}

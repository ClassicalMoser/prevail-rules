import type { MoveDelta } from '@entities';
import type { OpenRetreatFromAttackApplyEvent } from '@events';
import type { AttackApplyState, GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE,
} from '@events';
import { getLegalRetreats } from '@legality';
import { getAttackApplyAwaitingOpen, getPositionOfUnit } from '@queries';

/**
 * The retreats the apply's defender may make from where it stands now
 * (§9.1). Read from the board when the retreat opens, since an earlier
 * result in the same melee may have moved things (§7.5.6).
 *
 * @param state - The game state as the retreat opens
 * @param apply - The attack apply whose defender must retreat
 * @returns Each legal retreat as its path; empty when the unit must rout
 */
function retreatPathsFor(
  state: GameState,
  apply: AttackApplyState,
): MoveDelta[][] {
  // A retreat is a backward move from where the unit stands now (§9.1.1).
  // In a melee the other unit may already have fallen back or routed, and the
  // board as it is now is what bounds this unit's way back.
  const placement = getPositionOfUnit(state, apply.defendingUnit);

  // The smallest legal backward moves, the ties among them each kept (§9.1.3).
  // None at all means the unit cannot retreat and will rout instead (§9.1.6).
  const paths = getLegalRetreats(
    { placement, unit: apply.defendingUnit },
    state,
  );

  // Every retreat the unit may make, for the event to record.
  return paths;
}

/**
 * Builds the open-retreat-from-attack-apply effect. The attack already measured
 * a retreat; the apply it opens on is the state's to name, and this records the
 * retreats that apply's defender may make, so the log shows what was legal.
 *
 * @param state - A shot or a melee with a retreat waiting to open
 * @returns The event, carrying each legal retreat as its path
 * @throws Error when no retreat is waiting to open
 */
export function generateOpenRetreatFromAttackApplyEvent(
  state: GameState,
): OpenRetreatFromAttackApplyEvent {
  // The unit whose retreat comes due next: a shot's target, or in a melee the
  // second player's unit before the first player's (§7.5.6). Asking also
  // checks that a retreat is waiting to open, or the effect is not owed.
  const apply = getAttackApplyAwaitingOpen(state, 'retreat');

  // What was legal is measured now and written on the event, so the apply
  // only records it and a replay need not work it out again.
  const retreatPaths = retreatPathsFor(state, apply);

  const event: OpenRetreatFromAttackApplyEvent = {
    effectType: OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    retreatPaths,
  };

  // The retreat to open, carrying the unit's legal ways back.
  return event;
}

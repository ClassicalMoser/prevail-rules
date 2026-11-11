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
  const placement = getPositionOfUnit(state.boardState, apply.defendingUnit);
  const paths = getLegalRetreats(
    { placement, unit: apply.defendingUnit },
    state,
  );
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
  const apply = getAttackApplyAwaitingOpen(state, 'retreat');
  const event: OpenRetreatFromAttackApplyEvent = {
    effectType: OPEN_RETREAT_FROM_ATTACK_APPLY_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    retreatPaths: retreatPathsFor(state, apply),
  };
  return event;
}

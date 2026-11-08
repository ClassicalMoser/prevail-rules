import type { PlayerSide } from '@entities';
import type { RoutResolutionSource } from '@events';
import type {
  AttackApplyState,
  GameState,
  RetreatState,
  RoutState,
} from '@game';
import { isNone, isPending } from '@utils';
import { hasInitiative } from '@queries/player';
import { isOpenSubstep } from '../isOpenSubstep';

/** A rout slot, as a parent holds it before and after the substep opens. */
type RoutSlot = RoutState | 'pending' | 'bypassed';

/** A rout slot together with the parent holding it. */
interface RoutSlotLocation {
  /** The slot as its parent holds it, which may not be open yet. */
  routSlot: RoutSlot;
  /** The parent accountable for resolving it. */
  source: RoutResolutionSource;
}

/**
 * A rout and the parent accountable for resolving it.
 *
 * `resolveRout` carries the source so that applying it can write back to the
 * right parent without searching again, and this is where that source is
 * worked out.
 */
export interface RoutLocation {
  /** The open rout. */
  routState: RoutState;
  /** The parent accountable for resolving it. */
  source: RoutResolutionSource;
}

/**
 * The rout a retreat fell into.
 *
 * A defender with nowhere to go routs instead of giving ground, and that rout
 * is held by the retreat rather than by whatever forced the retreat.
 *
 * @param retreatSlot - The retreat slot on an apply or a front engagement
 * @returns The retreat's rout and its source, or `undefined` with no retreat
 */
function routOnRetreat(
  retreatSlot: RetreatState | 'pending' | 'bypassed',
): RoutSlotLocation | undefined {
  if (!isOpenSubstep(retreatSlot)) {
    return undefined;
  }
  const nested = {
    routSlot: retreatSlot.routState,
    source: 'retreat' as const,
  };
  return nested;
}

/**
 * The rout an attack apply is accountable for: the one the attack opened
 * outright, or the one its retreat fell into.
 *
 * A rout supersedes a retreat, so an apply never holds both.
 *
 * @param apply - The attack apply
 * @param source - Which attack this apply belongs to
 * @returns The rout this apply is accountable for, if it holds one
 */
function routOnAttackApply(
  apply: AttackApplyState,
  source: 'rangedAttack' | 'melee',
): RoutSlotLocation | undefined {
  if (isOpenSubstep(apply.routState)) {
    const ownRout = { routSlot: apply.routState, source };
    return ownRout;
  }
  const retreatRout = routOnRetreat(apply.retreatState);
  return retreatRout;
}

/**
 * The rout the context being resolved holds, whoever it belongs to.
 *
 * @param state - The game state
 * @param player - The player whose side of a melee to read
 * @returns The rout the current context holds, if it holds one
 */
function routInCurrentContext(
  state: GameState,
  player: PlayerSide,
): RoutSlotLocation | undefined {
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
      const engagement = commandResolution.engagementState;
      if (isPending(engagement)) {
        return undefined;
      }
      const resolution = engagement.engagementResolutionState;
      // Engaging from the rear routs the defender outright. Engaging from the
      // front makes it give ground, and only a defender with nowhere to go
      // routs from inside that retreat.
      if (resolution.engagementType === 'rear') {
        const rearRout = {
          routSlot: resolution.routState,
          source: 'rearEngagementMovement' as const,
        };
        return rearRout;
      }
      if (resolution.engagementType === 'front') {
        return routOnRetreat(resolution.retreatState);
      }
      // A flank engagement turns the defender and routs nobody.
      return undefined;
    }

    if (commandResolution.commandResolutionType === 'rangedAttack') {
      const apply = commandResolution.attackApplyState;
      if (isPending(apply)) {
        return undefined;
      }
      return routOnAttackApply(apply, 'rangedAttack');
    }

    // No other command reaches a defender.
    return undefined;
  }

  if (phaseState.phase === 'resolveMelee') {
    const melee = phaseState.currentMeleeResolutionState;
    if (isPending(melee)) {
      return undefined;
    }
    // Both sides strike at once, so both can be routing. The slots are named
    // for the order they resolve in, so the owner is placed in that order.
    const sideApply = hasInitiative(state, player)
      ? melee.firstPlayerAttackApplyState
      : melee.secondPlayerAttackApplyState;
    if (isPending(sideApply)) {
      return undefined;
    }
    return routOnAttackApply(sideApply, 'melee');
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
    const rallyRout = {
      routSlot: rally.routState,
      source: 'rally' as const,
    };
    return rallyRout;
  }

  // Play-cards and move-commanders rout nobody.
  return undefined;
}

/**
 * The rout this player owes cards for and the parent accountable for it, or
 * `undefined` when they are not routing.
 *
 * Five places hold a rout: the apply on a ranged attack, either side's apply
 * in a melee, a rear engagement during a movement, a rally during cleanup, and
 * a retreat that found nowhere to go — that last one nested inside a retreat,
 * which itself sits on an apply or a front engagement.
 *
 * A rout belongs to the player who discards for it. Asking without naming that
 * player has no answer in a melee, where both sides strike at once and both
 * can be routing, so the player is part of the question.
 *
 * TODO(misleading): no `@expected` code calls this, directly or through a
 * wrapper; `getExpectedRetreatEvent` reads the retreat's rout field itself.
 * Settled by deciding whether the sequencer should locate routs here.
 * Every layer that has to locate a rout reads it here: the sequencer to ask for
 * the next event, legality to enumerate the discard, the procedure to work out
 * the penalty. Nothing routing is an ordinary state, so this answers rather
 * than throwing.
 *
 * @param state - The game state
 * @param player - The player whose rout to find
 * @returns That player's rout and its parent, or `undefined` when they have none
 */
export function findRoutLocation(
  state: GameState,
  player: PlayerSide,
): RoutLocation | undefined {
  const location = routInCurrentContext(state, player);
  if (location === undefined || !isOpenSubstep(location.routSlot)) {
    return undefined;
  }
  // The context can hold the other player's rout, so finding one is not yet
  // finding this player's.
  if (location.routSlot.player !== player) {
    return undefined;
  }
  const found = { routState: location.routSlot, source: location.source };
  return found;
}

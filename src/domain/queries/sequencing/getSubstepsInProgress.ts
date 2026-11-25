import type {
  AttackApplyState,
  EngagementState,
  GameState,
  RetreatState,
  ReverseState,
  RoutState,
  SubstepState,
} from '@game';
import { isActive, isPending } from '@utils';
import type { AttackApplyStage } from './combatOutcomes/attackApply/attackApplyStages';
import { attackApplyStages } from './combatOutcomes/attackApply/attackApplyStages';
import { findNextMeleeAttackApplyToClose } from './combatOutcomes/attackApply/findNextMeleeAttackApplyToClose';
import { isOpenSubstep } from './combatOutcomes/isOpenSubstep';
import { findCurrentCommandResolutionState } from './commandResolution/findCurrentCommandResolutionState';
import { findMeleeResolutionState } from './meleeResolution/findMeleeResolutionState';
import { getMeleeAppliesInResolutionOrder } from './meleeResolution/getMeleeAppliesInResolutionOrder';
import { findRallyingPlayer } from './rallyResolution/cleanupPhase/findRallyingPlayer';
import { findRallyResolutionState } from './rallyResolution/findRallyResolutionState';

/** Whether a slot holds a substep that has opened and not yet completed. */
function isUnderWay<T extends { completed: boolean }>(
  slot: T | 'pending' | 'bypassed',
): slot is T {
  // Written, not skipped by the rules, and not yet finished: still being
  // carried out, so it belongs on the trail.
  return isOpenSubstep(slot) && !slot.completed;
}

/** Units routed, and the cards their player owes for them. */
function fromRout(slot: RoutState | 'pending' | 'bypassed'): SubstepState[] {
  // A rout opens nothing beneath it, so the trail ends here while its player
  // still owes the discard, and loses it once the discard is paid.
  return isUnderWay(slot) ? [slot] : [];
}

/** A unit turning to face its attacker. */
function fromReverse(
  slot: ReverseState | 'pending' | 'bypassed',
): SubstepState[] {
  // A reverse opens nothing beneath it either: the trail ends at the unit
  // turning about, and loses it once the unit has turned.
  return isUnderWay(slot) ? [slot] : [];
}

/** A unit falling back, and the rout it meets if it has nowhere to go (§9.1.6). */
function fromRetreat(
  slot: RetreatState | 'pending' | 'bypassed',
): SubstepState[] {
  // A retreat not yet opened, skipped, or already made adds nothing.
  if (!isUnderWay(slot)) {
    return [];
  }

  // The retreat is under way, with the rout it turned into beneath it when
  // the unit had nowhere to fall back to.
  return [slot, ...fromRout(slot.routState)];
}

/**
 * A stage the attack reached and has yet to open is due, with nothing under
 * it yet; one opened and not completed is due with itself under way; one
 * completed, or never reached, is not due.
 */
function fromDueStage<T extends { completed: boolean }>(
  slot: T | 'pending' | 'bypassed',
  within: (open: T) => SubstepState[],
): SubstepState[] | undefined {
  // The attack met this stage's threshold and the stage has yet to open: play
  // stops at this attack, with nothing under it yet.
  if (isPending(slot)) {
    return [];
  }

  // The stage is open: play stops here, with the result being carried out.
  if (isUnderWay(slot)) {
    return within(slot);
  }

  // The threshold was never met, or the stage is done: look further on.
  return undefined;
}

/**
 * One stage of one attack's results: `undefined` when nothing is due in it,
 * empty when it is due but not yet opened, and the result itself once open.
 */
function fromAttackApplyStage(
  apply: AttackApplyState,
  stage: AttackApplyStage,
): SubstepState[] | undefined {
  switch (stage) {
    // The unit falls back, and may rout on the spot if it cannot.
    case 'retreat': {
      return fromDueStage(apply.retreatState, fromRetreat);
    }
    // The unit turns about.
    case 'reverse': {
      return fromDueStage(apply.reverseState, fromReverse);
    }
    // The unit leaves the field, and its player owes the cards.
    case 'rout': {
      return fromDueStage(apply.routState, fromRout);
    }
    // Unreachable: `attackApplyStages` lists only the three stages above, and
    // this helper is fed from it alone, so no case can cover this line.
    default: {
      const _exhaustive: never = stage;
      throw new Error(`Unknown attack apply stage: ${String(_exhaustive)}`);
    }
  }
}

/**
 * The attack whose results are being carried out, and the result under way.
 *
 * Results come a stage at a time — retreat, then reverse, then rout (§7.5.2) —
 * and in a melee each stage is carried out for both units before the next,
 * the second player's unit first (§7.5.6). So the attack under way is the
 * first, stage by stage, with a result still to open or still open. Once every
 * stage is done, it is the one being closed.
 *
 * @param applies - The attacks, in the order their results take effect
 * @param closing - The attack to close once every stage is done, if any
 */
function fromAttackApplies(
  applies: AttackApplyState[],
  closing: AttackApplyState | undefined,
): SubstepState[] {
  // Stage by stage, and within a stage unit by unit, the first result still
  // due or still open is where play stands.
  for (const stage of attackApplyStages) {
    for (const apply of applies) {
      const within = fromAttackApplyStage(apply, stage);
      if (within !== undefined) {
        return [apply, ...within];
      }
    }
  }

  // Every result is carried out: play stands at the attack being closed, or
  // nowhere inside the attacks when none is left to close.
  return closing === undefined ? [] : [closing];
}

/** A Shoot order's one attack, and the results it is carrying out. */
function fromRangedAttack(slot: AttackApplyState | 'pending'): SubstepState[] {
  // Before the shot is resolved there is no attack to follow, and once its
  // results are closed there is none either.
  if (!isUnderWay(slot)) {
    return [];
  }

  // A shot has one attack, so it is both the one to walk and the one to close.
  return fromAttackApplies([slot], slot);
}

/**
 * A Move's engagement, and what it has opened: a front-engaged defender's
 * retreat (§6.3.2), or the rout an attack from behind forces (§6.3.3). A flank
 * engagement only turns the defender, and opens nothing further (§6.3.4).
 */
function fromEngagement(slot: EngagementState | 'pending'): SubstepState[] {
  // A Move that has not reached an enemy, or whose engagement is settled,
  // adds nothing below the order.
  if (!isUnderWay(slot)) {
    return [];
  }

  // What the engagement opens depends on which side of the defender it struck.
  const resolution = slot.engagementResolutionState;
  switch (resolution.engagementType) {
    // From the front, the defender may give ground.
    case 'front': {
      return [slot, ...fromRetreat(resolution.retreatState)];
    }
    // From behind, the defender routs.
    case 'rear': {
      return [slot, ...fromRout(resolution.routState)];
    }
    // From the flank, the defender only turns, and the trail ends here.
    case 'flank': {
      return [slot];
    }
    // An engagement of no kind the rules name is a fault in the state.
    default: {
      const _exhaustive: never = resolution;
      throw new Error(`Unknown engagement type: ${String(_exhaustive)}`);
    }
  }
}

/**
 * Where play stands inside the current step, outermost first: the order being
 * carried out, the melee being fought or the rally being resolved, and then
 * each substep it has opened that is still under way, down to the one being
 * decided now. Read in order, it is a trail of breadcrumbs — a Move order, the
 * flank engagement it started; a melee at E-5, the second player's unit's
 * attack, the rout it ended in.
 *
 * A substep is under way once it has been opened and until it is completed;
 * one that is finished drops off the end, though its parent stays until that
 * closes too. Only one branch is ever under way, because the rules carry out
 * one result at a time, so the trail never forks.
 *
 * Outside an order, a melee or a rally, play is between substeps, and the
 * trail is empty.
 *
 * @param state - The game state
 * @returns The substeps under way, outermost first; empty when there are none
 */
export function getSubstepsInProgress(state: GameState): SubstepState[] {
  // Phase 3: an order being carried out, by Move or by Shoot (§4.3).
  const command = findCurrentCommandResolutionState(state);
  if (command !== undefined && !command.completed) {
    // A Move may start an engagement; a Shoot applies its attack's results.
    const within =
      command.commandResolutionType === 'movement'
        ? fromEngagement(command.engagementState)
        : fromRangedAttack(command.attackApplyState);
    // The order, then whatever it has opened.
    return [command, ...within];
  }

  // Phase 4: a melee being fought in one space (§4.4).
  const melee = findMeleeResolutionState(state);
  if (melee !== undefined && !melee.completed) {
    // Its two attacks are walked in the order their results take effect, and
    // closed in that order once every stage is done.
    const applies = getMeleeAppliesInResolutionOrder(melee);
    const closing = findNextMeleeAttackApplyToClose(melee);
    // The melee, then the attack being carried out and its result.
    return [melee, ...fromAttackApplies(applies, closing)];
  }

  // Cleanup: a player's rally, and the rout it may cost them (§10.3).
  const phaseState = state.currentRoundState.currentPhaseState;
  if (isActive(phaseState) && phaseState.phase === 'cleanup') {
    // Only a choose or resolve step belongs to a player's rally, and a rally
    // is there to follow only once that player has chosen to rally.
    const rallyingPlayer = findRallyingPlayer(state);
    const rally =
      rallyingPlayer === undefined
        ? undefined
        : findRallyResolutionState(state, rallyingPlayer);
    if (rally !== undefined && !rally.completed) {
      // The rally, then the rout of the units it left without support.
      return [rally, ...fromRout(rally.routState)];
    }
  }

  // Between substeps: nothing is under way.
  return [];
}

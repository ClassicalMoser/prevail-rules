import type { Modifier, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  getBoardCoordinates,
  getBoardSpace,
  getIssueCommandsPhaseState,
  getOtherPlayer,
  findPositionOfUnit,
  hasSingleUnit,
  isFriendlyUnit,
  isSameUnitInstance,
  getRemainingUnitsForPlayer,
} from '@queries';

import { canUnitRangedAttackTarget } from './canUnitRangedAttackTarget';

/**
 * Enemy units the sole attacker may target: enemies inside the attacker's
 * front arc out to their current range (unengaged attacker, range &gt; 0).
 * No line-of-sight check. One defender per attack.
 *
 * TODO(composition): this file has two primary exports and is named for
 * neither. Settle by splitting `getLegalRangedAttackTargets` and
 * `getLegalRangedAttackSupporters` into files of their own names, each with
 * its spec.
 *
 * Asked at the shooter's own Range to decide whether a unit may be named to
 * shoot at all (`getLegalRangedAttackers`), and with its committed card to
 * list what it may aim at (`getLegalShooterTargets`); the bot asks it too.
 *
 * @param attacker - The shooter, where it stands
 * @param gameState - The game, for the board and the stats in force
 * @param modifiers - The shooter's committed card, when there is one; its
 * Range reaches one space further (§4.3.11 step 2)
 * @returns Every enemy it may shoot at, in board order
 */
export function getLegalRangedAttackTargets(
  attacker: UnitWithPlacement,
  gameState: GameState,
  modifiers?: Modifier[],
): UnitWithPlacement[] {
  // A shot is aimed at the other side's units.
  const enemy = getOtherPlayer(attacker.unit.playerSide);
  const targets: UnitWithPlacement[] = [];

  // Every space is looked at, in board order, so the list is stable.
  for (const coordinate of getBoardCoordinates(gameState.boardState)) {
    const space = getBoardSpace(gameState.boardState, coordinate);

    // A target stands alone. A unit in an engaged space is never a target:
    // you cannot shoot into a melee (§4.3.11 step 3, §7.4.2). An empty space
    // holds nothing to shoot.
    if (!hasSingleUnit(space.unitPresence)) {
      continue;
    }

    // Only an enemy is a target. `canUnitRangedAttackTarget` refuses a
    // friend as well; this passes over one before the arc is measured.
    if (!isFriendlyUnit(space.unitPresence.unit, enemy)) {
      continue;
    }

    // The enemy where it stands, kept if the attacker can reach it.
    const target: UnitWithPlacement = {
      placement: { coordinate, facing: space.unitPresence.facing },
      unit: space.unitPresence.unit,
    };
    if (canUnitRangedAttackTarget(attacker, target, gameState, modifiers)) {
      targets.push(target);
    }
  }

  // Every enemy the attacker may aim at; empty when it can reach none.
  return targets;
}

/**
 * Optional supporters for a chosen attacker + target: other remaining units of
 * the attacking player that can **independently** ranged-attack that same
 * target (unengaged, range &gt; 0, target in their arc). Does not expand
 * support combinations — one atom list for membership / integrity.
 *
 * Each supporter is judged at its own Range: the shooter's committed card
 * helps the shooter alone (§8.4.1), so it does not stretch a supporter's arc.
 *
 * Validation checks a shot's named supporters against this list
 * (`isValidRangedAttackSupporters`), and the bot chooses among them.
 *
 * @param attacker - The shooter, where it stands
 * @param target - The enemy it has aimed at, where it stands
 * @param gameState - The game, in Phase 3 carrying out the Shoot order
 * @returns Every unit that may add +1 to the shot by spending its own (§7.3.4)
 * @throws Error outside the issue commands phase
 */
export function getLegalRangedAttackSupporters(
  attacker: UnitWithPlacement,
  target: UnitWithPlacement,
  gameState: GameState,
): UnitWithPlacement[] {
  // Supporters are asked for only while a shot is being carried out, in
  // Phase 3; being asked at any other time is the caller's mistake.
  // `getRemainingUnitsForPlayer` below throws the same; this states the gate
  // where the question is asked.
  getIssueCommandsPhaseState(gameState);

  // A supporter is one of the shooter's units ordered by this same Shoot
  // command that has not yet shot (§7.3.4): the order's units still to act.
  const player = attacker.unit.playerSide;
  const remaining = getRemainingUnitsForPlayer(gameState, player);

  const supporters: UnitWithPlacement[] = [];
  for (const unit of remaining) {
    // The shooter's own shot is the attack; it cannot add +1 to itself.
    if (isSameUnitInstance(unit, attacker.unit)) {
      continue;
    }

    // TODO(wrong): the order's units still to act are the shooter's own by
    // construction, so this soft guard can only hide a fault in the state
    // (DESIGN.md: a soft second guard hides a fault in the first). Settle by
    // removing it, or by throwing on a unit of the other side.
    if (!isFriendlyUnit(unit, player)) {
      continue;
    }

    // A unit routed earlier is still listed but no longer on the board.
    // TODO(misleading): shots are one way (§7.4.4) and nothing in a player's
    // own Shoot order removes one of their units, so no unit still to act is
    // off the board in play. Settle by stating the real reason for the find,
    // or asking `getPositionOfUnit`, which throws.
    const placement = findPositionOfUnit(gameState, unit);
    if (placement === undefined) {
      continue;
    }

    // It must be able to make the same shot on its own, at its own Range:
    // unengaged, with Range, the target in its arc (§7.3.4).
    const unitWithPlacement: UnitWithPlacement = { placement, unit };
    if (canUnitRangedAttackTarget(unitWithPlacement, target, gameState)) {
      supporters.push(unitWithPlacement);
    }
  }

  // Every unit that may support this shot; empty when none can.
  return supporters;
}

import type { Modifier, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  getBoardCoordinates,
  getBoardSpace,
  getOtherPlayer,
  findPositionOfUnit,
  hasSingleUnit,
  isFriendlyUnit,
  isSameUnitInstance,
} from '@queries';

import { canUnitRangedAttackTarget } from './canUnitRangedAttackTarget';

/**
 * Enemy units the sole attacker may target: enemies inside the attacker's
 * front arc out to their current range (unengaged attacker, range &gt; 0).
 * No line-of-sight check. One defender per attack.
 *
 * @param modifiers - The shooter's committed card, when there is one; its
 * Range reaches one space further (§4.3.11 step 2)
 */
export function getLegalRangedAttackTargets(
  attacker: UnitWithPlacement,
  gameState: GameState,
  modifiers?: Modifier[],
): UnitWithPlacement[] {
  const enemy = getOtherPlayer(attacker.unit.playerSide);
  const targets: UnitWithPlacement[] = [];

  for (const coordinate of getBoardCoordinates(gameState.boardState)) {
    const space = getBoardSpace(gameState.boardState, coordinate);
    if (!hasSingleUnit(space.unitPresence)) {
      continue;
    }
    if (!isFriendlyUnit(space.unitPresence.unit, enemy)) {
      continue;
    }
    const target: UnitWithPlacement = {
      placement: { coordinate, facing: space.unitPresence.facing },
      unit: space.unitPresence.unit,
    };
    if (canUnitRangedAttackTarget(attacker, target, gameState, modifiers)) {
      targets.push(target);
    }
  }

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
 */
export function getLegalRangedAttackSupporters(
  attacker: UnitWithPlacement,
  target: UnitWithPlacement,
  gameState: GameState,
): UnitWithPlacement[] {
  const phaseState = gameState.currentRoundState.currentPhaseState;
  if (phaseState === 'none' || phaseState.phase !== 'issueCommands') {
    return [];
  }

  const player = attacker.unit.playerSide;
  const isFirstPlayer = player === gameState.currentInitiative;
  const remaining = isFirstPlayer
    ? phaseState.remainingUnitsFirstPlayer
    : phaseState.remainingUnitsSecondPlayer;

  const supporters: UnitWithPlacement[] = [];
  for (const unit of remaining) {
    if (isSameUnitInstance(unit, attacker.unit).result) {
      continue;
    }
    if (!isFriendlyUnit(unit, player)) {
      continue;
    }
    // A unit routed earlier is still listed but no longer on the board.
    const placement = findPositionOfUnit(gameState.boardState, unit);
    if (placement === undefined) {
      continue;
    }
    const unitWithPlacement: UnitWithPlacement = { placement, unit };
    if (canUnitRangedAttackTarget(unitWithPlacement, target, gameState)) {
      supporters.push(unitWithPlacement);
    }
  }

  return supporters;
}

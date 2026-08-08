import type { UnitWithPlacement } from '@entities';
import { hasSingleUnit } from '@entities';
import type { GameState } from '@game';
import {
  getBoardCoordinates,
  getBoardSpace,
  getOtherPlayer,
  getPositionOfUnit,
  isSameUnitInstance,
} from '@queries';

import { canUnitRangedAttackTarget } from './canUnitRangedAttackTarget';

/**
 * Enemy units the sole attacker may target: enemies inside the attacker's
 * front arc out to their current range (unengaged attacker, range &gt; 0).
 * No line-of-sight check. One defender per attack.
 */
export function getLegalRangedAttackTargets(
  attacker: UnitWithPlacement,
  gameState: GameState,
): UnitWithPlacement[] {
  const enemy = getOtherPlayer(attacker.unit.playerSide);
  const targets: UnitWithPlacement[] = [];

  for (const coordinate of getBoardCoordinates(gameState.boardState)) {
    try {
      const space = getBoardSpace(gameState.boardState, coordinate);
      if (!hasSingleUnit(space.unitPresence)) {
        continue;
      }
      if (space.unitPresence.unit.playerSide !== enemy) {
        continue;
      }
      const target: UnitWithPlacement = {
        placement: { coordinate, facing: space.unitPresence.facing },
        unit: space.unitPresence.unit,
      };
      if (canUnitRangedAttackTarget(attacker, target, gameState)) {
        targets.push(target);
      }
    } catch {
      // skip
    }
  }

  return targets;
}

/**
 * Optional supporters for a chosen attacker + target: other remaining units of
 * the attacking player that can **independently** ranged-attack that same
 * target (unengaged, range &gt; 0, target in their arc). Does not expand
 * support combinations — one atom list for membership / integrity.
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
    if (unit.playerSide !== player) {
      continue;
    }
    let unitWithPlacement: UnitWithPlacement;
    try {
      const placement = getPositionOfUnit(gameState.boardState, unit);
      unitWithPlacement = { placement, unit };
    } catch {
      continue;
    }
    if (canUnitRangedAttackTarget(unitWithPlacement, target, gameState)) {
      supporters.push(unitWithPlacement);
    }
  }

  return supporters;
}

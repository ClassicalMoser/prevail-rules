import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  getCurrentUnitStat,
  getOtherPlayer,
  getOwnedPlayerCardState,
  getPositionOfUnit,
} from '@queries';

import { isUnengagedUnit } from './canUnitRangedAttackTarget';

/**
 * Atomic perform-ranged-attack context: which player is resolving a ranged
 * command start, and which remaining units may act as the **sole** attacker.
 *
 * Targets / supporters are enumerated per chosen attacker (+ target for
 * supporters) via {@link getLegalRangedAttackTargets} /
 * {@link getLegalRangedAttackSupporters}.
 *
 * `null` when a performRangedAttack choice is not expected.
 */
export interface LegalRangedAttackers {
  player: PlayerSide;
  /** Remaining commanded units that may fire (unengaged, range &gt; 0). */
  attackers: readonly UnitWithPlacement[];
}

/**
 * Returns legal ranged attackers when issueCommands awaits the start of a
 * ranged command resolution (CRS pending, remaining units, ranged card in play).
 */
export function getLegalRangedAttackers<S extends GameState>(
  gameState: S,
): LegalRangedAttackers | null {
  const phaseState = gameState.currentRoundState.currentPhaseState;
  if (phaseState === 'none' || phaseState.phase !== 'issueCommands') {
    return null;
  }
  if (
    phaseState.step !== 'firstPlayerResolveCommands' &&
    phaseState.step !== 'secondPlayerResolveCommands'
  ) {
    return null;
  }
  if (phaseState.currentCommandResolutionState !== 'pending') {
    return null;
  }

  const firstPlayer = gameState.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);
  const player =
    phaseState.step === 'firstPlayerResolveCommands'
      ? firstPlayer
      : secondPlayer;
  const remainingUnits =
    phaseState.step === 'firstPlayerResolveCommands'
      ? phaseState.remainingUnitsFirstPlayer
      : phaseState.remainingUnitsSecondPlayer;

  if (remainingUnits.length === 0) {
    return null;
  }

  let inPlay;
  try {
    inPlay = getOwnedPlayerCardState(gameState.cardState, player).inPlay;
  } catch {
    return null;
  }
  if (inPlay === null || inPlay.command.type !== 'rangedAttack') {
    return null;
  }

  const attackers: UnitWithPlacement[] = [];
  for (const unit of remainingUnits) {
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
    if (!isUnengagedUnit(gameState, unitWithPlacement)) {
      continue;
    }
    if (getCurrentUnitStat(unit, 'range', gameState) <= 0) {
      continue;
    }
    attackers.push(unitWithPlacement);
  }

  if (attackers.length === 0) {
    return null;
  }

  return { attackers, player };
}

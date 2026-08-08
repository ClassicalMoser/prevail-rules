import type {
  CommandCard,
  PlayerSide,
  UnitInstance,
  UnitSupport,
} from '@entities';
import type { GameState } from '@game';
import {
  getCleanupPhaseState,
  getOtherPlayer,
  getOwnedPlayerCardState,
  getPlayerUnitsOnBoard,
  getRallyResolutionStateAwaitingUnitsBroken,
  unitMatchesSupport,
} from '@queries';

/**
 * One hand card’s support grant with currently eligible board units.
 */
export interface LegalUnitSupportGrant {
  card: CommandCard;
  unitSupport: UnitSupport;
  eligibleUnits: readonly UnitInstance[];
}

/**
 * Atomic unit-support assignment options for UI and validation after rally.
 *
 * Does not expand assignment combinations — callers assign up to `count`
 * eligible units per grant; {@link isValidAssignUnitSupportEvent} checks
 * integrity of the committed assignment.
 *
 * `null` when assign-unit-support is not expected (wrong step / visibility).
 */
export interface LegalUnitSupportGrants {
  player: PlayerSide;
  grants: readonly LegalUnitSupportGrant[];
}

/**
 * Returns support grants from the rallying player’s hand with eligible board
 * units, when cleanup is awaiting unit-support assignment.
 */
export function getLegalUnitSupportGrants<S extends GameState>(
  gameState: S,
): LegalUnitSupportGrants | null {
  let phaseState;
  try {
    phaseState = getCleanupPhaseState(gameState);
  } catch {
    return null;
  }

  if (
    phaseState.step !== 'firstPlayerResolveRally' &&
    phaseState.step !== 'secondPlayerResolveRally'
  ) {
    return null;
  }

  const firstPlayer = gameState.currentInitiative;
  const player =
    phaseState.step === 'firstPlayerResolveRally'
      ? firstPlayer
      : getOtherPlayer(firstPlayer);

  try {
    getRallyResolutionStateAwaitingUnitsBroken(gameState, player);
  } catch {
    return null;
  }

  let hand: CommandCard[];
  try {
    hand = getOwnedPlayerCardState(gameState.cardState, player).inHand;
  } catch {
    // Hand hidden under this visibility.
    return null;
  }

  const boardUnits = [...getPlayerUnitsOnBoard(gameState, player)];
  const grants: LegalUnitSupportGrant[] = [];

  for (const card of hand) {
    if (card.unitSupport.count < 1) {
      continue;
    }
    const eligibleUnits = boardUnits.filter((unit) =>
      unitMatchesSupport(unit, card.unitSupport),
    );
    grants.push({
      card,
      eligibleUnits,
      unitSupport: card.unitSupport,
    });
  }

  return { grants, player };
}

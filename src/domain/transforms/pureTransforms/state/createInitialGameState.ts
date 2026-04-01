import type { Army, GameType, UnitInstance } from '@entities';
import type { BoardForGameType, GameState } from '@game';

import {
  createEmptyGameState,
  createUnitInstance,
} from '@transforms/initializations';

/**
 * Builds a {@link GameState} for a new game: empty board and round state, white initiative,
 * units from each {@link Army} in {@link GameState.reservedUnits}, and each army's command
 * cards in that player's hand (`cardState.*.inHand`).
 */
export function createInitialGameState<TGameType extends GameType>(options: {
  gameType: TGameType;
  whiteArmy: Army;
  blackArmy: Army;
}): GameState<BoardForGameType[TGameType]> {
  const { whiteArmy, blackArmy } = options;

  type BoardSize = BoardForGameType[TGameType];

  const emptyGameState: GameState<BoardSize> = createEmptyGameState(
    options.gameType,
  );

  const reservedUnits = new Set<UnitInstance>();
  for (const unit of whiteArmy.units) {
    for (let i = 1; i <= unit.count; i++) {
      reservedUnits.add(createUnitInstance('white', unit.unitType, i + 1));
    }
  }
  for (const unit of blackArmy.units) {
    for (let i = 1; i <= unit.count; i++) {
      reservedUnits.add(createUnitInstance('black', unit.unitType, i + 1));
    }
  }

  const gameStateWithReservedUnits: GameState<BoardForGameType[TGameType]> = {
    ...emptyGameState,
    reservedUnits,
  };

  return gameStateWithReservedUnits;
}

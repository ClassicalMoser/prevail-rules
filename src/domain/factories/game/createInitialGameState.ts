import type { Army, GameModeName } from '@entities';
import type { GameStateForVisibility } from '@game';

import { createUnitInstance } from '@factories/unit';
import { createEmptyGameState } from './createEmptyGameState';

/**
 * Builds a {@link GameState} for a new game: empty board and round state,
 * unit instances from each {@link Army} in {@link GameState.reservedUnits},
 * and each army's command cards dealt into that side's `inHand`.
 *
 * Instance numbers are 1-indexed (`1..count`) to match {@link eachUnitPresentOnce}.
 */
export function createInitialGameState(options: {
  gameMode: GameModeName;
  whiteArmy: Army;
  blackArmy: Army;
}): GameStateForVisibility<'authoritative'> {
  const { whiteArmy, blackArmy } = options;

  let emptyGameState;
  switch (options.gameMode) {
    // Tutorial shell: small board, empty piles. Hand and reserves are filled below.
    case 'tutorial': {
      emptyGameState = createEmptyGameState(options.gameMode);
      break;
    }
    // Mini shell: small board, empty piles.
    case 'mini': {
      emptyGameState = createEmptyGameState(options.gameMode);
      break;
    }
    // Standard shell: standard board, empty piles.
    case 'standard': {
      emptyGameState = createEmptyGameState(options.gameMode);
      break;
    }
    // Epic shell: large board, empty piles.
    case 'epic': {
      emptyGameState = createEmptyGameState(options.gameMode);
      break;
    }
    // GameModeName is a closed catalog; this keeps a drifted value from dealing a game.
    default: {
      const _exhaustive: never = options.gameMode;
      throw new Error(`Unknown gameMode: ${_exhaustive}`);
    }
  }

  // Create unit instances for each unit in each army.
  const reservedUnits = [];
  for (const unit of whiteArmy.units) {
    for (let i = 1; i <= unit.count; i++) {
      reservedUnits.push(createUnitInstance('white', unit.unitType, i));
    }
  }
  for (const unit of blackArmy.units) {
    for (let i = 1; i <= unit.count; i++) {
      reservedUnits.push(createUnitInstance('black', unit.unitType, i));
    }
  }

  return {
    ...emptyGameState,
    cardState: {
      // Game is created by authoritative engine; non-authoritative states are passed, not created.
      visibility: 'authoritative',
      // Black command cards are added to their hand.
      black: {
        ...emptyGameState.cardState.black,
        inHand: [...blackArmy.commandCards],
      },
      // White command cards are added to their hand.
      white: {
        ...emptyGameState.cardState.white,
        inHand: [...whiteArmy.commandCards],
      },
    },
    // All units start out in reserve, awaiting setup.
    reservedUnits,
  };
}

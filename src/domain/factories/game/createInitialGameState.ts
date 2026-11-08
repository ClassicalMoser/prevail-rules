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

  // TODO(composition): the four cases below call the same function with the
  // same argument; `createEmptyGameState` already looks the board size up from
  // the mode, so this switch adds only the exhaustiveness check. Settled by
  // dropping it, or by saying what a mode will add beyond its board size.
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

  // An army is a list of unit types with a count of each. Every one of those
  // units is a separate piece to be placed, so each gets its own instance.
  // Numbering from 1 per type is how a unit of that type is told apart from
  // its siblings, and `eachUnitPresentOnce` rebuilds the same list to check
  // that every unit is accounted for.
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
      // The army's command cards are the hand it takes into battle, and the
      // hand is its will to fight: a side whose hand is empty has lost.
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
    // All units start out in reserve, awaiting setup. Neither side has a unit
    // on the board until it is placed in the setup phase.
    reservedUnits,
  };
}

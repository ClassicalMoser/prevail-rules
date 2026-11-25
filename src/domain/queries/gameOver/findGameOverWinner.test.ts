import type { CommandCard, PlayerSide } from '@entities';
import { createEmptyGameState } from '@factories';
import type { GameState } from '@game';
import {
  createTestCard,
  createUnitWithPlacement,
  replaceBoard,
  withRoutOwing,
} from '@testing';
import {
  addUnitToBoard,
  updateCurrentInitiative,
  updatePlayerCardState,
} from '@transforms';

import { findGameOverWinner } from './findGameOverWinner';

/**
 * Game over asks empty hands first, then an unpayable rout discard, then a
 * destroyed army (§11.4). A side wins, both hands empty at once go to the
 * holder of initiative (§11.3), and otherwise the game continues. There is
 * no draw.
 *
 */
function gameOverState(options: {
  blackHand: CommandCard[];
  whiteHand: CommandCard[];
  rout?: {
    numberToDiscard: number;
    player: PlayerSide;
  };
}): GameState {
  const base = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'white',
  );
  const white = updatePlayerCardState(base, 'white', {
    ...base.cardState.white,
    inHand: options.whiteHand,
  });
  const withHands = updatePlayerCardState(white, 'black', {
    ...white.cardState.black,
    inHand: options.blackHand,
  });
  if (options.rout === undefined) {
    return withHands;
  }
  // A rout owing its discard, on the routing player's rally.
  const owing = withRoutOwing(
    withHands,
    options.rout.player,
    options.rout.numberToDiscard,
  );
  return owing;
}

describe('findGameOverWinner function', () => {
  it('continues when both hands have cards', () => {
    // One card each, nothing routing, and no army destroyed: neither board
    // holds a unit, which is a game not yet begun rather than a loss.
    const state = gameOverState({
      blackHand: [createTestCard()],
      whiteHand: [createTestCard()],
    });

    expect(findGameOverWinner(state)).toBeUndefined();
  });

  it('both hands empty at once go to the holder of initiative', () => {
    // The helper's base state gives white the initiative going into the round.
    const state = gameOverState({
      blackHand: [],
      whiteHand: [],
    });

    expect(findGameOverWinner(state)).toBe('white');
  });

  it('black wins on an empty white hand before black pays a rout of 99', () => {
    // Black could never pay 99 cards, but White's hand gave out first, and
    // the empty hand is asked about first (§11.1).
    const state = gameOverState({
      blackHand: [createTestCard()],
      rout: { numberToDiscard: 99, player: 'black' },
      whiteHand: [],
    });

    expect(findGameOverWinner(state)).toBe('black');
  });

  it('white wins when the black army is destroyed, however many cards black holds', () => {
    const handsOnly = gameOverState({
      blackHand: [createTestCard()],
      whiteHand: [createTestCard()],
    });
    // White keeps a survivor on the field; black's army is gone (§11.4).
    const survivor = createUnitWithPlacement({
      coordinate: 'E-5',
      playerSide: 'white',
    });
    const board = addUnitToBoard(handsOnly.boardState, survivor);
    const state = replaceBoard(handsOnly, board);

    expect(findGameOverWinner(state)).toBe('white');
  });

  it('black wins when white cannot pay a rout of 2', () => {
    // Both hands hold a card, so only the rout decides it (§11.2).
    const state = gameOverState({
      blackHand: [createTestCard()],
      rout: { numberToDiscard: 2, player: 'white' },
      whiteHand: [createTestCard()],
    });

    expect(findGameOverWinner(state)).toBe('black');
  });
});

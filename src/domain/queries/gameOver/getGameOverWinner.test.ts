import type { CommandCard, PlayerSide } from '@entities';
import { createEmptyGameState } from '@factories';
import type { GameState } from '@game';
import {
  createCleanupPhaseState,
  createRallyResolutionState,
  createRoutState,
  createTestCard,
  createTestUnit,
} from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
  updatePlayerCardState,
  updateRoutState,
} from '@transforms';

import { getGameOverWinner } from './getGameOverWinner';

/**
 * Game over asks empty hands first, then an unpayable rout discard.
 * A side wins, both empty hands draw, and otherwise the game continues.
 *
 * The cleanup factory only opens a rout slot. `updateRoutState` will not
 * create one from `'pending'`, so the penalty is written through that transform.
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
  const cleanup = updatePhaseState(
    withHands,
    createCleanupPhaseState({
      firstPlayerRallyResolutionState: createRallyResolutionState({
        playerRallied: true,
        rallyResolved: true,
        routState: createRoutState('white', createTestUnit('white')),
      }),
      step: 'firstPlayerResolveRally',
    }),
  );
  const next = updateRoutState(
    cleanup,
    createRoutState(options.rout.player, createTestUnit(options.rout.player), {
      cardsChosen: false,
      numberToDiscard: options.rout.numberToDiscard,
    }),
  );
  return next;
}

describe(getGameOverWinner, () => {
  it('continues when both hands have cards', () => {
    const state = gameOverState({
      blackHand: [createTestCard({ id: 'black-hand' })],
      whiteHand: [createTestCard({ id: 'white-hand' })],
    });

    expect(getGameOverWinner(state)).toBeUndefined();
  });

  it('draws when both hands are empty', () => {
    const state = gameOverState({
      blackHand: [],
      whiteHand: [],
    });

    expect(getGameOverWinner(state)).toBeNull();
  });

  it('black wins on an empty white hand before black pays a rout of 99', () => {
    const state = gameOverState({
      blackHand: [createTestCard({ id: 'black-hand' })],
      rout: { numberToDiscard: 99, player: 'black' },
      whiteHand: [],
    });

    expect(getGameOverWinner(state)).toBe('black');
  });

  it('black wins when white cannot pay a rout of 2', () => {
    const state = gameOverState({
      blackHand: [createTestCard({ id: 'black-hand' })],
      rout: { numberToDiscard: 2, player: 'white' },
      whiteHand: [createTestCard({ id: 'white-hand' })],
    });

    expect(getGameOverWinner(state)).toBe('black');
  });
});

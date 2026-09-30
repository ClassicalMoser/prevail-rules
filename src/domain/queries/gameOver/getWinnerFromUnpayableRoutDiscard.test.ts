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

import { getWinnerFromUnpayableRoutDiscard } from './getWinnerFromUnpayableRoutDiscard';

/** A hand of `count` cards. The query reads the length; each card still needs its own id. */
function cards(count: number, id: string): CommandCard[] {
  const hand = Array.from({ length: count }, (_, index) =>
    createTestCard({ id: `${id}-${index}` }),
  );
  return hand;
}

/**
 * Cleanup, with `player` about to choose a rout discard of `numberToDiscard`
 * cards from a hand of `handSize`.
 *
 * The cleanup factory only opens a rout slot. `updateRoutState` will not
 * create one from `'pending'`, so the penalty is written through that transform.
 * The other hand stays non-empty so this suite is not also an empty-hand loss.
 */
function stateAwaitingDiscard(options: {
  handSize: number;
  numberToDiscard: number;
  player: PlayerSide;
}): GameState {
  // White is first, so `firstPlayerResolveRally` is white's rally step.
  const base = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'white',
  );
  const other: PlayerSide = options.player === 'white' ? 'black' : 'white';
  // The routed player's hand is exactly `handSize`.
  const routed = updatePlayerCardState(base, options.player, {
    ...base.cardState[options.player],
    inHand: cards(options.handSize, options.player),
  });
  // One card in the other hand, so an empty hand is not also a loss.
  const withHands = updatePlayerCardState(routed, other, {
    ...routed.cardState[other],
    inHand: [createTestCard({ id: `${other}-hand` })],
  });
  // Rally is already accepted. The rout slot has to exist before it can be replaced.
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
  // Cards are not chosen yet, and the penalty is the one this case is about.
  const next = updateRoutState(
    cleanup,
    createRoutState(options.player, createTestUnit(options.player), {
      cardsChosen: false,
      numberToDiscard: options.numberToDiscard,
    }),
  );
  return next;
}

/**
 * An unpayable rout discard: a penalty that meets or exceeds the hand wins for
 * the other player. A smaller penalty continues.
 */
describe(getWinnerFromUnpayableRoutDiscard, () => {
  it('continues when the penalty is smaller than the hand', () => {
    const state = stateAwaitingDiscard({
      handSize: 3,
      numberToDiscard: 2,
      player: 'white',
    });

    expect(getWinnerFromUnpayableRoutDiscard(state)).toBeUndefined();
  });

  it('black wins when white must discard the whole hand', () => {
    const state = stateAwaitingDiscard({
      handSize: 2,
      numberToDiscard: 2,
      player: 'white',
    });

    expect(getWinnerFromUnpayableRoutDiscard(state)).toBe('black');
  });

  it('white wins when black must discard more cards than the hand holds', () => {
    const state = stateAwaitingDiscard({
      handSize: 1,
      numberToDiscard: 3,
      player: 'black',
    });

    expect(getWinnerFromUnpayableRoutDiscard(state)).toBe('white');
  });

  it('continues when no rout discard is awaiting', () => {
    expect(
      getWinnerFromUnpayableRoutDiscard(createEmptyGameState('standard')),
    ).toBeUndefined();
  });
});

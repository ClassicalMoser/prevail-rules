import type { CommandCard, PlayerSide } from '@entities';
import { createEmptyGameState } from '@factories';
import type { GameState } from '@game';
import { getOtherPlayer } from '@queries/player';
import {
  createIssueCommandsPhaseState,
  createTestCard,
  withRoutOwing,
} from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms';

import { findWinnerFromUnpayableRoutDiscard } from './findWinnerFromUnpayableRoutDiscard';

/** A hand of `count` cards. The query reads the length; each card mints its own id. */
function cards(count: number): CommandCard[] {
  const hand = Array.from({ length: count }, () => createTestCard());
  return hand;
}

/**
 * Cleanup, with `player` about to choose a rout discard of `numberToDiscard`
 * cards from a hand of `handSize`.
 *
 * The other hand stays non-empty so this suite is not also an empty-hand loss.
 */
function stateAwaitingDiscard(options: {
  handSize: number;
  numberToDiscard: number;
  player: PlayerSide;
}): GameState {
  // White is first: white rallies first, black second.
  const base = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'white',
  );
  const other = getOtherPlayer(options.player);
  // The routed player's hand is exactly `handSize`.
  const routed = updatePlayerCardState(base, options.player, {
    ...base.cardState[options.player],
    inHand: cards(options.handSize),
  });
  // One card in the other hand, so an empty hand is not also a loss.
  const withHands = updatePlayerCardState(routed, other, {
    ...routed.cardState[other],
    inHand: [createTestCard()],
  });
  // The rally is accepted, and its rout owes the penalty this case is about.
  const owing = withRoutOwing(
    withHands,
    options.player,
    options.numberToDiscard,
  );
  return owing;
}

/**
 * An unpayable rout discard: a penalty that meets or exceeds the hand wins for
 * the other player. A smaller penalty continues.
 */
describe('findWinnerFromUnpayableRoutDiscard function', () => {
  it('continues when the penalty is smaller than the hand', () => {
    // White owes two cards from a hand of three, and keeps one.
    const state = stateAwaitingDiscard({
      handSize: 3,
      numberToDiscard: 2,
      player: 'white',
    });

    expect(findWinnerFromUnpayableRoutDiscard(state)).toBeUndefined();
  });

  it('black wins when white must discard the whole hand', () => {
    // Paying with the last card is already a loss (§11.2).
    const state = stateAwaitingDiscard({
      handSize: 2,
      numberToDiscard: 2,
      player: 'white',
    });

    expect(findWinnerFromUnpayableRoutDiscard(state)).toBe('black');
  });

  it('white wins when black must discard more cards than the hand holds', () => {
    // Black owes three cards and holds one.
    const state = stateAwaitingDiscard({
      handSize: 1,
      numberToDiscard: 3,
      player: 'black',
    });

    expect(findWinnerFromUnpayableRoutDiscard(state)).toBe('white');
  });

  it('continues when no rout discard is awaiting', () => {
    // Setup: nothing has routed.
    expect(
      findWinnerFromUnpayableRoutDiscard(createEmptyGameState('standard')),
    ).toBeUndefined();
  });

  it('continues when issue commands has not opened a command', () => {
    const empty = createEmptyGameState('standard');
    // Pending command resolution throws. That slice is not open, so the
    // discard is not pending.
    const state = updatePhaseState(empty, createIssueCommandsPhaseState(empty));

    expect(findWinnerFromUnpayableRoutDiscard(state)).toBeUndefined();
  });
});

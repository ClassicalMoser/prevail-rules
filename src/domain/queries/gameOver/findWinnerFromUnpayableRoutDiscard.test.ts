import type { CommandCard, PlayerSide } from '@entities';
import { createEmptyGameState } from '@factories';
import type { GameState } from '@game';
import {
  createCleanupPhaseStateWithRallyRout,
  createIssueCommandsPhaseState,
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
 * The cleanup factory only opens a rout slot. `updateRoutState` will not
 * create one from `'pending'`, so the penalty is written through that transform.
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
  const other: PlayerSide = options.player === 'white' ? 'black' : 'white';
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
  // Rally is already accepted. The rout slot has to exist before it can be replaced.
  const cleanup = updatePhaseState(
    withHands,
    createCleanupPhaseStateWithRallyRout(
      withHands,
      createRoutState(options.player, createTestUnit(options.player)),
    ),
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
describe('findWinnerFromUnpayableRoutDiscard function', () => {
  it('continues when the penalty is smaller than the hand', () => {
    const state = stateAwaitingDiscard({
      handSize: 3,
      numberToDiscard: 2,
      player: 'white',
    });

    expect(findWinnerFromUnpayableRoutDiscard(state)).toBeUndefined();
  });

  it('black wins when white must discard the whole hand', () => {
    const state = stateAwaitingDiscard({
      handSize: 2,
      numberToDiscard: 2,
      player: 'white',
    });

    expect(findWinnerFromUnpayableRoutDiscard(state)).toBe('black');
  });

  it('white wins when black must discard more cards than the hand holds', () => {
    const state = stateAwaitingDiscard({
      handSize: 1,
      numberToDiscard: 3,
      player: 'black',
    });

    expect(findWinnerFromUnpayableRoutDiscard(state)).toBe('white');
  });

  it('continues when no rout discard is awaiting', () => {
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

  it('rethrows when the issue-commands phase has no command resolution field', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState = {
      phase: 'issueCommands',
      step: 'firstPlayerResolveCommands',
    } as typeof state.currentRoundState.currentPhaseState; // omits currentCommandResolutionState; not 'pending'

    expect(() => findWinnerFromUnpayableRoutDiscard(state)).toThrow(TypeError);
  });
});

import type { MeleeResolutionState } from '@game';
import {
  createCommitToMeleeEvent,
  createEmptyGameState,
  createOpenedMeleeResolutionState,
} from '@factories';
import { getMeleeResolutionState } from '@queries';
import {
  createGameStateResolvingMelee,
  createTestCard,
  updateCardState,
} from '@testing';

import { applyCommitToMeleeEvent } from './applyCommitToMeleeEvent';

/**
 * In a melee the first player may commit a card for their unit, then the
 * second (§7.2.2). The card leaves the hand for the discard pile, and the
 * melee records it in the committing player's own slot: the first player's or
 * the second's, by who holds the initiative.
 */
describe('applyCommitToMeleeEvent function', () => {
  // Each side holds a card committable for Attack (§8.4) and one it keeps:
  // committing a last card would lose the game (§11.1). The card kept names
  // Speed, which a melee does not accept, so it is no rival commitment.
  const held = { black: createTestCard(), white: createTestCard() };
  const kept = {
    black: createTestCard({ modifiers: ['speed'] }),
    white: createTestCard({ modifiers: ['speed'] }),
  };

  /**
   * Black holds the initiative and fights the melee at E-5, which has got as
   * far as the spec says; both sides hold their two cards.
   */
  function blackFirstFighting(melee: MeleeResolutionState) {
    const fighting = createGameStateResolvingMelee(melee, 'black');
    const empty = createEmptyGameState('standard');
    const withHands = updateCardState(fighting, {
      ...empty.cardState,
      black: { ...empty.cardState.black, inHand: [held.black, kept.black] },
      white: { ...empty.cardState.white, inHand: [held.white, kept.white] },
    });
    return withHands;
  }

  // The melee as it opens: neither side has committed.
  const opened = createOpenedMeleeResolutionState('E-5');

  // Black, first, has declined; white's commitment is owed.
  const whiteOwing: MeleeResolutionState = {
    ...opened,
    firstPlayerCommitment: { commitmentType: 'declined' },
  };

  it("records the first player's card in the first player's slot, and spends it", () => {
    // Black holds the initiative, so it commits first.
    const state = blackFirstFighting(opened);

    const next = applyCommitToMeleeEvent(
      createCommitToMeleeEvent({ committedCard: held.black, player: 'black' }),
      state,
    );

    // The melee counts black's card for black's unit…
    expect(getMeleeResolutionState(next).firstPlayerCommitment).toStrictEqual({
      card: held.black,
      commitmentType: 'completed',
    });
    // …and it has left black's hand (§8.1).
    expect(next.cardState.black.inHand).toStrictEqual([kept.black]);
  });

  it("records the second player's card in the second player's slot, and spends it", () => {
    // Black has declined; white commits second.
    const state = blackFirstFighting(whiteOwing);

    const next = applyCommitToMeleeEvent(
      createCommitToMeleeEvent({ committedCard: held.white, player: 'white' }),
      state,
    );

    // White's card goes to the second slot; black's refusal stands.
    const melee = getMeleeResolutionState(next);
    expect(melee.secondPlayerCommitment).toStrictEqual({
      card: held.white,
      commitmentType: 'completed',
    });
    expect(melee.firstPlayerCommitment).toStrictEqual({
      commitmentType: 'declined',
    });
    expect(next.cardState.white.inHand).toStrictEqual([kept.white]);
  });

  it('records the card the hand holds, not the copy the commitment names', () => {
    // White, second to commit, holds one card committable for Attack.
    const committing = blackFirstFighting(whiteOwing);

    // The commitment names that card, who it is, but prints it committable
    // for Defence as well.
    const claimed = {
      ...held.white,
      modifiers: [...held.white.modifiers, 'defense' as const],
    };
    const committed = applyCommitToMeleeEvent(
      createCommitToMeleeEvent({ committedCard: claimed, player: 'white' }),
      committing,
    );

    // The commitment holds the card White actually had, so its bonus is read
    // from what the card prints.
    expect(
      getMeleeResolutionState(committed).secondPlayerCommitment,
    ).toStrictEqual({ card: held.white, commitmentType: 'completed' });
  });

  it('records a refusal and leaves the hand alone', () => {
    // White refuses (§8.3).
    const state = blackFirstFighting(whiteOwing);

    const next = applyCommitToMeleeEvent(
      createCommitToMeleeEvent({ committedCard: 'none', player: 'white' }),
      state,
    );

    // White declined, and keeps both cards.
    expect(getMeleeResolutionState(next).secondPlayerCommitment).toStrictEqual({
      commitmentType: 'declined',
    });
    expect(next.cardState.white.inHand).toStrictEqual([held.white, kept.white]);
  });
});

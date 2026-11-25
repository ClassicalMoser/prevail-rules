import type { CommandCard } from '@entities';
import type { GameState, MeleeResolutionState } from '@game';
import { createEmptyGameState, createOwnedCardState } from '@factories';
import {
  createGameStateResolvingMelee,
  createMeleeResolutionState,
  createPlayCardsPhaseState,
  createTestCard,
} from '@testing';
import { updatePhaseState, updatePlayerCardState } from '@transforms';

import { getLegalCommitToMeleeEvents } from './getLegalCommitToMeleeEvents';

/** Eligible: carries a melee-applicable attack modifier. */
const attackCard = createTestCard({ modifiers: ['attack'] });
/** A card naming Speed alone: no use in a melee, so never offered there. */
const speedCard = createTestCard({ modifiers: ['speed'] });

/**
 * A melee fought with white holding the initiative, so white's unit is the
 * first player's (§4.1.5), with the commitments the case sets, and the given
 * player holding the given hand.
 */
function meleeWithHand(
  commitments: Pick<
    MeleeResolutionState,
    'firstPlayerCommitment' | 'secondPlayerCommitment'
  >,
  player: 'white' | 'black',
  hand: CommandCard[],
): GameState {
  // The melee, with each side's commitment as the case has it.
  const melee = createMeleeResolutionState(
    createEmptyGameState('standard'),
    commitments,
  );
  const fighting = createGameStateResolvingMelee(melee, 'white');

  // The player's hand; nothing else of theirs is read here.
  const withHand = updatePlayerCardState(
    fighting,
    player,
    createOwnedCardState({ inHand: hand }),
  );
  return withHand;
}

/**
 * GetLegalCommitToMeleeEvents: one CommitToMeleeEvent per eligible in-hand card
 * (has ≥1 melee modifier), plus a refuse option.
 *
 * Each player may commit a card for their unit before a melee's attack values
 * are counted, the first player first, then the second (§7.2.2). Each card in
 * hand naming Attack, Defence or Flexibility is offered, and the refusal always
 * is (§8.3, §8.4).
 */
describe('getLegalCommitToMeleeEvents function', () => {
  it('offers the first player each useful card in hand, then the refusal', () => {
    // Neither side has committed yet, so white, the first player, is asked.
    const state = meleeWithHand(
      {
        firstPlayerCommitment: { commitmentType: 'pending' },
        secondPlayerCommitment: { commitmentType: 'pending' },
      },
      'white',
      [speedCard, attackCard],
    );

    // The Attack card and the refusal; the Speed card is no use in a melee.
    expect(getLegalCommitToMeleeEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToMelee',
        committedCard: attackCard,
        eventType: 'playerChoice',
        player: 'white',
      },
      {
        choiceType: 'commitToMelee',
        committedCard: 'none',
        eventType: 'playerChoice',
        player: 'white',
      },
    ]);
  });

  it('asks the second player once the first has answered', () => {
    // White, the first player, has refused; black is still to answer.
    const state = meleeWithHand(
      {
        firstPlayerCommitment: { commitmentType: 'declined' },
        secondPlayerCommitment: { commitmentType: 'pending' },
      },
      'black',
      [attackCard],
    );

    // Black's card and refusal, both black's to send.
    expect(getLegalCommitToMeleeEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToMelee',
        committedCard: attackCard,
        eventType: 'playerChoice',
        player: 'black',
      },
      {
        choiceType: 'commitToMelee',
        committedCard: 'none',
        eventType: 'playerChoice',
        player: 'black',
      },
    ]);
  });

  it('throws once both players have answered, since nothing asks then', () => {
    // Both have refused; the attack values are next.
    const state = meleeWithHand(
      {
        firstPlayerCommitment: { commitmentType: 'declined' },
        secondPlayerCommitment: { commitmentType: 'declined' },
      },
      'white',
      [attackCard],
    );

    // Being asked again is the caller's mistake.
    expect(() => getLegalCommitToMeleeEvents(state)).toThrow(
      'No melee commitment is owed',
    );
  });

  it('throws when no melee is being fought, where nothing asks', () => {
    // The players are still choosing their cards.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );

    // No melee, so no commitment to it.
    expect(() => getLegalCommitToMeleeEvents(state)).toThrow(
      'No melee is being fought',
    );
  });
});

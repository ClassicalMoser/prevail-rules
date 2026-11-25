import type { AuthoritativeGameState } from '@game';
import {
  createChooseCardEvent,
  createEmptyGameState,
  createMoveCommanderEvent,
} from '@factories';
import {
  createPlayCardsPhaseState,
  createPlayableGame,
  createTestCard,
} from '@testing';
import { applyEvent, updatePhaseState, updateWinner } from '@transforms';

import { validateExpectedChoice } from './validateExpectedChoice';

// Each side's hand; each card is held by one player only.
const blackCard = createTestCard();
const blackSpareCard = createTestCard();
const whiteCard = createTestCard();
const whiteSpareCard = createTestCard();

/**
 * Phase 1 of a game under way, Black holding the initiative: both players
 * are asked for a card at once (§4.1.1), and each holds two, so neither hand
 * empties on playing one (§11.1).
 */
function choosingCards(): AuthoritativeGameState {
  const game = createPlayableGame(
    [
      { coord: 'H-5', facing: 'north', player: 'black' },
      { coord: 'B-5', facing: 'south', player: 'white' },
    ],
    {
      hands: {
        black: [blackCard, blackSpareCard],
        white: [whiteCard, whiteSpareCard],
      },
      initiative: 'black',
    },
  );
  const choosing = updatePhaseState(game, createPlayCardsPhaseState());
  return choosing;
}

/**
 * A choice is expected when the game is waiting on a player rather than on
 * an effect of its own, the choice is the kind it asks for, and the player
 * sending it is one it asks. Whether the choice is legal is a later question.
 */
describe('validateExpectedChoice function', () => {
  it('refuses a choice sent after the battle is over, saying so', () => {
    // The battle is over: black has won, so nobody is owed a choice any more.
    const finished = updateWinner(createEmptyGameState('standard'), 'black');
    const late = createChooseCardEvent({
      card: createTestCard(),
      player: 'white',
    });

    // A late choice is not a fault in the game: it is refused, and the
    // reason says the game has ended.
    expect(validateExpectedChoice(late, finished)).toStrictEqual({
      errorReason: 'The game is over, so no choice is expected',
      result: false,
    });
  });

  it('refuses a choice while the game owes an effect of its own', () => {
    // Both players lay a card face down. Revealing and comparing them for
    // the initiative is the game's own step (§4.1.2–4.1.3), so no player is
    // asked anything, and a further card from Black is not expected.
    const blackChose = applyEvent(
      createChooseCardEvent({ card: blackCard, player: 'black' }),
      choosingCards(),
    );
    const state = applyEvent(
      createChooseCardEvent({ card: whiteCard, player: 'white' }),
      blackChose,
    );
    const event = createChooseCardEvent({
      card: blackSpareCard,
      player: 'black',
    });

    expect(validateExpectedChoice(event, state)).toStrictEqual({
      errorReason: 'Expected gameEffect, not a player choice',
      result: false,
    });
  });

  it('refuses a choice of another kind than the one asked for', () => {
    // Phase 1 asks for cards; moving a commander belongs to Phase 2.
    const event = createMoveCommanderEvent({ player: 'black', to: 'G-5' });

    expect(validateExpectedChoice(event, choosingCards())).toStrictEqual({
      errorReason: 'Expected chooseCard, got moveCommander',
      result: false,
    });
  });

  it('refuses a choice from a side the game is not asking', () => {
    // Black has laid its card face down, so only White is still asked
    // (§4.1.1); a second card from Black is not expected.
    const state = applyEvent(
      createChooseCardEvent({ card: blackCard, player: 'black' }),
      choosingCards(),
    );
    const event = createChooseCardEvent({
      card: blackSpareCard,
      player: 'black',
    });

    expect(validateExpectedChoice(event, state)).toStrictEqual({
      errorReason: 'Expected input from white, not black',
      result: false,
    });
  });

  it('accepts the choice asked for from the one side asked', () => {
    // Black has chosen; White, the side still asked, chooses its card.
    const state = applyEvent(
      createChooseCardEvent({ card: blackCard, player: 'black' }),
      choosingCards(),
    );
    const event = createChooseCardEvent({ card: whiteCard, player: 'white' });

    expect(validateExpectedChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts a card from either side while both are asked at once', () => {
    // Before either has chosen, both players are asked (§4.1.1), so the
    // second player may send its card first.
    const event = createChooseCardEvent({ card: whiteCard, player: 'white' });

    expect(validateExpectedChoice(event, choosingCards())).toStrictEqual({
      result: true,
    });
  });
});

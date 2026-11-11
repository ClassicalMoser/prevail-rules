import type { PlayerSide } from '@entities';
import { createChooseCardEvent } from '@factories';
import { getOwnedPlayerCardState } from '@queries';
import {
  applyEffectsUntilChoice,
  createPlayableGame,
  createPlayCardsPhaseState,
} from '@testing';
import { applyEvent, updatePhaseState } from '@transforms';
import { validatePlayerChoice } from '@validation';

/**
 * Playing the last card in each hand (§4.1.1, §11.1, §11.3), played through
 * the engines. Both players choose in secret and at the same time, and the
 * cards are revealed together. The order the two choices arrive in is an
 * accident of the network, so it must not decide the game: a hand emptied by
 * choosing is judged once the cards are in play, not while the other player
 * is still choosing.
 *
 * Each army has one unit and one card in hand. White held initiative going
 * into the round.
 */
function bothHoldTheirLastCard() {
  const game = createPlayableGame(
    [
      { coord: 'A-1', facing: 'south', player: 'white' },
      { coord: 'I-9', facing: 'north', player: 'black' },
    ],
    { hands: { black: 1, white: 1 }, initiative: 'white' },
  );
  return updatePhaseState(game, createPlayCardsPhaseState());
}

/**
 * One player chooses their only card, as a real submission: the game must
 * accept it as the choice it is waiting on before it is folded in.
 */
function chooseOnlyCard(
  state: ReturnType<typeof bothHoldTheirLastCard>,
  player: PlayerSide,
) {
  const [card] = getOwnedPlayerCardState(state.cardState, player).inHand;
  const event = createChooseCardEvent({ card, player });
  const validation = validatePlayerChoice(event, state);
  if (!validation.result) {
    throw new Error(
      `${player}'s choice was refused: ${validation.errorReason}`,
    );
  }
  return applyEvent(event, state);
}

describe('both players playing their last card in Phase 1', () => {
  it('still waits on the second player after the first chooses its last card', () => {
    const start = bothHoldTheirLastCard();

    // Black chooses its only card, face down. White has not chosen yet.
    const { state, next } = applyEffectsUntilChoice(
      chooseOnlyCard(start, 'black'),
    );

    // Choosing is simultaneous: black's face-down card is not yet in play,
    // so black has not lost, and white is still to choose.
    expect(state.winner).toBeUndefined();
    expect(next).toMatchObject({
      choiceType: 'chooseCard',
      playerSource: 'white',
    });
  });

  it('gives the game to the initiative held going into the round, once both reveal', () => {
    const start = bothHoldTheirLastCard();

    const bothChosen = chooseOnlyCard(chooseOnlyCard(start, 'black'), 'white');
    const { state, next } = applyEffectsUntilChoice(bothChosen);

    // Both hands are empty in the same instant, which only the reveal makes
    // so, and the cards were committed before either was shown (§11.3):
    // white, who held initiative going into the round, wins.
    expect(next).toBe('gameOver');
    expect(state.winner).toBe('white');
  });

  it('reaches the same game whichever player chooses first', () => {
    const start = bothHoldTheirLastCard();

    const blackFirst = applyEffectsUntilChoice(
      chooseOnlyCard(
        applyEffectsUntilChoice(chooseOnlyCard(start, 'black')).state,
        'white',
      ),
    );
    const whiteFirst = applyEffectsUntilChoice(
      chooseOnlyCard(
        applyEffectsUntilChoice(chooseOnlyCard(start, 'white')).state,
        'black',
      ),
    );

    // The order of arrival is not part of the game: the same player wins,
    // and the same cards lie in play.
    expect(whiteFirst.state.winner).toBe(blackFirst.state.winner);
    expect(whiteFirst.state.cardState).toStrictEqual(
      blackFirst.state.cardState,
    );
  });
});

import type { CommandCard } from '@entities';
import type { ChooseRallyEvent } from '@events';
import type { AuthoritativeGameState } from '@game';
import { tempCommandCards } from '@sampleValues';
import { createGameState } from '@testing';
import { projectGameStateForVisibility } from '@transforms';
import { surveyBattlefield } from '@bot/appraisal';
import { defaultBotTemperament } from '@bot/temperament';
import { createSeededRandom } from '@bot/runner';
import { chooseRally } from './chooseRally';

/** The sample card at a position in the list, which must be there. */
function sampleCard(index: number): CommandCard {
  const card = tempCommandCards[index];
  if (card === undefined) {
    throw new Error(`No sample card at ${index}`);
  }
  return card;
}

/** White's choice to rally, or to decline. */
const offers: ChooseRallyEvent[] = [
  {
    choiceType: 'chooseRally',
    eventType: 'playerChoice',
    performRally: true,
    player: 'white',
  },
  {
    choiceType: 'chooseRally',
    eventType: 'playerChoice',
    performRally: false,
    player: 'white',
  },
];

/**
 * When a bot rallies (§10): it weighs the units a support check would cost
 * against the cards it would regain, but never against certain defeat.
 */
describe('chooseRally function', () => {
  it('rallies with its last card in hand, even at the cost of units', () => {
    // Four white units on the board, more than the cards could support.
    const board = createGameState([
      ['C-3', 'white'],
      ['C-4', 'white'],
      ['C-5', 'white'],
      ['C-6', 'white'],
    ]);
    // One card left in hand and two played. Each holds one unit, so after a
    // rally burns one of the three, two units have no place and rout
    // (§10.4). Declining keeps them, but the one card is played next round
    // and the empty hand loses the battle (§11.1).
    const state: AuthoritativeGameState = {
      ...board,
      cardState: {
        ...board.cardState,
        white: {
          ...board.cardState.white,
          inHand: [sampleCard(1)],
          played: [sampleCard(2), sampleCard(3)],
        },
      },
    };
    const view = projectGameStateForVisibility(state, 'whiteSeen');
    const choice = chooseRally(offers, {
      random: createSeededRandom(1),
      seat: 'white',
      survey: surveyBattlefield(view, 'white'),
      temperament: defaultBotTemperament,
      view,
    });
    // Losing two units is better than losing the battle.
    expect(choice.performRally).toBe(true);
  });
});

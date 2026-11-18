import type { PlayerSide } from '@entities';
import type { ChooseCardEvent } from '@events';
import type { Game } from '@game';
import { blackMiniStarterArmy, whiteMiniStarterArmy } from '@sampleValues';

import { createInitialGameState } from '@factories';

import { projectGameForVisibility } from './projectGameForVisibility';

const whiteCard = whiteMiniStarterArmy.commandCards[0];
const blackCard = blackMiniStarterArmy.commandCards[0];

// Each side lays a card face down for the round (§4.1.1).
function chooseCard(player: PlayerSide): ChooseCardEvent {
  const card = player === 'white' ? whiteCard : blackCard;
  return { card, choiceType: 'chooseCard', eventType: 'playerChoice', player };
}

// A mini game in which each side has chosen its card. The current state is
// the opening one: projecting does not apply events, so a state that has
// not caught up with them is enough to show what each view is sent.
function gameWithBothCardsChosen(): Game {
  const gameState = createInitialGameState({
    blackArmy: blackMiniStarterArmy,
    gameMode: 'mini',
    whiteArmy: whiteMiniStarterArmy,
  });
  return {
    blackArmy: blackMiniStarterArmy,
    blackPlayer: '22222222-2222-4222-8222-222222222222',
    events: [chooseCard('white'), chooseCard('black')],
    gameMode: 'mini',
    gameState,
    id: '11111111-1111-4111-8111-111111111111',
    whiteArmy: whiteMiniStarterArmy,
    whitePlayer: '33333333-3333-4333-8333-333333333333',
  };
}

describe('projectGameForVisibility function', () => {
  it('sends a seat no army, since an army lists its hand', () => {
    const projected = projectGameForVisibility(
      gameWithBothCardsChosen(),
      'whiteSeen',
    );

    expect(Object.keys(projected).toSorted()).toStrictEqual([
      'blackPlayer',
      'events',
      'gameMode',
      'gameState',
      'id',
      'openingState',
      'visibility',
      'whitePlayer',
    ]);
  });

  it("opens a seat's game on its own hand, the other hand face down", () => {
    const projected = projectGameForVisibility(
      gameWithBothCardsChosen(),
      'whiteSeen',
    );

    // White reads the hand its army brought; black's is face down, card for card.
    expect(projected.openingState.cardState.white.inHand).toStrictEqual(
      whiteMiniStarterArmy.commandCards,
    );
    expect(projected.openingState.cardState.black.inHand).toStrictEqual(
      blackMiniStarterArmy.commandCards.map(() => 'hidden'),
    );
  });

  it('shows a seat the card it chose, and the other card face down', () => {
    const projected = projectGameForVisibility(
      gameWithBothCardsChosen(),
      'blackSeen',
    );

    expect(projected.events).toStrictEqual([
      {
        card: 'hidden',
        choiceType: 'chooseCard',
        eventType: 'playerChoice',
        player: 'white',
      },
      chooseCard('black'),
    ]);
  });

  it('shows a spectator both chosen cards face down', () => {
    const projected = projectGameForVisibility(
      gameWithBothCardsChosen(),
      'spectator',
    );

    expect(projected.events).toStrictEqual([
      {
        card: 'hidden',
        choiceType: 'chooseCard',
        eventType: 'playerChoice',
        player: 'white',
      },
      {
        card: 'hidden',
        choiceType: 'chooseCard',
        eventType: 'playerChoice',
        player: 'black',
      },
    ]);
    expect(projected.gameState.visibility).toBe('spectator');
  });

  it('keeps every card in view for the authoritative view', () => {
    const game = gameWithBothCardsChosen();

    const projected = projectGameForVisibility(game, 'authoritative');

    // The stream and the current state are the game's own, unredacted.
    expect(projected.events).toStrictEqual([
      chooseCard('white'),
      chooseCard('black'),
    ]);
    expect(projected.gameState).toBe(game.gameState);
    expect(projected.openingState.cardState.black.inHand).toStrictEqual(
      blackMiniStarterArmy.commandCards,
    );
  });
});

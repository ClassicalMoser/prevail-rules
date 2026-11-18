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
    // White's seat asks for the game.
    const projected = projectGameForVisibility(
      gameWithBothCardsChosen(),
      'whiteSeen',
    );

    // Neither army is among what white is sent: black's lists black's hand,
    // and hands are secret (§1.4). Who plays, the mode and the play itself are.
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
    // White's seat asks for the game.
    const projected = projectGameForVisibility(
      gameWithBothCardsChosen(),
      'whiteSeen',
    );

    // White reads the hand its army brought into battle.
    expect(projected.openingState.cardState.white.inHand).toStrictEqual(
      whiteMiniStarterArmy.commandCards,
    );
    // Black's hand is face down, one hidden card for each card black holds,
    // so white knows how many black has but not which (§1.4).
    expect(projected.openingState.cardState.black.inHand).toStrictEqual(
      blackMiniStarterArmy.commandCards.map(() => 'hidden'),
    );
  });

  it('shows a seat the card it chose, and the other card face down', () => {
    // Black's seat asks for the game after both cards are chosen.
    const projected = projectGameForVisibility(
      gameWithBothCardsChosen(),
      'blackSeen',
    );

    expect(projected.events).toStrictEqual([
      // White laid its card face down, so black learns only that white chose
      // (§4.1.1).
      {
        card: 'hidden',
        choiceType: 'chooseCard',
        eventType: 'playerChoice',
        player: 'white',
      },
      // Black chose this card itself, so it is in view.
      chooseCard('black'),
    ]);
  });

  it('shows a spectator both chosen cards face down', () => {
    // A spectator asks for the game after both cards are chosen.
    const projected = projectGameForVisibility(
      gameWithBothCardsChosen(),
      'spectator',
    );

    expect(projected.events).toStrictEqual([
      // A spectator holds neither hand, so white's card is face down…
      {
        card: 'hidden',
        choiceType: 'chooseCard',
        eventType: 'playerChoice',
        player: 'white',
      },
      // …and so is black's (§4.1.1).
      {
        card: 'hidden',
        choiceType: 'chooseCard',
        eventType: 'playerChoice',
        player: 'black',
      },
    ]);
    // The current state is the spectator's view too, not the server's.
    expect(projected.gameState.visibility).toBe('spectator');
  });

  it('keeps every card in view for the authoritative view', () => {
    // A watcher allowed to see every card asks for the game.
    const game = gameWithBothCardsChosen();
    const projected = projectGameForVisibility(game, 'authoritative');

    // Both chosen cards stay in view.
    expect(projected.events).toStrictEqual([
      chooseCard('white'),
      chooseCard('black'),
    ]);
    // The current state is the game's own, nothing hidden.
    expect(projected.gameState).toBe(game.gameState);
    // The opening state shows black's hand too, as black's army brought it.
    expect(projected.openingState.cardState.black.inHand).toStrictEqual(
      blackMiniStarterArmy.commandCards,
    );
  });
});

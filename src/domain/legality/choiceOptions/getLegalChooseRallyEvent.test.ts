import type { GameState } from '@game';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import { createEmptyGameState, createOwnedCardState } from '@factories';
import {
  createCleanupPhaseState,
  createPlayCardsPhaseState,
  createTestCard,
} from '@testing';
import {
  updatePhaseState,
  updatePlayerCardState,
  updateCurrentInitiative,
} from '@transforms';

import { getLegalChooseRallyEvent } from './getLegalChooseRallyEvent';

const chooseRallyBase = {
  choiceType: 'chooseRally' as const,
  eventType: PLAYER_CHOICE_EVENT_TYPE,
};

/**
 * GetLegalChooseRallyEvent: both performRally choices for whichever player may choose
 * during cleanup firstPlayerChooseRally / secondPlayerChooseRally.
 */
describe('getLegalChooseRallyEvent function', () => {
  function stateChooseRally(options: {
    step: 'firstPlayerChooseRally' | 'secondPlayerChooseRally';
    initiative?: 'black' | 'white';
    emptyPlayedPile?: boolean;
  }): GameState {
    const initiated = updateCurrentInitiative(
      createEmptyGameState('standard'),
      options.initiative ?? 'black',
    );
    // By cleanup the round's own card is in each played pile (§4.5.1), so a
    // rally always has a card to burn unless a case empties the pile.
    // Each player's is a card of their own; which card does not matter.
    const blackPlayed = options.emptyPlayedPile ? [] : [createTestCard()];
    const whitePlayed = options.emptyPlayedPile ? [] : [createTestCard()];
    const withBlack = updatePlayerCardState(
      initiated,
      'black',
      createOwnedCardState({ played: blackPlayed }),
    );
    const base = updatePlayerCardState(
      withBlack,
      'white',
      createOwnedCardState({ played: whitePlayed }),
    );
    const phase = createCleanupPhaseState({ step: options.step });
    const state = updatePhaseState(base, phase);
    return state;
  }

  it('firstPlayerChooseRally: returns true/false for initiative player', () => {
    // White holds the initiative, so white chooses first.
    const state = stateChooseRally({
      initiative: 'white',
      step: 'firstPlayerChooseRally',
    });

    // White may rally or decline.
    expect(getLegalChooseRallyEvent(state)).toStrictEqual([
      {
        ...chooseRallyBase,
        performRally: true,
        player: 'white',
      },
      {
        ...chooseRallyBase,
        performRally: false,
        player: 'white',
      },
    ]);
  });

  it('secondPlayerChooseRally: returns true/false for the other player', () => {
    // Black holds the initiative and has chosen; white chooses second.
    const state = stateChooseRally({
      initiative: 'black',
      step: 'secondPlayerChooseRally',
    });

    // White may rally or decline.
    expect(getLegalChooseRallyEvent(state)).toStrictEqual([
      {
        ...chooseRallyBase,
        performRally: true,
        player: 'white',
      },
      {
        ...chooseRallyBase,
        performRally: false,
        player: 'white',
      },
    ]);
  });

  it('a player with nothing in the played pile may only decline', () => {
    // §10.3: a rally burns a card from the played pile, so with none there
    // is nothing to burn and no rally to choose.
    const state = stateChooseRally({
      emptyPlayedPile: true,
      initiative: 'white',
      step: 'firstPlayerChooseRally',
    });

    expect(getLegalChooseRallyEvent(state)).toStrictEqual([
      {
        ...chooseRallyBase,
        performRally: false,
        player: 'white',
      },
    ]);
  });

  it('throws when cleanup step is not a choose-rally step', () => {
    // Cards are still leaving play; nobody has been asked to rally yet.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createCleanupPhaseState({ step: 'cardsLeavePlay' }),
    );

    expect(() => getLegalChooseRallyEvent(state)).toThrow(
      'Not in choose rally step',
    );
  });

  it('throws when not in cleanup phase', () => {
    // The players are still choosing their cards.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );

    expect(() => getLegalChooseRallyEvent(state)).toThrow(
      'Expected cleanup phase, got playCards',
    );
  });
});

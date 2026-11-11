import { tempCommandCards } from '@sampleValues';
import type { Event } from '@events';
import type { GameState } from '@game';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import { PLAY_CARDS_PHASE } from '@game';
import { createCleanupPhaseState, updateCardState } from '@testing';

import {
  updatePhaseState,
  updateRoundEventStream,
  updateCurrentInitiative,
} from '@transforms';

import { getLegalChooseRallyEvent } from './getLegalChooseRallyEvent';

import { createEmptyGameState } from '@factories';

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
    eventStream?: readonly Event[];
    emptyPlayedPile?: boolean;
  }): GameState {
    const initiated = updateCurrentInitiative(
      createEmptyGameState('standard'),
      options.initiative ?? 'black',
    );
    // By cleanup the round's own card is in each played pile (§4.5.1), so a
    // rally always has a card to burn unless a case empties the pile.
    const played = options.emptyPlayedPile ? [] : [tempCommandCards[2]];
    const base = updateCardState(initiated, {
      ...initiated.cardState,
      black: { ...initiated.cardState.black, played },
      white: { ...initiated.cardState.white, played },
    });
    const phase = createCleanupPhaseState({ step: options.step });
    let state = updatePhaseState(base, phase);
    if (options.eventStream) {
      state = updateRoundEventStream(state, options.eventStream);
    }
    return state;
  }

  it('firstPlayerChooseRally: returns true/false for initiative player', () => {
    const state = stateChooseRally({
      initiative: 'white',
      step: 'firstPlayerChooseRally',
    });

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
    const state = stateChooseRally({
      initiative: 'black',
      step: 'secondPlayerChooseRally',
    });

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
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createCleanupPhaseState({ step: 'discardPlayedCards' }),
    );

    expect(() => getLegalChooseRallyEvent(state)).toThrow(
      'Not in choose rally step',
    );
  });

  it('throws when not in cleanup phase', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });

    expect(() => getLegalChooseRallyEvent(state)).toThrow(
      'Expected cleanup phase, got playCards',
    );
  });
});

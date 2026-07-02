import type { StandardBoard } from '@entities';
import type { EventForBoard } from '@events';
import type { GameStateForBoard } from '@game';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import { PLAY_CARDS_PHASE } from '@game';
import { createCleanupPhaseState, createEmptyGameState } from '@testing';
import { updatePhaseState, updateRoundEventStream } from '@transforms';

import { getLegalChooseRallyEvent } from './getLegalChooseRallyEvent';

const chooseRallyBase = {
  choiceType: 'chooseRally' as const,
  eventType: PLAYER_CHOICE_EVENT_TYPE,
};

/**
 * GetLegalChooseRallyEvent: both performRally choices for whichever player may choose
 * during cleanup firstPlayerChooseRally / secondPlayerChooseRally.
 */
describe(getLegalChooseRallyEvent, () => {
  function stateChooseRally(options: {
    step: 'firstPlayerChooseRally' | 'secondPlayerChooseRally';
    initiative?: 'black' | 'white';
    eventStream?: readonly EventForBoard<StandardBoard>[];
  }): GameStateForBoard<StandardBoard> {
    const base = createEmptyGameState({
      currentInitiative: options.initiative ?? 'black',
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
        eventNumber: 0,
        performRally: true,
        player: 'white',
      },
      {
        ...chooseRallyBase,
        eventNumber: 0,
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
        eventNumber: 0,
        performRally: true,
        player: 'white',
      },
      {
        ...chooseRallyBase,
        eventNumber: 0,
        performRally: false,
        player: 'white',
      },
    ]);
  });

  it('uses getNextEventNumber for eventNumber', () => {
    const prior: readonly EventForBoard<StandardBoard>[] = [
      {
        effectType: 'revealCards',
        eventNumber: 0,
        eventType: 'gameEffect',
      },
    ];
    const state = stateChooseRally({
      eventStream: prior,
      step: 'firstPlayerChooseRally',
    });

    const options = getLegalChooseRallyEvent(state);

    expect(options).toHaveLength(2);
    expect(options[0]!.eventNumber).toBe(1);
    expect(options[1]!.eventNumber).toBe(1);
  });

  it('throws when cleanup step is not a choose-rally step', () => {
    const state = updatePhaseState(
      createEmptyGameState(),
      createCleanupPhaseState({ step: 'discardPlayedCards' }),
    );

    expect(() => getLegalChooseRallyEvent(state)).toThrow(
      'Not in choose rally step',
    );
  });

  it('throws when not in cleanup phase', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });

    expect(() => getLegalChooseRallyEvent(state)).toThrow(
      'Expected cleanup phase, got playCards',
    );
  });
});

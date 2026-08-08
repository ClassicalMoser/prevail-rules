import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState, createIssueCommandsPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { getLegalDoneIssuingCommandsEvents } from './getLegalDoneIssuingCommandsEvents';

/**
 * GetLegalDoneIssuingCommandsEvents: forfeit leftover issue slots.
 */
describe(getLegalDoneIssuingCommandsEvents, () => {
  it('returns a done event for the first player when commands remain', () => {
    const state = updatePhaseState(
      createEmptyGameState({ currentInitiative: 'black' }),
      createIssueCommandsPhaseState(createEmptyGameState(), {
        remainingCommandsFirstPlayer: [tempCommandCards[0].command],
        step: 'firstPlayerIssueCommands',
      }),
    );

    expect(getLegalDoneIssuingCommandsEvents(state)).toStrictEqual([
      {
        choiceType: 'doneIssuingCommands',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'black',
      },
    ]);
  });

  it('returns null when remaining commands are empty', () => {
    const state = updatePhaseState(
      createEmptyGameState({ currentInitiative: 'black' }),
      createIssueCommandsPhaseState(createEmptyGameState(), {
        remainingCommandsFirstPlayer: [],
        step: 'firstPlayerIssueCommands',
      }),
    );

    expect(getLegalDoneIssuingCommandsEvents(state)).toBeNull();
  });

  it('returns null outside issue-commands steps', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });

    expect(getLegalDoneIssuingCommandsEvents(state)).toBeNull();
  });
});

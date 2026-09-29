import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import { createIssueCommandsPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { getLegalDoneIssuingCommandsEvents } from './getLegalDoneIssuingCommandsEvents';

import { createEmptyGameState } from '@factories';
/**
 * GetLegalDoneIssuingCommandsEvents: forfeit leftover issue slots.
 */
describe(getLegalDoneIssuingCommandsEvents, () => {
  it('returns a done event for the first player when commands remain', () => {
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createIssueCommandsPhaseState(createEmptyGameState('standard'), {
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
      createEmptyGameState('standard'),
      createIssueCommandsPhaseState(createEmptyGameState('standard'), {
        remainingCommandsFirstPlayer: [],
        step: 'firstPlayerIssueCommands',
      }),
    );

    expect(getLegalDoneIssuingCommandsEvents(state)).toBeNull();
  });

  it('returns null outside issue-commands steps', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });

    expect(getLegalDoneIssuingCommandsEvents(state)).toBeNull();
  });
});

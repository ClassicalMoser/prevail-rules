import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState, createIssueCommandsPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidDoneIssuingCommandsEvent } from './isValidDoneIssuingCommandsEvent';

/**
 * IsValidDoneIssuingCommandsEvent: membership against legal done events.
 */
describe(isValidDoneIssuingCommandsEvent, () => {
  it('accepts done issuing for the active issue player with remaining slots', () => {
    const state = updatePhaseState(
      createEmptyGameState({ currentInitiative: 'black' }),
      createIssueCommandsPhaseState(createEmptyGameState(), {
        remainingCommandsFirstPlayer: [tempCommandCards[0].command],
        step: 'firstPlayerIssueCommands',
      }),
    );

    expect(
      isValidDoneIssuingCommandsEvent(
        {
          choiceType: 'doneIssuingCommands',
          eventNumber: 0,
          eventType: 'playerChoice',
          player: 'black',
        },
        state,
      ),
    ).toStrictEqual({ result: true });
  });

  it('rejects done issuing for the wrong player', () => {
    const state = updatePhaseState(
      createEmptyGameState({ currentInitiative: 'black' }),
      createIssueCommandsPhaseState(createEmptyGameState(), {
        remainingCommandsFirstPlayer: [tempCommandCards[0].command],
        step: 'firstPlayerIssueCommands',
      }),
    );

    expect(
      isValidDoneIssuingCommandsEvent(
        {
          choiceType: 'doneIssuingCommands',
          eventNumber: 0,
          eventType: 'playerChoice',
          player: 'white',
        },
        state,
      ).result,
    ).toBe(false);
  });
});

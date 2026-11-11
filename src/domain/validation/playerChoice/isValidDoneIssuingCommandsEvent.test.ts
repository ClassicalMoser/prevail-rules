import { tempCommandCards } from '@sampleValues';
import { createIssueCommandsPhaseState } from '@testing';

import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { isValidDoneIssuingCommandsEvent } from './isValidDoneIssuingCommandsEvent';

import {
  createDoneIssuingCommandsEvent,
  createEmptyGameState,
} from '@factories';
/**
 * IsValidDoneIssuingCommandsEvent: membership against legal done events.
 */
describe('isValidDoneIssuingCommandsEvent function', () => {
  it('accepts done issuing for the active issue player with remaining slots', () => {
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      createIssueCommandsPhaseState(
        updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
        {
          remainingCommandsFirstPlayer: [tempCommandCards[0].command],
          step: 'firstPlayerIssueCommands',
        },
      ),
    );

    expect(
      isValidDoneIssuingCommandsEvent(
        createDoneIssuingCommandsEvent({
          player: 'black',
        }),
        state,
      ),
    ).toStrictEqual({ result: true });
  });

  it('rejects done issuing for the wrong player', () => {
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      createIssueCommandsPhaseState(
        updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
        {
          remainingCommandsFirstPlayer: [tempCommandCards[0].command],
          step: 'firstPlayerIssueCommands',
        },
      ),
    );

    expect(
      isValidDoneIssuingCommandsEvent(
        createDoneIssuingCommandsEvent({
          player: 'white',
        }),
        state,
      ).result,
    ).toBe(false);
  });
});

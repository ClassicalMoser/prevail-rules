import { tempCommandCards } from '@sampleValues';
import { PLAY_CARDS_PHASE } from '@game';
import { createIssueCommandsPhaseState } from '@testing';

import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { getLegalDoneIssuingCommandsEvents } from './getLegalDoneIssuingCommandsEvents';

import { createEmptyGameState } from '@factories';
/**
 * GetLegalDoneIssuingCommandsEvents: forfeit leftover issue slots.
 */
describe('getLegalDoneIssuingCommandsEvents function', () => {
  it('returns a done event for the first player when commands remain', () => {
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

    expect(getLegalDoneIssuingCommandsEvents(state)).toStrictEqual([
      {
        choiceType: 'doneIssuingCommands',
        eventType: 'playerChoice',
        player: 'black',
      },
    ]);
  });

  it('throws when the player has no orders left to forfeit', () => {
    // Black has issued every order, so there is nothing left to stop short
    // of; the step should already have moved on to resolving them.
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      createIssueCommandsPhaseState(
        updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
        {
          remainingCommandsFirstPlayer: [],
          step: 'firstPlayerIssueCommands',
        },
      ),
    );

    // Nothing asks then, so being asked is the caller's mistake.
    expect(() => getLegalDoneIssuingCommandsEvents(state)).toThrow(
      'black has no orders left to forfeit',
    );
  });

  it('throws while the orders are being resolved rather than issued', () => {
    // Black has stopped issuing and is carrying its orders out.
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      createIssueCommandsPhaseState(
        updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
        {
          remainingCommandsFirstPlayer: [tempCommandCards[0].command],
          step: 'firstPlayerResolveCommands',
        },
      ),
    );

    // A player stops issuing only while issuing (§4.3.3).
    expect(() => getLegalDoneIssuingCommandsEvents(state)).toThrow(
      'Not on an issuing step: firstPlayerResolveCommands',
    );
  });

  it('throws outside the issue commands phase', () => {
    // The players are still choosing their cards.
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      {
        phase: PLAY_CARDS_PHASE,
        step: 'chooseCards',
      },
    );

    expect(() => getLegalDoneIssuingCommandsEvents(state)).toThrow(
      'Expected issueCommands phase, got playCards',
    );
  });
});

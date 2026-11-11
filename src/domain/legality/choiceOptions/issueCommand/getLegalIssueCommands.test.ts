import { tempCommandCards } from '@sampleValues';
import { PLAY_CARDS_PHASE } from '@game';
import { createIssueCommandsPhaseState, updateCardState } from '@testing';

import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { getLegalIssueCommands } from './getLegalIssueCommands';

import { createEmptyGameState } from '@factories';
/**
 * GetLegalIssueCommands: remaining command atoms for the active issue step.
 */
describe('getLegalIssueCommands function', () => {
  it('returns remaining commands for the first player issue step', () => {
    const command = tempCommandCards[0].command;
    let state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    state = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: tempCommandCards[0] },
    });
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        remainingCommandsFirstPlayer: [command],
        step: 'firstPlayerIssueCommands',
      }),
    );

    expect(getLegalIssueCommands(state)).toStrictEqual({
      commands: [command],
      player: 'black',
    });
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

    // Nothing asks for an order then, so being asked is the caller's mistake.
    expect(() => getLegalIssueCommands(state)).toThrow(
      'Expected issueCommands phase, got playCards',
    );
  });

  it('throws when the player has no orders left to issue', () => {
    // Black has issued every order; the step should already have moved on to
    // resolving them.
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

    expect(() => getLegalIssueCommands(state)).toThrow(
      'black has no orders left to issue',
    );
  });
});

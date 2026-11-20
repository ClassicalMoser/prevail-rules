import { tempCommandCards } from '@sampleValues';
import { PLAY_CARDS_PHASE } from '@game';
import { createIssueCommandsPhaseState, updateCardState } from '@testing';

import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { getLegalIssueCommands } from './getLegalIssueCommands';

import { createEmptyGameState } from '@factories';
/**
 * GetLegalIssueCommands: the issuing player, and the command on their card in
 * play that they spend.
 */
describe('getLegalIssueCommands function', () => {
  it('offers the first player the command on their card in play', () => {
    // Black holds the initiative and played this card.
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
        step: 'firstPlayerIssueCommands',
      }),
    );

    // Black spends its card's command (§4.3.1).
    expect(getLegalIssueCommands(state)).toStrictEqual({
      command,
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

  it('throws while the orders are being carried out rather than issued', () => {
    // Black has issued its orders and is carrying them out.
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      createIssueCommandsPhaseState(
        updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
        {
          step: 'firstPlayerResolveCommands',
        },
      ),
    );

    // Orders are issued only on the issuing step (§4.3).
    expect(() => getLegalIssueCommands(state)).toThrow(
      'Not on an issuing step: firstPlayerResolveCommands',
    );
  });
});

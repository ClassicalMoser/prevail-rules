import { createEmptyGameState } from '@factories';
import { tempCommandCards } from '@sampleValues';
import { createIssueCommandsPhaseState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { generateCompleteIssuingCommandsEvent } from './generateCompleteIssuingCommandsEvent';

/**
 * Issuing completes once the issuing player has no order left to issue. Black
 * holds the initiative, so Black issues first.
 */
describe('generateCompleteIssuingCommandsEvent function', () => {
  /** Black's issuing step, with the given orders still to issue. */
  function blackIssuing(
    remaining: (typeof tempCommandCards)[number]['command'][],
  ) {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const state = updatePhaseState(
      base,
      createIssueCommandsPhaseState(base, {
        remainingCommandsFirstPlayer: remaining,
        step: 'firstPlayerIssueCommands',
      }),
    );
    return state;
  }

  it('completes issuing once no order is left', () => {
    // Black has given or forfeited every order.
    const state = blackIssuing([]);

    // The effect carries nothing; the state says whose orders are carried out.
    expect(generateCompleteIssuingCommandsEvent(state)).toStrictEqual({
      effectType: 'completeIssuingCommands',
      eventType: 'gameEffect',
    });
  });

  it('throws while the player still has an order to issue, where nothing asks', () => {
    // Black still has an order left.
    const state = blackIssuing([tempCommandCards[0].command]);

    // The expected engine asks only once none is left.
    expect(() => generateCompleteIssuingCommandsEvent(state)).toThrow(
      new Error('black still has orders left to issue'),
    );
  });

  it('throws off an issuing step, where nothing asks', () => {
    // Black is already carrying its orders out.
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const state = updatePhaseState(
      base,
      createIssueCommandsPhaseState(base, {
        step: 'firstPlayerResolveCommands',
      }),
    );

    expect(() => generateCompleteIssuingCommandsEvent(state)).toThrow(
      new Error('Not on an issuing step: firstPlayerResolveCommands'),
    );
  });
});

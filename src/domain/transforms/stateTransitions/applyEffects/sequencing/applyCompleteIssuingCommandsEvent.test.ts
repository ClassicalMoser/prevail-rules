import { createEmptyGameState } from '@factories';
import { getIssueCommandsPhaseState } from '@queries';
import { createIssueCommandsPhaseState, createTestUnit } from '@testing';
import {
  addUnitsToCommandedUnits,
  updateCurrentInitiative,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyCompleteIssuingCommandsEvent } from './applyCompleteIssuingCommandsEvent';

/**
 * A player with no order left to issue moves on to carrying out the orders
 * given (§4.3): the units they ordered are the units still to act. Black
 * holds the initiative.
 */
describe('applyCompleteIssuingCommandsEvent function', () => {
  const event = {
    effectType: 'completeIssuingCommands' as const,
    eventType: 'gameEffect' as const,
  };

  it('moves the first player on to carrying out their orders', () => {
    // Black has ordered one unit and has no order left to issue.
    const unit = createTestUnit('black', { attack: 3 });
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const issuing = updatePhaseState(
      base,
      createIssueCommandsPhaseState(base, {
        remainingCommandsFirstPlayer: [],
        step: 'firstPlayerIssueCommands',
      }),
    );
    const state = addUnitsToCommandedUnits(issuing, [unit]);

    const completed = applyCompleteIssuingCommandsEvent(event, state);

    // Black now resolves, with the unit it ordered waiting to act.
    expect(getIssueCommandsPhaseState(completed)).toMatchObject({
      remainingUnitsFirstPlayer: [unit],
      step: 'firstPlayerResolveCommands',
    });
  });

  it('moves the second player on to carrying out their orders', () => {
    // White has ordered nothing and has no order left to issue.
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const state = updatePhaseState(
      base,
      createIssueCommandsPhaseState(base, {
        remainingCommandsSecondPlayer: [],
        step: 'secondPlayerIssueCommands',
      }),
    );

    const completed = applyCompleteIssuingCommandsEvent(event, state);

    // White now resolves, with no unit to act.
    expect(getIssueCommandsPhaseState(completed)).toMatchObject({
      remainingUnitsSecondPlayer: [],
      step: 'secondPlayerResolveCommands',
    });
  });
});

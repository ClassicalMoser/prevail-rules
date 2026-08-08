import type { DoneIssuingCommandsEvent } from '@events';
import { tempCommandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createTestUnit,
} from '@testing';
import { getIssueCommandsPhaseState } from '@queries';
import {
  addUnitsToCommandedUnits,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyDoneIssuingCommandsEvent } from './applyDoneIssuingCommandsEvent';

/**
 * ApplyDoneIssuingCommandsEvent: forfeit leftover slots and open resolve.
 */
describe(applyDoneIssuingCommandsEvent, () => {
  function createFirstPlayerIssueState() {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    return updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        remainingCommandsFirstPlayer: [tempCommandCards[0].command],
        remainingCommandsSecondPlayer: [tempCommandCards[1].command],
        step: 'firstPlayerIssueCommands',
      }),
    );
  }

  it('given first player done with remaining slots, clears them and advances to resolve', () => {
    const unit = createTestUnit('black', { attack: 3 });
    let state = createFirstPlayerIssueState();
    state = addUnitsToCommandedUnits(state, [unit]);

    const event: DoneIssuingCommandsEvent = {
      choiceType: 'doneIssuingCommands',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
    };

    const newState = applyDoneIssuingCommandsEvent(event, state);
    const phaseState = getIssueCommandsPhaseState(newState);

    expect(phaseState).toMatchObject({
      remainingCommandsFirstPlayer: [],
      remainingUnitsFirstPlayer: [unit],
      step: 'firstPlayerResolveCommands',
    });
  });

  it('given second player done, advances to secondPlayerResolveCommands', () => {
    const base = createFirstPlayerIssueState();
    const state = updatePhaseState(base, {
      ...getIssueCommandsPhaseState(base),
      remainingCommandsFirstPlayer: [],
      step: 'secondPlayerIssueCommands',
    });

    const newState = applyDoneIssuingCommandsEvent(
      {
        choiceType: 'doneIssuingCommands',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
      },
      state,
    );

    expect(getIssueCommandsPhaseState(newState)).toMatchObject({
      remainingCommandsSecondPlayer: [],
      remainingUnitsSecondPlayer: [],
      step: 'secondPlayerResolveCommands',
    });
  });
});

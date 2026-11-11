import type { GameState, IssueCommandsPhaseStep } from '@game';
import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@factories';
import { getIssueCommandsPhaseState } from '@queries';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestUnit,
} from '@testing';

import { addUnitsToCommandedUnits } from '../units';
import { updateCurrentInitiative } from '../state/updateCurrentInitiative';
import { updatePhaseState } from '../state/updatePhaseState';
import { beginResolvingCommands } from './beginResolvingCommands';
import { clearCommandResolution } from './clearCommandResolution';
import { finishResolvingCommands } from './finishResolvingCommands';
import { openCommandResolution } from './openCommandResolution';
import { updateIssueCommandsStep } from './updateIssueCommandsStep';
import { updateRemainingCommandsForPlayer } from './updateRemainingCommandsForPlayer';
import { updateRemainingUnitsForPlayer } from './updateRemainingUnitsForPlayer';

/** Issue commands on this step, with black holding initiative. */
function issuingOn(step: IssueCommandsPhaseStep): GameState {
  const base = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );
  const state = updatePhaseState(
    base,
    createIssueCommandsPhaseState(base, { step }),
  );
  return state;
}

const blackUnit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
const whiteUnit = createTestUnit('white', { attack: 3, instanceNumber: 1 });

/**
 * Phase 3 by player: the player with initiative issues and carries out their
 * orders first, so the first slots are theirs (§4.3).
 */
describe('updateRemainingUnitsForPlayer function', () => {
  it('writes each player’s units still to act to the slot their initiative gives them', () => {
    const state = issuingOn('firstPlayerResolveCommands');

    const black = getIssueCommandsPhaseState(
      updateRemainingUnitsForPlayer(state, 'black', [blackUnit]),
    );
    const white = getIssueCommandsPhaseState(
      updateRemainingUnitsForPlayer(state, 'white', [whiteUnit]),
    );

    expect(black.remainingUnitsFirstPlayer).toStrictEqual([blackUnit]);
    expect(white.remainingUnitsSecondPlayer).toStrictEqual([whiteUnit]);
  });
});

describe('updateRemainingCommandsForPlayer function', () => {
  it('writes each player’s orders still to give to the slot their initiative gives them', () => {
    const state = issuingOn('firstPlayerIssueCommands');
    const order = tempCommandCards[0].command;

    const black = getIssueCommandsPhaseState(
      updateRemainingCommandsForPlayer(state, 'black', [order]),
    );
    const white = getIssueCommandsPhaseState(
      updateRemainingCommandsForPlayer(state, 'white', [order]),
    );

    expect(black.remainingCommandsFirstPlayer).toStrictEqual([order]);
    expect(white.remainingCommandsSecondPlayer).toStrictEqual([order]);
  });
});

describe('updateIssueCommandsStep function', () => {
  it('moves issue commands to the step given', () => {
    const moved = updateIssueCommandsStep(
      issuingOn('firstPlayerIssueCommands'),
      'firstPlayerResolveCommands',
    );

    expect(getIssueCommandsPhaseState(moved).step).toBe(
      'firstPlayerResolveCommands',
    );
  });
});

describe('openCommandResolution and clearCommandResolution functions', () => {
  it('puts one unit’s move under way, and ends it', () => {
    const state = issuingOn('firstPlayerResolveCommands');
    const move = createMovementResolutionState(state);

    const opened = openCommandResolution(state, move);
    expect(
      getIssueCommandsPhaseState(opened).currentCommandResolutionState,
    ).toBe(move);

    const cleared = clearCommandResolution(opened);
    expect(
      getIssueCommandsPhaseState(cleared).currentCommandResolutionState,
    ).toBe('pending');
  });

  it('throws when another unit’s move is already under way, since orders go one unit at a time', () => {
    const state = issuingOn('firstPlayerResolveCommands');
    const opened = openCommandResolution(
      state,
      createMovementResolutionState(state),
    );

    expect(() =>
      openCommandResolution(opened, createMovementResolutionState(state)),
    ).toThrow('A command is already being resolved');
  });
});

describe('beginResolvingCommands function', () => {
  it('forfeits the orders left and moves on to carrying out the units ordered', () => {
    // Black has ordered one unit and still holds an order it will not give.
    const issuing = updateRemainingCommandsForPlayer(
      issuingOn('firstPlayerIssueCommands'),
      'black',
      [tempCommandCards[0].command],
    );
    const ordered = addUnitsToCommandedUnits(issuing, [blackUnit, whiteUnit]);

    const resolving = getIssueCommandsPhaseState(
      beginResolvingCommands(ordered),
    );

    expect(resolving.remainingCommandsFirstPlayer).toStrictEqual([]);
    // Only black's own ordered units are black's to carry out.
    expect(resolving.remainingUnitsFirstPlayer).toStrictEqual([blackUnit]);
    expect(resolving.step).toBe('firstPlayerResolveCommands');
  });
});

describe('finishResolvingCommands function', () => {
  it('passes from the first player’s orders to the second player issuing theirs', () => {
    const resolving = updateRemainingUnitsForPlayer(
      issuingOn('firstPlayerResolveCommands'),
      'black',
      [blackUnit],
    );

    const finished = getIssueCommandsPhaseState(
      finishResolvingCommands(resolving),
    );

    expect(finished.remainingUnitsFirstPlayer).toStrictEqual([]);
    expect(finished.step).toBe('secondPlayerIssueCommands');
  });

  it('ends the phase once the second player’s orders are carried out', () => {
    const finished = getIssueCommandsPhaseState(
      finishResolvingCommands(issuingOn('secondPlayerResolveCommands')),
    );

    expect(finished.step).toBe('complete');
  });
});

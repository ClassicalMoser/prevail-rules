import type { GameState, IssueCommandsPhaseStep } from '@game';
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
import { updateRemainingUnitsForPlayer } from './updateRemainingUnitsForPlayer';

/** Issue commands on this step, with black holding initiative. */
function issuingOn(step: IssueCommandsPhaseStep): GameState {
  const base = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );
  const state = updatePhaseState(base, createIssueCommandsPhaseState({ step }));
  return state;
}

// One ordered unit for each side.
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

    // Black holds the initiative, so its units take the first list and
    // white's the second.
    expect(black.remainingUnitsFirstPlayer).toStrictEqual([blackUnit]);
    expect(white.remainingUnitsSecondPlayer).toStrictEqual([whiteUnit]);
  });
});

describe('updateIssueCommandsStep function', () => {
  it('moves issue commands to the step given', () => {
    const moved = updateIssueCommandsStep(
      issuingOn('firstPlayerIssueCommands'),
      'firstPlayerResolveCommands',
    );

    // Having issued their orders, the first player carries them out.
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
    // The unit's move is the one under way.
    expect(
      getIssueCommandsPhaseState(opened).currentCommandResolutionState,
    ).toBe(move);

    const cleared = clearCommandResolution(opened);
    // Finished, it leaves nothing under way for the next unit (§4.3.9).
    expect(
      getIssueCommandsPhaseState(cleared).currentCommandResolutionState,
    ).toBe('pending');
  });

  it('throws when another unit’s move is already under way, since orders go one unit at a time', () => {
    // One unit's move is already under way.
    const state = issuingOn('firstPlayerResolveCommands');
    const opened = openCommandResolution(
      state,
      createMovementResolutionState(state),
    );

    // A second black unit's move cannot begin until the first is finished.
    const nextMove = createMovementResolutionState(state, {
      movingUnit: createTestUnit('black', { instanceNumber: 2 }),
    });

    expect(() => openCommandResolution(opened, nextMove)).toThrow(
      'A command is already being resolved',
    );
  });
});

describe('beginResolvingCommands function', () => {
  it('moves on to carrying out the units ordered', () => {
    // Black has issued its orders; units of both sides stand ordered.
    const ordered = addUnitsToCommandedUnits(
      issuingOn('firstPlayerIssueCommands'),
      [blackUnit, whiteUnit],
    );

    const resolving = getIssueCommandsPhaseState(
      beginResolvingCommands(ordered),
    );

    // Only black's own ordered units are black's to carry out.
    expect(resolving.remainingUnitsFirstPlayer).toStrictEqual([blackUnit]);
    expect(resolving.step).toBe('firstPlayerResolveCommands');
  });
});

describe('finishResolvingCommands function', () => {
  it('passes from the first player’s orders to the second player issuing theirs', () => {
    // Black, the first player, still has a unit it has not moved.
    const resolving = updateRemainingUnitsForPlayer(
      issuingOn('firstPlayerResolveCommands'),
      'black',
      [blackUnit],
    );

    const finished = getIssueCommandsPhaseState(
      finishResolvingCommands(resolving),
    );

    // Black's unspent order is forfeited (§4.3.3), and white issues next.
    expect(finished.remainingUnitsFirstPlayer).toStrictEqual([]);
    expect(finished.step).toBe('secondPlayerIssueCommands');
  });

  it('ends the phase once the second player’s orders are carried out', () => {
    const finished = getIssueCommandsPhaseState(
      finishResolvingCommands(issuingOn('secondPlayerResolveCommands')),
    );

    // Nobody is left to give orders, so Phase 3 is over.
    expect(finished.step).toBe('complete');
  });
});

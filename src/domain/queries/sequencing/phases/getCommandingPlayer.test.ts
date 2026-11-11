import type { GameState, IssueCommandsPhaseStep } from '@game';
import { createEmptyGameState } from '@factories';
import { createIssueCommandsPhaseState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getCommandingPlayer } from './getCommandingPlayer';
import { getResolveStepAfterIssuing } from './getResolveStepAfterIssuing';
import { getStepAfterResolvingCommands } from './getStepAfterResolvingCommands';

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

/**
 * The first player issues their orders and carries them out, then the second
 * player does the same; then the phase is done (§4.3).
 */
describe('getCommandingPlayer function', () => {
  it('names the first player on both of the first player’s steps, and the second on theirs', () => {
    expect(getCommandingPlayer(issuingOn('firstPlayerIssueCommands'))).toBe(
      'black',
    );
    expect(getCommandingPlayer(issuingOn('firstPlayerResolveCommands'))).toBe(
      'black',
    );
    expect(getCommandingPlayer(issuingOn('secondPlayerIssueCommands'))).toBe(
      'white',
    );
    expect(getCommandingPlayer(issuingOn('secondPlayerResolveCommands'))).toBe(
      'white',
    );
  });

  it('throws once the phase is complete, when nobody is commanding', () => {
    expect(() => getCommandingPlayer(issuingOn('complete'))).toThrow(
      "Issue commands is not on a player's step: complete",
    );
  });
});

describe('getResolveStepAfterIssuing function', () => {
  it('moves a player who has finished issuing to carrying out their own orders', () => {
    expect(
      getResolveStepAfterIssuing(issuingOn('firstPlayerIssueCommands')),
    ).toBe('firstPlayerResolveCommands');
    expect(
      getResolveStepAfterIssuing(issuingOn('secondPlayerIssueCommands')),
    ).toBe('secondPlayerResolveCommands');
  });

  it('throws off an issuing step', () => {
    expect(() =>
      getResolveStepAfterIssuing(issuingOn('firstPlayerResolveCommands')),
    ).toThrow('Not on an issuing step: firstPlayerResolveCommands');
  });
});

describe('getStepAfterResolvingCommands function', () => {
  it('passes from the first player’s orders to the second’s, and from the second’s to the end of the phase', () => {
    expect(
      getStepAfterResolvingCommands(issuingOn('firstPlayerResolveCommands')),
    ).toBe('secondPlayerIssueCommands');
    expect(
      getStepAfterResolvingCommands(issuingOn('secondPlayerResolveCommands')),
    ).toBe('complete');
  });

  it('throws off a resolve step', () => {
    expect(() =>
      getStepAfterResolvingCommands(issuingOn('firstPlayerIssueCommands')),
    ).toThrow('Not on a resolve commands step: firstPlayerIssueCommands');
  });
});

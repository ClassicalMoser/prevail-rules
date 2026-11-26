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
  const state = updatePhaseState(base, createIssueCommandsPhaseState({ step }));
  return state;
}

/**
 * The first player issues their orders and carries them out, then the second
 * player does the same; then the phase is done (§4.3).
 */
describe('getCommandingPlayer function', () => {
  it('names the first player on both of the first player’s steps, and the second on theirs', () => {
    // Black holds the initiative, so both of the first player's steps are black's.
    expect(getCommandingPlayer(issuingOn('firstPlayerIssueCommands'))).toBe(
      'black',
    );
    expect(getCommandingPlayer(issuingOn('firstPlayerResolveCommands'))).toBe(
      'black',
    );

    // And both of the second player's steps are white's.
    expect(getCommandingPlayer(issuingOn('secondPlayerIssueCommands'))).toBe(
      'white',
    );
    expect(getCommandingPlayer(issuingOn('secondPlayerResolveCommands'))).toBe(
      'white',
    );
  });

  it('throws once the phase is complete, when nobody is commanding', () => {
    // Both players have carried out their orders; asking whose turn it is is
    // out of turn.
    expect(() => getCommandingPlayer(issuingOn('complete'))).toThrow(
      "Issue commands is not on a player's step: complete",
    );
  });
});

describe('getResolveStepAfterIssuing function', () => {
  it('moves a player who has finished issuing to carrying out their own orders', () => {
    // Each player carries out their own orders before the other issues any.
    expect(
      getResolveStepAfterIssuing(issuingOn('firstPlayerIssueCommands')),
    ).toBe('firstPlayerResolveCommands');
    expect(
      getResolveStepAfterIssuing(issuingOn('secondPlayerIssueCommands')),
    ).toBe('secondPlayerResolveCommands');
  });

  it('throws off an issuing step', () => {
    // Orders are already being carried out, so no one is issuing.
    expect(() =>
      getResolveStepAfterIssuing(issuingOn('firstPlayerResolveCommands')),
    ).toThrow('Not on an issuing step: firstPlayerResolveCommands');
  });
});

describe('getStepAfterResolvingCommands function', () => {
  it('passes from the first player’s orders to the second’s, and from the second’s to the end of the phase', () => {
    // The second player issues once the first player's orders are carried out.
    expect(
      getStepAfterResolvingCommands(issuingOn('firstPlayerResolveCommands')),
    ).toBe('secondPlayerIssueCommands');

    // The phase ends once the second player's are.
    expect(
      getStepAfterResolvingCommands(issuingOn('secondPlayerResolveCommands')),
    ).toBe('complete');
  });

  it('throws off a resolve step', () => {
    // Orders are still being issued, so none is being carried out.
    expect(() =>
      getStepAfterResolvingCommands(issuingOn('firstPlayerIssueCommands')),
    ).toThrow('Not on a resolve commands step: firstPlayerIssueCommands');
  });
});

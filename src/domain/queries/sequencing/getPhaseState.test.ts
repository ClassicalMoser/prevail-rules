import { createEmptyGameState } from '@factories';
import {
  createCleanupPhaseState,
  createIssueCommandsPhaseState,
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import {
  getCleanupPhaseState,
  getCurrentPhaseState,
  getIssueCommandsPhaseState,
  getMoveCommandersPhaseState,
  getPlayCardsPhaseState,
  getResolveMeleePhaseState,
} from './getPhaseState';

/**
 * Each getter returns the phase slice on the round when the tag matches.
 * A different phase throws with the tag it found.
 */
describe('getCurrentPhaseState function', () => {
  it('returns the phase slice on the round', () => {
    const phase = createPlayCardsPhaseState({ step: 'revealCards' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(getCurrentPhaseState(state)).toBe(phase);
  });

  it('throws when the round has no phase', () => {
    const state = createEmptyGameState('standard');

    expect(() => getCurrentPhaseState(state)).toThrow(
      'No current phase state found',
    );
  });
});

describe('getPlayCardsPhaseState function', () => {
  it('returns the play-cards slice', () => {
    const phase = createPlayCardsPhaseState({ step: 'revealCards' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(getPlayCardsPhaseState(state)).toBe(phase);
  });

  it('throws when the phase is issue commands', () => {
    const empty = createEmptyGameState('standard');
    const phase = createIssueCommandsPhaseState(empty);
    const state = updatePhaseState(empty, phase);

    expect(() => getPlayCardsPhaseState(state)).toThrow(
      'Expected playCards phase, got issueCommands',
    );
  });
});

describe('getMoveCommandersPhaseState function', () => {
  it('returns the move-commanders slice', () => {
    const phase = createMoveCommandersPhaseState({
      step: 'moveSecondCommander',
    });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(getMoveCommandersPhaseState(state)).toBe(phase);
  });

  it('throws when the phase is play cards', () => {
    const phase = createPlayCardsPhaseState();
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(() => getMoveCommandersPhaseState(state)).toThrow(
      'Expected moveCommanders phase, got playCards',
    );
  });
});

describe('getIssueCommandsPhaseState function', () => {
  it('returns the issue-commands slice', () => {
    const empty = createEmptyGameState('standard');
    const phase = createIssueCommandsPhaseState(empty, {
      step: 'secondPlayerIssueCommands',
    });
    const state = updatePhaseState(empty, phase);

    expect(getIssueCommandsPhaseState(state)).toBe(phase);
  });

  it('throws when the phase is resolve melee', () => {
    const empty = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(empty);
    const state = updatePhaseState(empty, phase);

    expect(() => getIssueCommandsPhaseState(state)).toThrow(
      'Expected issueCommands phase, got resolveMelee',
    );
  });
});

describe('getResolveMeleePhaseState function', () => {
  it('returns the resolve-melee slice', () => {
    const empty = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(empty, { step: 'complete' });
    const state = updatePhaseState(empty, phase);

    expect(getResolveMeleePhaseState(state)).toBe(phase);
  });

  it('throws when the phase is cleanup', () => {
    const phase = createCleanupPhaseState();
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(() => getResolveMeleePhaseState(state)).toThrow(
      'Expected resolveMelee phase, got cleanup',
    );
  });
});

describe('getCleanupPhaseState function', () => {
  it('returns the cleanup slice', () => {
    const phase = createCleanupPhaseState({ step: 'firstPlayerChooseRally' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(getCleanupPhaseState(state)).toBe(phase);
  });

  it('throws when the phase is play cards', () => {
    const phase = createPlayCardsPhaseState();
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(() => getCleanupPhaseState(state)).toThrow(
      'Expected cleanup phase, got playCards',
    );
  });
});

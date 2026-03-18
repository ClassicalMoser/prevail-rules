import type { Phase } from '@entities';
import { createEmptyGameState } from '@testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getExpectedEvent } from './getExpectedEvent';

const {
  getCurrentPhaseStateMock,
  getExpectedCleanupPhaseEventMock,
  getExpectedIssueCommandsPhaseEventMock,
  getExpectedMoveCommandersPhaseEventMock,
  getExpectedPlayCardsPhaseEventMock,
  getExpectedResolveMeleePhaseEventMock,
} = vi.hoisted(() => ({
  getCurrentPhaseStateMock: vi.fn(),
  getExpectedCleanupPhaseEventMock: vi.fn(),
  getExpectedIssueCommandsPhaseEventMock: vi.fn(),
  getExpectedMoveCommandersPhaseEventMock: vi.fn(),
  getExpectedPlayCardsPhaseEventMock: vi.fn(),
  getExpectedResolveMeleePhaseEventMock: vi.fn(),
}));

vi.mock('@queries/sequencing', () => ({
  getCurrentPhaseState: getCurrentPhaseStateMock,
}));

vi.mock('./byPhase', () => ({
  getExpectedCleanupPhaseEvent: getExpectedCleanupPhaseEventMock,
  getExpectedIssueCommandsPhaseEvent: getExpectedIssueCommandsPhaseEventMock,
  getExpectedMoveCommandersPhaseEvent: getExpectedMoveCommandersPhaseEventMock,
  getExpectedPlayCardsPhaseEvent: getExpectedPlayCardsPhaseEventMock,
  getExpectedResolveMeleePhaseEvent: getExpectedResolveMeleePhaseEventMock,
}));

describe('getExpectedEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function expectDelegation(
    phase: Phase,
    delegatedMock: ReturnType<typeof vi.fn>,
    expectedEvent: { actionType: 'gameEffect'; effectType: string },
  ) {
    const state = createEmptyGameState();
    getCurrentPhaseStateMock.mockReturnValue({ phase });
    delegatedMock.mockReturnValue(expectedEvent);

    const result = getExpectedEvent(state);

    expect(result).toBe(expectedEvent);
    expect(getCurrentPhaseStateMock).toHaveBeenCalledWith(state);
    expect(delegatedMock).toHaveBeenCalledWith(state);
  }

  it('should delegate playCards to the play cards phase handler', () => {
    expectDelegation('playCards', getExpectedPlayCardsPhaseEventMock, {
      actionType: 'gameEffect',
      effectType: 'playCardsEvent',
    });
  });

  it('should delegate moveCommanders to the move commanders phase handler', () => {
    expectDelegation(
      'moveCommanders',
      getExpectedMoveCommandersPhaseEventMock,
      {
        actionType: 'gameEffect',
        effectType: 'moveCommandersEvent',
      },
    );
  });

  it('should delegate issueCommands to the issue commands phase handler', () => {
    expectDelegation('issueCommands', getExpectedIssueCommandsPhaseEventMock, {
      actionType: 'gameEffect',
      effectType: 'issueCommandsEvent',
    });
  });

  it('should delegate resolveMelee to the resolve melee phase handler', () => {
    expectDelegation('resolveMelee', getExpectedResolveMeleePhaseEventMock, {
      actionType: 'gameEffect',
      effectType: 'resolveMeleeEvent',
    });
  });

  it('should delegate cleanup to the cleanup phase handler', () => {
    expectDelegation('cleanup', getExpectedCleanupPhaseEventMock, {
      actionType: 'gameEffect',
      effectType: 'cleanupEvent',
    });
  });

  it('should throw for an invalid phase', () => {
    const state = createEmptyGameState();
    getCurrentPhaseStateMock.mockReturnValue({ phase: 'invalidPhase' });

    expect(() => getExpectedEvent(state)).toThrow('Invalid phase');
  });
});

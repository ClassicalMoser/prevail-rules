import type { EnginePorts } from '@application/ports';
import { createEmptyGameState } from '@factories';
import type { GameState } from '@game';

import { handleNewRound } from './handleNewRound';

const ok = { data: undefined, result: true as const };

/** Ports whose snapshot and stream calls all succeed. */
function succeedingPorts(): EnginePorts {
  const ports = {
    eventStreamStorage: {
      flushEventStream: vi.fn().mockResolvedValue(ok),
      newEventStream: vi.fn().mockResolvedValue(ok),
    },
    roundSnapshotStorage: {
      saveRoundSnapshot: vi.fn().mockResolvedValue(ok),
    },
  };
  // Only the snapshot and stream ports are reached when a round begins.
  return ports as unknown as EnginePorts;
}

/** A game whose round `roundNumber` has just begun. */
function atRound(roundNumber: number): GameState {
  const empty = createEmptyGameState('standard');
  const state = {
    ...empty,
    currentRoundState: { ...empty.currentRoundState, roundNumber },
  };
  return state;
}

/**
 * When a round begins, its snapshot is saved, the round before it is flushed,
 * and its own stream is opened. Round 0 is setup, so the round before round 1
 * is round 0, and its stream is flushed like any other.
 */
describe('handleNewRound function', () => {
  it('flushes round 0, setup, when round 1 begins', async () => {
    const ports = succeedingPorts();

    await handleNewRound('game-1', atRound(1), ports);

    expect(ports.eventStreamStorage.flushEventStream).toHaveBeenCalledWith(
      'game-1',
      0,
    );
    expect(ports.eventStreamStorage.newEventStream).toHaveBeenCalledWith(
      'game-1',
      1,
    );
  });

  it('flushes the round before when a later round begins', async () => {
    const ports = succeedingPorts();

    await handleNewRound('game-1', atRound(4), ports);

    expect(ports.eventStreamStorage.flushEventStream).toHaveBeenCalledWith(
      'game-1',
      3,
    );
  });
});

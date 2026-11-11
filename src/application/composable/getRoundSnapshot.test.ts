import type { RoundSnapshotStorage } from '@application/ports';
import { gameModes } from '@entities';
import { createEmptyGameState } from '@factories';

import { getRoundSnapshot } from './getRoundSnapshot';

const mini = gameModes.mini;
const standard = gameModes.standard;

function storageReturning(data: unknown): RoundSnapshotStorage {
  return {
    getRoundSnapshot: vi.fn().mockResolvedValue({ data, result: true }),
    saveRoundSnapshot: vi.fn(),
  };
}

/**
 * A round snapshot is the game state at the end of a round, read back as the
 * authoritative state of the game it belongs to.
 */
describe('getRoundSnapshot function', () => {
  it('returns the stored game state when it is a legal state for the mode', async () => {
    const state = createEmptyGameState('mini');

    const snapshot = await getRoundSnapshot(
      'game-1',
      1,
      mini,
      storageReturning(state),
    );

    expect(snapshot).toStrictEqual(state);
  });

  it('returns undefined when no snapshot is stored for the round', async () => {
    // Storage answers, and holds nothing for this round.
    const empty: RoundSnapshotStorage = {
      getRoundSnapshot: vi
        .fn()
        .mockResolvedValue({ data: undefined, result: true }),
      saveRoundSnapshot: vi.fn(),
    };

    const snapshot = await getRoundSnapshot('game-1', 1, mini, empty);

    expect(snapshot).toBeUndefined();
  });

  it('refuses a snapshot whose board is not the size the mode is played on', async () => {
    // A mini game is played on the small board; a standard board is wrong.
    const state = createEmptyGameState('standard');

    await expect(
      getRoundSnapshot('game-1', 1, mini, storageReturning(state)),
    ).rejects.toThrow('requires board size small, got standard');
  });

  it('refuses stored data that is not a game state at all', async () => {
    await expect(
      getRoundSnapshot(
        'game-1',
        1,
        standard,
        storageReturning({ not: 'a game state' }),
      ),
    ).rejects.toThrow('Not a legal game state');
  });

  it('throws the storage reason when storage fails', async () => {
    const storage: RoundSnapshotStorage = {
      getRoundSnapshot: vi
        .fn()
        .mockResolvedValue({ errorReason: 'disk gone', result: false }),
      saveRoundSnapshot: vi.fn(),
    };

    await expect(getRoundSnapshot('game-1', 1, mini, storage)).rejects.toThrow(
      'disk gone',
    );
  });
});

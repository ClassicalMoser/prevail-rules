import { createEmptyGameState } from '@factories';
import { createInMemoryRoundSnapshotStorage } from './createInMemoryRoundSnapshotStorage';

/** Each round's opening state is kept, by game and round. */
describe('createInMemoryRoundSnapshotStorage function', () => {
  it('reads back the state a round began with, and none for a round never saved', async () => {
    const storage = createInMemoryRoundSnapshotStorage();
    const opening = createEmptyGameState('mini');

    // Round 1's opening is saved.
    await expect(
      storage.saveRoundSnapshot('game-1', 1, opening),
    ).resolves.toStrictEqual({ data: undefined, result: true });

    // It comes back for round 1 of that game.
    await expect(storage.getRoundSnapshot('game-1', 1)).resolves.toStrictEqual({
      data: opening,
      result: true,
    });

    // Round 2 was never saved, so it answers none.
    await expect(storage.getRoundSnapshot('game-1', 2)).resolves.toStrictEqual({
      data: undefined,
      result: true,
    });
  });
});

import { z } from 'zod';

import { refineGameModeBoardSize } from './refineGameModeBoardSize';

/**
 * Accepts any shape, so each case reaches the board size check without the
 * game shape checks getting there first.
 */
const modeBoardSize = z
  .custom<Parameters<typeof refineGameModeBoardSize>[0]>()
  .superRefine(refineGameModeBoardSize);

describe('refineGameModeBoardSize function', () => {
  it('accepts a mini game played on the small board', () => {
    const result = modeBoardSize.safeParse({
      gameMode: 'mini',
      gameState: { boardState: { boardType: 'small' } },
    });

    expect(result.success).toBe(true);
  });

  it('rejects an epic game played on the standard board', () => {
    // Epic is played on the large board.
    const result = modeBoardSize.safeParse({
      gameMode: 'epic',
      gameState: { boardState: { boardType: 'standard' } },
    });

    expect(result.error?.issues).toMatchObject([
      {
        message: 'gameMode epic requires board size large, got standard.',
        path: ['gameState', 'boardState', 'boardType'],
      },
    ]);
  });
});

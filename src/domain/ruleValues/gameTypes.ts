import type { BoardSize, GameType, GameTypeStructure } from '@entities';

export const gameTypes: readonly GameTypeStructure[] = [
  { type: 'tutorial', boardSize: 'small' },
  { type: 'mini', boardSize: 'small' },
  { type: 'standard', boardSize: 'standard' },
];

const boardSizeForGameType = Object.fromEntries(
  gameTypes.map(({ type, boardSize }) => [type, boardSize] as const),
) as Record<GameType, BoardSize>;

/**
 * Board size for a {@link GameType}, from {@link gameTypes}.
 */
export function getBoardSizeForGameType(gameType: GameType): BoardSize {
  return boardSizeForGameType[gameType];
}

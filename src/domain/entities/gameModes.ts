import type { BoardType } from './board';
import { boardType } from './board';
import { z } from 'zod';

export const gameModeNames = ['tutorial', 'mini', 'standard', 'epic'] as const;

export type GameModeName = (typeof gameModeNames)[number];

export interface GameMode {
  name: GameModeName;
  boardSize: BoardType;
}

export const gameModes: readonly GameMode[] = [
  { boardSize: 'small', name: 'tutorial' },
  { boardSize: 'small', name: 'mini' },
  { boardSize: 'standard', name: 'standard' },
  { boardSize: 'large', name: 'epic' },
];

export interface TutorialGameMode extends GameMode {
  name: 'tutorial';
  boardSize: 'small';
}

export interface MiniGameMode extends GameMode {
  name: 'mini';
  boardSize: 'small';
}

export interface StandardGameMode extends GameMode {
  name: 'standard';
  boardSize: 'standard';
}

export interface EpicGameMode extends GameMode {
  name: 'epic';
  boardSize: 'large';
}

export const gameModeSchema: z.ZodType<GameMode> = z.object({
  boardSize: z.enum(boardType),
  name: z.enum(gameModeNames),
});

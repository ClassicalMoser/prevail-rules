import type { GameModeName } from '@entities';
import type { BotGameSetup } from '@bot';
import { defaultBotTemperament } from '@bot';
import {
  blackMiniStarterArmy,
  blackStandardStarterArmy,
  whiteMiniStarterArmy,
  whiteStandardStarterArmy,
} from '@sampleValues';

/**
 * The battle every harness game plays: the sample starter armies for the
 * mode, the default temperament on both sides. Shared by the command and its
 * workers, so a game a worker plays is the game the command asked for.
 *
 * @param mode - `mini` for the small board, otherwise the standard one
 * @returns The setup, without a seed
 */
export function createBotGameSetup(
  mode: GameModeName,
): Omit<BotGameSetup, 'seed'> {
  const mini = mode === 'mini';
  const setup: Omit<BotGameSetup, 'seed'> = {
    blackArmy: mini ? blackMiniStarterArmy : blackStandardStarterArmy,
    blackTemperament: defaultBotTemperament,
    gameMode: mode,
    whiteArmy: mini ? whiteMiniStarterArmy : whiteStandardStarterArmy,
    whiteTemperament: defaultBotTemperament,
  };
  return setup;
}

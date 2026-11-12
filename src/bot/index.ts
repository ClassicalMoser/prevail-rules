// The algorithm: what a bot chooses for its seat, and how it leans.
export { getBotChoice } from './getBotChoice';
export type { BotTemperament } from './temperament';
export { defaultBotTemperament } from './temperament';

// The harness: bots playing each other from seeds, for observation.
export type { BotGameRecord, BotGameSetup, BotGamesSummary } from './runner';
export { createSeededRandom, playBotGame, playBotGames } from './runner';

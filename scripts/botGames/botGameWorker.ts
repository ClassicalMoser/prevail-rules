import type { GameModeName } from '@entities';
import { playBotGame } from '@bot';
import { parentPort } from 'node:worker_threads';
import { createBotGameSetup } from './botGameSetup';

/**
 * A worker thread for `runBotGames`: it plays one game for each seed it is
 * sent and sends back the record. It is started only as a worker, never
 * imported, so listening here at load is its whole job; it prints nothing,
 * and the command reports for it.
 */

/** What the command sends: the mode and the seed of one game to play. */
interface GameRequest {
  mode: GameModeName;
  seed: number;
}

parentPort?.on('message', (request: GameRequest) => {
  // One game, played to its end or its fault; the record says which.
  const record = playBotGame({
    ...createBotGameSetup(request.mode),
    seed: request.seed,
  });
  parentPort?.postMessage(record); // oxlint-disable-line unicorn/require-post-message-target-origin -- a worker thread has no origin
});

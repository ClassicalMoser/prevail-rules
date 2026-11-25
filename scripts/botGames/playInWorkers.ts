import type { GameModeName } from '@ruleValues';
import type { BotGameRecord } from '@bot';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { Worker } from 'node:worker_threads';

/** What a run of games came to, played side by side. */
export interface WorkerRun {
  /** Every game that reported back, in the order they finished. */
  records: BotGameRecord[];
  /** The seeds of games that did not report back in time: a hang. */
  hungSeeds: number[];
}

/** A worker thread that plays one game at a time (`botGameWorker`). */
function startWorker(): Worker {
  const worker = new Worker(new URL('botGameWorker.ts', import.meta.url));
  return worker;
}

/**
 * Plays seeds `1..count` across `workerCount` worker threads, one game at a
 * time on each, and collects the records.
 *
 * The event limit inside a game catches one that keeps playing without
 * ending; it cannot catch one stuck inside a single call. So each game also
 * has a time limit here. A game that has not reported back by then is
 * recorded as hung, by its seed so it can be replayed, and its worker is
 * stopped and replaced.
 *
 * @param mode - The mode every game plays
 * @param count - How many games to play
 * @param workerCount - How many to play at once
 * @param gameTimeoutMs - How long one game may take before it counts as hung
 * @returns The records, and the seeds that hung
 */
export async function playInWorkers(
  mode: GameModeName,
  count: number,
  workerCount: number,
  gameTimeoutMs: number,
): Promise<WorkerRun> {
  const records: BotGameRecord[] = [];
  const hungSeeds: number[] = [];
  // The seeds are shared out as each lane is free: the next one in line.
  let nextSeed = 1;

  // One lane per worker: it takes the next seed, waits for the record or the
  // time limit, and goes on until no seed is left.
  const runLane = async (): Promise<void> => {
    let worker = startWorker();
    while (nextSeed <= count) {
      const seed = nextSeed;
      nextSeed += 1;

      // Whichever comes first: the game's record, or its time running out.
      // A worker that dies outright rejects the wait, failing the run loudly.
      const timer = new AbortController();
      worker.postMessage({ mode, seed }); // oxlint-disable-line unicorn/require-post-message-target-origin -- a worker thread has no origin
      const outcome = await Promise.race([
        once(worker, 'message').then(([record]) => record as BotGameRecord),
        delay(gameTimeoutMs, 'hung' as const, { signal: timer.signal }),
      ]);
      timer.abort();

      // A game back in time is recorded. One that hung is recorded by its
      // seed, and its worker is stopped and replaced for the seeds to come.
      if (outcome === 'hung') {
        hungSeeds.push(seed);
        await worker.terminate();
        worker = startWorker();
      } else {
        records.push(outcome);
      }
    }
    await worker.terminate();
  };

  // Every lane at once; the run is over when the last finishes.
  const lanes = Array.from({ length: Math.min(workerCount, count) }, () =>
    runLane(),
  );
  await Promise.all(lanes);
  const run: WorkerRun = { hungSeeds, records };
  return run;
}

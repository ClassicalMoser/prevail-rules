import type { RandomSource } from '@utils';
import type { GameStateSubscriber } from './gameStateSubscriber';
import type { GameStorage } from './gameStorage';

/** All outbound ports required by the application layer. */
export interface EnginePorts {
  gameStorage: GameStorage;
  gameStateSubscribers: GameStateSubscriber[];
  /**
   * The draw for procedures that roll (currently the rally burn).
   * Live play passes `mathRandom` from `@application/infra`; a recorded flow
   * passes a fixed source so the same transcript produces the same game.
   */
  random: RandomSource;
}

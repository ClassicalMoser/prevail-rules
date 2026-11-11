import type { ExpectedEventInfo } from '@events';
import type { AuthoritativeGameState } from '@game';
import type { RandomSource } from '@utils';
import { getExpectedEvent } from '@expected';
import { generateEventFromProcedure } from '@procedures';
import { applyEvent } from '@transforms';

/**
 * Lets the game run on its own until a player must decide, the way the four
 * engines fit together (ENGINES.md): while the next event is an effect the
 * game owes, build it with its procedure and apply it. Scenario specs use
 * this to play a rule through from end to end, instead of hand-building each
 * state the rule passes through.
 *
 * The state is authoritative, as only the game itself sees both hands and
 * so only it can build the effects it owes. The random source is fixed, so a
 * scenario replays the same way every run.
 *
 * @param state - The state to run from
 * @returns The state where play stops, and the player choice it waits on — or `'gameOver'`
 */
export function applyEffectsUntilChoice(state: AuthoritativeGameState): {
  state: AuthoritativeGameState;
  next: ExpectedEventInfo | 'gameOver';
} {
  // Always the first of anything drawn: scenarios must not vary run to run.
  const fixedRandom: RandomSource = { nextFloat: () => 0 };
  let current = state;
  for (;;) {
    // A finished game expects nothing more.
    if (current.winner !== undefined) {
      const over = { next: 'gameOver' as const, state: current };
      return over;
    }
    const expected = getExpectedEvent(current);
    if (expected.actionType === 'playerChoice') {
      const waiting = { next: expected, state: current };
      return waiting;
    }
    const effect = generateEventFromProcedure(
      current,
      expected.effectType,
      fixedRandom,
    );
    current = applyEvent(effect, current);
  }
}

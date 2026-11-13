/**
 * An injectable source of randomness for the procedures that need one.
 *
 * A procedure bakes its draw into the event it emits, so replaying a stored
 * event stream never consults this. It exists so a caller can fix the draw:
 * a spec or a recorded flow supplies its own source and gets the same game
 * twice. Live play passes `mathRandom` from the application's default
 * infrastructure, which draws from `Math.random`.
 */
export interface RandomSource {
  /** A number in `[0, 1)`. The same contract as `Math.random`. */
  nextFloat: () => number;
}

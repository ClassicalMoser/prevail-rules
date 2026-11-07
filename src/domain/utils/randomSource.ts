/**
 * An injectable source of randomness for the procedures that need one.
 *
 * A procedure bakes its draw into the event it emits, so replaying a stored
 * event stream never consults this. It exists so a caller can fix the draw:
 * a spec or a recorded flow supplies its own source and gets the same game
 * twice. Production passes {@link defaultRandom} and behaves as before.
 */
export interface RandomSource {
  /** A number in `[0, 1)`. The same contract as `Math.random`. */
  nextFloat: () => number;
}

/** The current default production source. Delegates to `Math.random`. */
export const defaultRandom: RandomSource = {
  // Live play draws here; a fixed source in a spec or recording replaces it.
  nextFloat: () => Math.random(),
};

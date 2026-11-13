/**
 * The enumerated legal options for a choice made one part at a time: what may
 * come next, and whether the choice may end where it stands. `@legality`
 * writes it; whoever is building the choice reads it, and so does the
 * validator.
 *
 * Some choices are too many to list whole: every path a unit could walk,
 * every way a hand of support could be spread over an army. Such a choice's
 * legal options are enumerated a part at a time instead: what may follow the
 * parts chosen so far. A validator walks a submitted choice through the same
 * legal options, so a player is never refused by a rule the legal options did
 * not show.
 *
 * Whether a choice may stop is part of the legal options because some rules bind the
 * choice as a whole: a move that entered a front obliquely owes its squaring
 * turn, and a player with support still able to cover a unit must use it.
 */
export interface OpenChoice<Part> {
  /** The parts that may come next. */
  next: readonly Part[];
  /** Whether the choice may end here. */
  mayStop: boolean;
}

/**
 * Why the validator refuses a choice the player built one part at a time.
 * `findIllegal` writes it, by replaying the submitted choice against the same
 * legal options; the validator that called it reads it, to word
 * the refusal it returns. The player never receives this, only that wording.
 *
 * Either one part was not among the legal options enumerated at its point
 * (`notEnumerated`), or every part was legal but the choice ended where the
 * legal options did not allow it to stop (`mayNotStop`).
 */
export type ChoiceRefusal<Part> =
  | {
      /** Which way the choice is illegal. */
      refusal: 'notEnumerated';
      /** Which part, counting from 0, was not among the options. */
      index: number;
      /** The legal options at that point, for the validator's wording. */
      options: OpenChoice<Part>;
    }
  | {
      /** Which way the choice is illegal. */
      refusal: 'mayNotStop';
      /**
       * The legal options where the choice ended, for the validator's
       * wording: what could still have come next.
       */
      options: OpenChoice<Part>;
    };

/**
 * What may come next in a choice made one part at a time, and whether the
 * choice may end where it stands.
 *
 * Some choices are too many to list whole: every path a unit could walk,
 * every way a hand of support could be spread over an army. Such a choice is
 * offered a part at a time instead. A client asks what may follow the parts
 * chosen so far, picks one, and asks again; a validator walks a submitted
 * choice through the same offers. The rules live in the offer, so a player is
 * never refused by a rule the offer did not show them.
 *
 * Whether a choice may stop is part of the offer because some rules bind the
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
 * Where a submitted choice left its offers: a part that was not among those
 * offered at its point, or an end where the choice may not stop.
 */
export type ChoiceRefusal<Part> =
  | {
      refusal: 'notOffered';
      /** The position of the part that was not offered. */
      index: number;
      /** What was offered at that point instead. */
      offered: OpenChoice<Part>;
    }
  | {
      refusal: 'mayNotStop';
      /** What was offered where the choice ended. */
      offered: OpenChoice<Part>;
    };

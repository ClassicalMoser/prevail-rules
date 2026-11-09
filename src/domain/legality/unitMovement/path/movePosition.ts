import type { MoveDelta } from '@entities';
import type { MoveState } from '../explore';

/**
 * Where a path written so far has brought a move. Either the move is still
 * under way at `state`, or it has stopped — stepped into a space it cannot
 * go on from, an enemy above all — and `closing` holds what the rules still
 * require of it: the squaring turn of an oblique front approach (§6.2.3),
 * or nothing.
 */
export interface MovePosition {
  /** The point the path has reached. */
  state: MoveState;
  /** `undefined` while the move is under way; once it has stopped, the moves it still owes. */
  closing: readonly MoveDelta[] | undefined;
}

// The one statement of who may stand in a line (§4.3.5).
export { canJoinLine } from './canJoinLine';
// The unbroken rank a line is drawn from; a line is any run of up to eight of it.
export { getLineSegmentContainingUnit } from './getLineSegmentContainingUnit';
// The stretch of a rank between two ends.
export { findRankSpanBetweenEnds } from './findRankSpanBetweenEnds';
export type { RankSpan } from './findRankSpanBetweenEnds';

// The units of a line named by its two ends.
export { getLineBetweenEnds } from './getLineBetweenEnds';

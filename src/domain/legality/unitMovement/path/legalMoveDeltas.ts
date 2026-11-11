import type { MoveDelta } from '@entities';
import type { PartOffer } from '@utils';

/**
 * What a player may do next in a move they are writing: which steps and
 * turns may follow, and whether the move may stop here instead. A client
 * offers these one at a time — the assisted UI and the manual
 * turn-reverse-step input alike — and a validator checks each submitted
 * move against them.
 */
export type LegalMoveDeltas = PartOffer<MoveDelta>;

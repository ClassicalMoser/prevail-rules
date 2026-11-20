import type { AssertExact } from '@utils';
import type { CommitToMeleeEvent } from './commitToMelee';
import type { CommitToMovementEvent } from './commitToMovement';
import type { CommitToRangedAttackEvent } from './commitToRangedAttack';
import type { CommitToRangedDefenseEvent } from './commitToRangedDefense';

/**
 * The four moments a card may be committed for +1 to a stat it names (§8.4):
 * before a move, by the shooter and then by its target in a shot, and by
 * each side in a melee. Each is its own choice, but all four are the same
 * decision: a card from hand, or none.
 *
 * commitToMovement serves two of those moments: the mover's, before it moves
 * (§4.3.10), and the defender's, when a front engagement offers it the chance
 * to fall back (§6.3.2).
 */
// The four commit events are kept apart on purpose: the same fields, but
// what each card adds to, when it is offered and how it is applied differ.
export const commitmentChoiceTypes = [
  'commitToMovement',
  'commitToRangedAttack',
  'commitToRangedDefense',
  'commitToMelee',
] as const;

/** One of the four moments a card may be committed (§8.4). */
export type CommitmentChoiceType = (typeof commitmentChoiceTypes)[number];

/** A commitment, or a refusal to commit, at any of the four moments (§8). */
export type CommitmentEvent =
  | CommitToMovementEvent
  | CommitToRangedAttackEvent
  | CommitToRangedDefenseEvent
  | CommitToMeleeEvent;

/** The list names exactly the choices the commitment events are. */
const _assertExactCommitmentChoiceType: AssertExact<
  CommitmentChoiceType,
  CommitmentEvent['choiceType']
> = true;

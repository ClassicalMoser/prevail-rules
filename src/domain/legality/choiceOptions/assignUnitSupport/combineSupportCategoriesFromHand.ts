import type { CommandCard, UnitSupport } from '@entities';
import { isSameUnitSupportKind } from '@queries';

/**
 * Sums hand cards into support grants (unit type, trait, or generic).
 * Skips `count &lt; 1`. Does not attach eligible units.
 *
 * Order follows first appearance in `hand`.
 */
export function combineSupportCategoriesFromHand(
  hand: readonly Pick<CommandCard, 'unitSupport'>[],
): UnitSupport[] {
  const stacks: UnitSupport[] = [];

  for (const card of hand) {
    const { unitSupport } = card;

    // Every card holds at least one place (§10.4.2); a card holding none
    // has nothing to add to any stack.
    if (unitSupport.count < 1) {
      continue;
    }

    // Cards naming the same kind of unit stack into one (§10.4.3), so look
    // for a stack this card's kind already began.
    const stackIndex = stacks.findIndex((stack) =>
      isSameUnitSupportKind(stack, unitSupport),
    );

    // The first card of its kind begins a new stack, in hand order.
    if (stackIndex === -1) {
      stacks.push({ ...unitSupport });
      continue;
    }

    // A later card of the same kind adds its places to that stack.
    const stack = stacks[stackIndex];
    stacks[stackIndex] = { ...stack, count: stack.count + unitSupport.count };
  }

  // One stack per kind of unit named, each holding every place its cards hold.
  return stacks;
}

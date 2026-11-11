import type { CommandCard } from '@entities';
import type { ValidationResult } from '@utils';
import { haveSameMembers } from '@utils';
import {
  areCommandsEqual,
  areModifiersArraysEqual,
  areRestrictionsEqual,
} from '../commandEquivalence';
import { areUnitSupportsEqual } from './areUnitSupportsEqual';
import { isSameCard } from './isSameCard';

/**
 * Whether two copies of a card agree in every part: the same card, the same
 * version and name, the same initiative and cost, the same stats it may be
 * committed for (each as many times), the same command, round effect and
 * unit support.
 *
 * A card the game is handed is checked against the card the game holds with
 * this, so a copy that keeps the real card's id but claims stronger stats is
 * caught. The reason names the first part that differs.
 *
 * @param held - The card as the game holds it
 * @param given - The card as it was handed in
 * @returns A passing result when the two agree, naming the first difference otherwise
 */
export function isSameCardValue(
  held: CommandCard,
  given: CommandCard,
): ValidationResult {
  if (!isSameCard(held, given)) {
    return {
      errorReason: `Cards ${held.id} and ${given.id} are different cards`,
      result: false,
    };
  }

  // Each part in turn, so the reason says which one was altered.
  const parts: [string, boolean][] = [
    ['version', held.version === given.version],
    ['name', held.name === given.name],
    ['initiative', held.initiative === given.initiative],
    ['cost', held.cost === given.cost],
    ['commit stats', haveSameMembers(held.modifiers, given.modifiers)],
    ['command', areCommandsEqual(held.command, given.command)],
    [
      'round effect',
      areModifiersArraysEqual(
        held.roundEffect.modifiers,
        given.roundEffect.modifiers,
      ) &&
        areRestrictionsEqual(
          held.roundEffect.restrictions,
          given.roundEffect.restrictions,
        ),
    ],
    ['unit support', areUnitSupportsEqual(held.unitSupport, given.unitSupport)],
  ];
  const differing = parts.find(([, same]) => !same);
  if (differing !== undefined) {
    return {
      errorReason: `Card ${given.id} differs from the card held in its ${differing[0]}`,
      result: false,
    };
  }
  return { result: true };
}

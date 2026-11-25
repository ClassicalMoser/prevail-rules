import type { Command } from '@entities';
import { areModifiersArraysEqual } from './areModifiersArraysEqual';
import { areRestrictionsEqual } from './areRestrictionsEqual';

/**
 * Whether two commands are the same command by value: the same type, size and
 * number of orders, the same restrictions on who may take them, and the same
 * modifiers. Two copies of one command written out separately are equal;
 * the objects need not be the same.
 *
 * @param command1 - The first command
 * @param command2 - The second command
 * @returns True when every part of the two commands matches
 */
export function areCommandsEqual(
  command1: Command,
  command2: Command,
): boolean {
  // A Move command is not a Shoot command (§4.3.1).
  if (command1.type !== command2.type) {
    return false;
  }

  // Ordering units is not ordering lines (§4.3.2, §4.3.3).
  if (command1.size !== command2.size) {
    return false;
  }

  // Four units is not two: the number is how many the order may name.
  if (command1.number !== command2.number) {
    return false;
  }

  // The same order must reach the same units: the same traits or types, and
  // the same inspiration range (§4.3.4).
  if (!areRestrictionsEqual(command1.restrictions, command2.restrictions)) {
    return false;
  }

  // And it must give the units it orders the same modifiers (§4.3.8).
  const sameModifiers = areModifiersArraysEqual(
    command1.modifiers,
    command2.modifiers,
  );
  return sameModifiers;
}

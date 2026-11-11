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
  if (command1.type !== command2.type) {
    return false;
  }
  if (command1.size !== command2.size) {
    return false;
  }
  if (command1.number !== command2.number) {
    return false;
  }
  if (!areRestrictionsEqual(command1.restrictions, command2.restrictions)) {
    return false;
  }
  const sameModifiers = areModifiersArraysEqual(
    command1.modifiers,
    command2.modifiers,
  );
  return sameModifiers;
}

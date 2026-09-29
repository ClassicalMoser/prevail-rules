import type { Command } from '@entities';
import {
  areModifiersArraysEqual,
  areRestrictionsEqual,
} from './commandEquivalence';

/**
 * Finds a matching command in a set of commands by comparing all properties.
 *
 * @param commands - The set of commands to search
 * @param targetCommand - The command to find a match for
 * @returns The matching command if found, undefined otherwise
 */
export function findMatchingCommand(
  commands: Command[],
  targetCommand: Command,
): Command | undefined {
  return [...commands].find((c) => {
    // Compare primitive properties
    if (c.type !== targetCommand.type) {
      return false;
    }
    if (c.size !== targetCommand.size) {
      return false;
    }
    if (c.number !== targetCommand.number) {
      return false;
    }

    // Compare restrictions object
    if (!areRestrictionsEqual(c.restrictions, targetCommand.restrictions)) {
      return false;
    }

    // Compare modifiers array
    if (!areModifiersArraysEqual(c.modifiers, targetCommand.modifiers)) {
      return false;
    }

    // If all checks pass, the commands are equivalent.
    return true;
  });
}

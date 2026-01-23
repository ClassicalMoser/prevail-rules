import type { Command } from '@entities';
import { areModifiersArraysEqual, areRestrictionsEqual } from '@validation';

/**
 * Finds a matching command in a set of commands by comparing all properties.
 *
 * @param commands - The set of commands to search
 * @param targetCommand - The command to find a match for
 * @returns The matching command if found, undefined otherwise
 */
export function findMatchingCommand(
  commands: Set<Command>,
  targetCommand: Command,
): Command | undefined {
  return Array.from(commands).find((c) => {
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
    const restrictionsComparison = areRestrictionsEqual(
      c.restrictions,
      targetCommand.restrictions,
    );
    if (!restrictionsComparison.result) {
      return false;
    }

    // Compare modifiers array
    const modifiersComparison = areModifiersArraysEqual(
      c.modifiers,
      targetCommand.modifiers,
    );
    if (!modifiersComparison.result) {
      return false;
    }

    return true;
  });
}

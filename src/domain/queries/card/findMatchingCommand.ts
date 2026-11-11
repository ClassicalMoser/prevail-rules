import type { Command } from '@entities';
import { areCommandsEqual } from './commandEquivalence';

/**
 * Finds a matching command in a set of commands by comparing all properties.
 *
 * @param commands - The set of commands to search
 * @param targetCommand - The command to find a match for
 * @returns The matching command if found, undefined otherwise
 */
export function findMatchingCommand(
  commands: readonly Command[],
  targetCommand: Command,
): Command | undefined {
  const match = commands.find((command) =>
    areCommandsEqual(command, targetCommand),
  );
  return match;
}

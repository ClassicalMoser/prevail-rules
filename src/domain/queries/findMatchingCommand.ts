import type { Command } from '@entities';

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
  return Array.from(commands).find(
    (c) =>
      c.type === targetCommand.type &&
      c.size === targetCommand.size &&
      c.number === targetCommand.number &&
      JSON.stringify(c.restrictions) === JSON.stringify(targetCommand.restrictions) &&
      JSON.stringify(c.modifiers) === JSON.stringify(targetCommand.modifiers),
  );
}

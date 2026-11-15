import type { Command } from '@entities';
import { findMatchingCommand } from './findMatchingCommand';

/**
 * The command in a set that matches an issued one, property by property. An
 * order is checked against the player's remaining commands before it is
 * applied, so the transform spending it reads the match here. A command with
 * no match is a fault, not a refusal.
 *
 * @param commands - The set of commands to search
 * @param targetCommand - The command to find a match for
 * @returns The matching command from the set
 * @throws Error when no command in the set matches
 */
export function getMatchingCommand(
  commands: readonly Command[],
  targetCommand: Command,
): Command {
  // The same search as the finder; only a missing answer differs.
  const match = findMatchingCommand(commands, targetCommand);
  if (match === undefined) {
    throw new Error('No remaining command matches the one issued');
  }
  return match;
}

import type { Command } from '@entities';

/**
 * Turns an in-play card {@link Command} into remaining-command slots for
 * issue-commands.
 *
 * - `size: 'lines'`: expand ×N into N distinct `{ number: 1 }` slots (each
 *   issue spends one line).
 * - `size: 'units'`: keep a single grant (one issue with `number` units).
 */
export function toRemainingCommands(command: Command): Command[] {
  if (command.size === 'lines') {
    return Array.from({ length: command.number }, () => ({
      ...command,
      number: 1,
    }));
  }
  return [command];
}

import type { Command, Restrictions } from '@entities';

/**
 * A command with empty modifiers and restrictions, so a test can build a command without a card.
 */
export function createTestCommand(overrides: Partial<Command> = {}): Command {
  const restrictions: Restrictions = {
    inspirationRangeRestriction: -1,
    restrictionType: 'none',
  };
  const command: Command = {
    modifiers: [],
    number: 1,
    restrictions,
    size: 'units',
    type: 'movement',
    ...overrides,
  };
  return command;
}

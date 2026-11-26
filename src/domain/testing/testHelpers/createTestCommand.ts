import { NO_INSPIRATION_RANGE } from '@ruleValues';
import type { Command, Restrictions } from '@entities';

/**
 * A command with empty modifiers and restrictions, so a test can build a command without a card.
 */
export function createTestCommand(overrides: Partial<Command> = {}): Command {
  // Any unit may be ordered, wherever it stands: no trait or type filter,
  // and no inspiration range (§4.3.4).
  const restrictions: Restrictions = {
    inspirationRangeRestriction: NO_INSPIRATION_RANGE,
    restrictionType: 'none',
  };

  // A Move order for one unit, with no bonus to the units it reaches
  // (§4.3.1, §4.3.8). A spec about a Shoot or a line names it.
  const command: Command = {
    modifiers: [],
    number: 1,
    restrictions,
    size: 'units',
    type: 'movement',
    ...overrides,
  };

  // The command, for a card or a spec to carry.
  return command;
}

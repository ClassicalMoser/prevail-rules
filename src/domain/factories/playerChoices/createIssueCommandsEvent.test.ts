import { createTestUnit } from '@testing';

import { createIssueCommandsEvent } from './createIssueCommandsEvent';

describe('createIssueCommandsEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    // White spends a units command on one unit.
    const allocation = {
      allocationType: 'units' as const,
      units: [createTestUnit('white')],
    };

    const event = createIssueCommandsEvent({ allocation, player: 'white' });

    // The allocation is kept as it was given.
    expect(event).toStrictEqual({
      allocation,
      choiceType: 'issueCommands',
      eventType: 'playerChoice',
      player: 'white',
    });
  });
});

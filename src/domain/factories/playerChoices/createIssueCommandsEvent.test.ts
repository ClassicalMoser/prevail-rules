import { createTestUnit } from '@testing';

import { createIssueCommandsEvent } from './createIssueCommandsEvent';

describe('createIssueCommandsEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
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

  it('keeps an allocation that orders nobody, which declines', () => {
    // A player who orders no unit declines the order (§4.3.2).
    const event = createIssueCommandsEvent({
      allocation: { allocationType: 'units', units: [] },
      player: 'black',
    });

    // The empty allocation is kept, not filled in.
    expect(event.allocation).toStrictEqual({
      allocationType: 'units',
      units: [],
    });
  });
});

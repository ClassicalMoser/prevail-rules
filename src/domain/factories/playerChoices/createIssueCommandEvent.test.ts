import { createTestCommand, createTestUnit } from '@testing';

import { createIssueCommandEvent } from './createIssueCommandEvent';

describe('createIssueCommandEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const command = createTestCommand();
    const selection = {
      selectionType: 'units' as const,
      units: [createTestUnit('white')],
    };

    const event = createIssueCommandEvent({
      player: 'white',
      order: { command, selection },
    });

    expect(event).toStrictEqual({
      choiceType: 'issueCommand',
      eventType: 'playerChoice',
      player: 'white',
      order: { command, selection },
    });
  });

  it('keeps a null order, which stops giving orders', () => {
    // A player who stops issues no order.
    const event = createIssueCommandEvent({ player: 'black', order: null });

    // The null is kept as it was given, not filled in.
    expect(event).toStrictEqual({
      choiceType: 'issueCommand',
      eventType: 'playerChoice',
      order: null,
      player: 'black',
    });
  });
});

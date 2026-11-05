import { createTestCommand, createTestUnit } from '@testing';

import { createIssueCommandEvent } from './createIssueCommandEvent';

describe('createIssueCommandEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const command = createTestCommand();
    const units = [createTestUnit('white')];

    const event = createIssueCommandEvent({
      command,
      eventNumber: 3,
      player: 'white',
      units,
    });

    expect(event).toStrictEqual({
      choiceType: 'issueCommand',
      command,
      eventNumber: 3,
      eventType: 'playerChoice',
      player: 'white',
      units,
    });
  });
});

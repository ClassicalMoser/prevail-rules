import { createTestCommand, createTestUnit } from '@testing';

import { createIssueCommandEvent } from './createIssueCommandEvent';

describe('createIssueCommandEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const command = createTestCommand();
    const units = [createTestUnit('white')];

    const event = createIssueCommandEvent({
      command,
      player: 'white',
      units,
    });

    expect(event).toStrictEqual({
      choiceType: 'issueCommand',
      command,
      eventType: 'playerChoice',
      player: 'white',
      units,
    });
  });
});

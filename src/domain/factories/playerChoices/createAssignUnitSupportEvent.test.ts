import type { UnitSupportAssignment } from '@events';
import { createTestUnit } from '@testing';

import { createAssignUnitSupportEvent } from './createAssignUnitSupportEvent';

describe('createAssignUnitSupportEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const assignments: UnitSupportAssignment[] = [
      {
        unitSupport: { count: 1, supportType: 'generic' },
        units: [createTestUnit('white')],
      },
    ];

    const event = createAssignUnitSupportEvent({
      assignments,
      eventNumber: 3,
      player: 'white',
    });

    expect(event).toStrictEqual({
      assignments,
      choiceType: 'assignUnitSupport',
      eventNumber: 3,
      eventType: 'playerChoice',
      player: 'white',
    });
  });
});

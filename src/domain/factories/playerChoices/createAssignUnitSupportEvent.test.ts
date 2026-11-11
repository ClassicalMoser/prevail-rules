import type { UnitSupportAssignment } from '@events';
import { createTestUnit } from '@testing';

import { createAssignUnitSupportEvent } from './createAssignUnitSupportEvent';

describe('createAssignUnitSupportEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();
    const assignments: UnitSupportAssignment[] = [
      {
        unitSupport: { count: 1, supportType: 'generic' },
        unit: createTestUnit('white'),
      },
    ];

    const event = createAssignUnitSupportEvent({
      assignments,
      player: 'white',
    });

    expect(event).toStrictEqual({
      assignments,
      choiceType: 'assignUnitSupport',
      eventType: 'playerChoice',
      player: 'white',
    });
  });
});

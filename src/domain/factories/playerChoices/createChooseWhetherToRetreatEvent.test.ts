import { createChooseWhetherToRetreatEvent } from './createChooseWhetherToRetreatEvent';

describe('createChooseWhetherToRetreatEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();

    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      eventNumber: 3,
      player: 'white',
    });

    expect(event).toStrictEqual({
      choiceType: 'chooseWhetherToRetreat',
      choosesToRetreat: true,
      eventNumber: 3,
      eventType: 'playerChoice',
      player: 'white',
    });
  });
});

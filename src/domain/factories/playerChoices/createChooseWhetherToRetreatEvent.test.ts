import { createChooseWhetherToRetreatEvent } from './createChooseWhetherToRetreatEvent';

describe('createChooseWhetherToRetreatEvent function', () => {
  it('fills in the event and choice types and keeps every other field', () => {
    expect.hasAssertions();

    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      player: 'white',
    });

    expect(event).toStrictEqual({
      choiceType: 'chooseWhetherToRetreat',
      choosesToRetreat: true,
      eventType: 'playerChoice',
      player: 'white',
    });
  });
});

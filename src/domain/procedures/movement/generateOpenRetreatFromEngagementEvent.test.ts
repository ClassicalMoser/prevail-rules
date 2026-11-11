import { generateOpenRetreatFromEngagementEvent } from './generateOpenRetreatFromEngagementEvent';

/**
 * A defender engaged from the front that chose to fall back (§6.3.2): the
 * effect that opens its retreat. Where it may go was recorded when the
 * engagement worked out the retreat option, so the event carries nothing.
 */
describe('generateOpenRetreatFromEngagementEvent function', () => {
  it('says only that the retreat opens', () => {
    expect(generateOpenRetreatFromEngagementEvent()).toStrictEqual({
      effectType: 'openRetreatFromEngagement',
      eventType: 'gameEffect',
    });
  });
});

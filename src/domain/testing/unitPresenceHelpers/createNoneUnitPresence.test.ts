import { createNoneUnitPresence } from './createNoneUnitPresence';

/**
 * CreateNoneUnitPresence: Creates a none unit presence for testing.
 */
describe('createNoneUnitPresence function', () => {
  it('given context, returns none presence', () => {
    const presence = createNoneUnitPresence();
    expect(presence.presenceType).toBe('none');
  });
});

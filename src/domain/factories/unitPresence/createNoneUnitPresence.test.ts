import { createNoneUnitPresence } from './createNoneUnitPresence';

/** What a board space holds when no unit stands on it. */
describe('createNoneUnitPresence function', () => {
  it('is an empty space, holding no unit', () => {
    const presence = createNoneUnitPresence();
    expect(presence.presenceType).toBe('none');
  });
});

import { createTestUnit } from '@testing/unitHelpers';
import { createRoutState } from './routState';

describe('createRoutState function', () => {
  it('given context, returns rout substep with player and unit', () => {
    const unit = createTestUnit('white');
    const state = createRoutState('white', unit);
    expect(state.substepType).toBe('rout');
    expect(state.player).toBe('white');
    expect(state.unitsToRout).toContain(unit);
    expect(state.completed).toBe(false);
  });
});

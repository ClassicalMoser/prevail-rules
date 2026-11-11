import { createTestUnit } from '@testing';

import { createAttackApplyState } from './createAttackApplyState';

describe('createAttackApplyState function', () => {
  it('leaves every result reached due, the rout as well as the retreat and reverse', () => {
    const defender = createTestUnit('white', { attack: 2 });
    // Rout is the hardest threshold, so an attack that routs often cleared the
    // other two as well. Each is carried out in its place (§7.5.2): the unit
    // falls back and turns about before it routs.
    const apply = createAttackApplyState(defender, {
      unitRetreated: true,
      unitReversed: true,
      unitRouted: true,
    });

    expect(apply.retreatState).toBe('pending');
    expect(apply.reverseState).toBe('pending');
    expect(apply.routState).toBe('pending');
  });

  it('opens both the retreat and the reverse when the attack reached both', () => {
    const defender = createTestUnit('white', { attack: 2 });
    // Both apply to one attack, so both are due.
    const apply = createAttackApplyState(defender, {
      unitRetreated: true,
      unitReversed: true,
      unitRouted: false,
    });

    expect(apply.retreatState).toBe('pending');
    expect(apply.reverseState).toBe('pending');
    expect(apply.routState).toBe('bypassed');
  });

  it('opens the retreat alone when the reverse threshold went unmet', () => {
    const defender = createTestUnit('white', { attack: 2 });
    // Only the retreat was reached, so only the retreat resolves.
    const apply = createAttackApplyState(defender, {
      unitRetreated: true,
      unitReversed: false,
      unitRouted: false,
    });

    expect(apply.retreatState).toBe('pending');
    expect(apply.reverseState).toBe('bypassed');
    expect(apply.routState).toBe('bypassed');
  });

  it('opens the reverse alone when the attack reached no higher', () => {
    const defender = createTestUnit('white', { attack: 2 });
    // The lightest outcome, and the only one due.
    const apply = createAttackApplyState(defender, {
      unitRetreated: false,
      unitReversed: true,
      unitRouted: false,
    });

    expect(apply.reverseState).toBe('pending');
    expect(apply.retreatState).toBe('bypassed');
    expect(apply.routState).toBe('bypassed');
  });

  it('bypasses every outcome when the attack reached nothing', () => {
    const defender = createTestUnit('white', { attack: 2 });
    // A normal outcome, common in melee: the defender is left where it stood.
    const apply = createAttackApplyState(defender, {
      unitRetreated: false,
      unitReversed: false,
      unitRouted: false,
    });

    expect(apply.retreatState).toBe('bypassed');
    expect(apply.reverseState).toBe('bypassed');
    expect(apply.routState).toBe('bypassed');
  });

  it('leaves the apply open for the sequencer to complete', () => {
    const defender = createTestUnit('white', { attack: 2 });
    // Even with nothing due, the apply waits for `completeAttackApply`.
    const apply = createAttackApplyState(defender, {
      unitRetreated: false,
      unitReversed: false,
      unitRouted: false,
    });

    expect(apply.completed).toBe(false);
    expect(apply.defendingUnit).toBe(defender);
    expect(apply.substepType).toBe('attackApply');
  });
});

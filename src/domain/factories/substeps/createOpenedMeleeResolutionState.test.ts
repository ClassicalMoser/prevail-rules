import { createOpenedMeleeResolutionState } from './createOpenedMeleeResolutionState';

/**
 * A melee is fought one space at a time: each player may commit a card, then
 * both blows land and their results are applied (§4.4.2, §7.5).
 */
describe('createOpenedMeleeResolutionState function', () => {
  it('opens a melee at its space with nothing committed and nothing struck', () => {
    expect(createOpenedMeleeResolutionState('E-5')).toStrictEqual({
      completed: false,
      firstPlayerAttackApplyState: 'pending',
      firstPlayerCommitment: { commitmentType: 'pending' },
      location: 'E-5',
      secondPlayerAttackApplyState: 'pending',
      secondPlayerCommitment: { commitmentType: 'pending' },
      substepType: 'meleeResolution',
    });
  });
});

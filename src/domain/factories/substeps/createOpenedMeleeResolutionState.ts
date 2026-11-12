import type { Coordinate } from '@entities';
import type { MeleeResolutionState } from '@game';

/**
 * A melee the moment it is chosen to be fought (§4.4.2): at one space, with
 * neither player yet having committed a card and no attack resolved.
 *
 * @param location - The space the engaged units stand on
 * @returns The melee resolution substep, open and unfought
 */
export function createOpenedMeleeResolutionState(
  location: Coordinate,
): MeleeResolutionState {
  const meleeState: MeleeResolutionState = {
    completed: false,
    firstPlayerAttackApplyState: 'pending',
    firstPlayerCommitment: { commitmentType: 'pending' },
    location,
    secondPlayerAttackApplyState: 'pending',
    secondPlayerCommitment: { commitmentType: 'pending' },
    substepType: 'meleeResolution',
  };
  return meleeState;
}

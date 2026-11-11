import type { Commitment } from '@game';
import {
  createFrontEngagementState,
  createRetreatState,
  createTestCard,
  createUnitWithPlacement,
} from '@testing';

import { getFrontEngagementStage } from './getFrontEngagementStage';

/** The defender has committed a card. */
const committed: Commitment = {
  card: createTestCard(),
  commitmentType: 'completed',
};

/** A retreat with one way back, open or finished. */
function retreat(completed: boolean) {
  const unit = createUnitWithPlacement({
    coordinate: 'E-5',
    facing: 'south',
    playerSide: 'white',
  });
  const state = createRetreatState(unit, [['step']], { completed });
  return state;
}

/**
 * A front engagement runs in order: the defender commits or refuses, whether
 * it has anywhere to fall back is worked out (§9.1.5), it decides whether to
 * fall back, and a retreat it accepts opens, is carried out and finishes
 * (§6.3).
 */
describe('getFrontEngagementStage function', () => {
  function stageOf(
    overrides: Parameters<typeof createFrontEngagementState>[0],
  ) {
    const front = createFrontEngagementState(overrides);
    const stage = getFrontEngagementStage(front.engagementResolutionState);
    return stage;
  }

  it('waits on the defender’s commitment first', () => {
    expect(stageOf({})).toBe('defenderCommitting');
  });

  it('then works out whether the defender can fall back', () => {
    expect(stageOf({ defensiveCommitment: committed })).toBe(
      'retreatBeingWorkedOut',
    );
  });

  it('leaves a defender with nowhere to go standing', () => {
    expect(
      stageOf({
        defendingUnitCanRetreat: false,
        defensiveCommitment: committed,
      }),
    ).toBe('noRetreat');
  });

  it('asks a defender that can fall back whether it will', () => {
    expect(
      stageOf({
        defendingUnitCanRetreat: true,
        defensiveCommitment: committed,
      }),
    ).toBe('defenderDeciding');
  });

  it('records a defender that chose to stand', () => {
    expect(
      stageOf({
        defendingUnitCanRetreat: true,
        defendingUnitRetreats: false,
        defensiveCommitment: committed,
      }),
    ).toBe('defenderStands');
  });

  it('opens, carries out and finishes the retreat a defender accepts', () => {
    const accepted = {
      defendingUnitCanRetreat: true,
      defendingUnitRetreats: true,
      defensiveCommitment: committed,
    };

    expect(stageOf(accepted)).toBe('retreatOpening');
    expect(stageOf({ ...accepted, retreatState: retreat(false) })).toBe(
      'retreating',
    );
    expect(stageOf({ ...accepted, retreatState: retreat(true) })).toBe(
      'retreated',
    );
  });
});

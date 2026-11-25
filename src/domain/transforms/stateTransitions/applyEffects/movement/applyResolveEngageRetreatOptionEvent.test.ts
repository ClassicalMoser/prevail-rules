import type { MoveDelta } from '@entities';
import type { ResolveEngageRetreatOptionEvent } from '@events';
import type { GameState } from '@game';
import {
  getEngagementStateFromMovement,
  getFrontEngagementStateFromMovement,
} from '@queries';
import {
  createBoardWithEngagedUnits,
  createFrontEngagementState,
  createGameStateResolvingCommand,
  createGameStateWithBoard,
  createMovementResolutionState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative } from '@transforms/pureTransforms';

import { applyResolveEngageRetreatOptionEvent } from './applyResolveEngageRetreatOptionEvent';

/**
 * Procedure output for front engagement: records the retreats the defender may make on the
 * front engagement resolution state under the movement CRS. With none, the defender stands
 * and the engagement ends (§6.3.2).
 */
describe('applyResolveEngageRetreatOptionEvent function', () => {
  /**
   * Black holds the initiative and carries out a Move: its unit has walked
   * head-on into White's on E-5 and stands engaged there, and White has
   * declined to commit a card. Whether White may fall back is what the
   * procedure has just worked out.
   */
  function retreatBeingWorkedOut(): GameState {
    const defender = createTestUnit('white');
    const attacker = createTestUnit('black', { attack: 2 });

    // The attacker entered the defender's space as the engagement started
    // (§6.3.2): the defender faces north, the attacker opposite it.
    const base = updateCurrentInitiative(
      createGameStateWithBoard(
        createBoardWithEngagedUnits(defender, attacker, 'E-5'),
      ),
      'black',
    );
    const front = createFrontEngagementState({
      defensiveCommitment: { commitmentType: 'declined' },
    });
    const movement = createMovementResolutionState(base, {
      engagementState: front,
      movingUnit: attacker,
      targetPlacement: { coordinate: 'E-5', facing: 'south' },
    });
    const resolving = createGameStateResolvingCommand(movement, base);
    return resolving;
  }

  /** The procedure's answer: the retreats the defender may make. */
  function retreatOption(
    retreatPaths: MoveDelta[][],
  ): ResolveEngageRetreatOptionEvent {
    const event: ResolveEngageRetreatOptionEvent = {
      effectType: 'resolveEngageRetreatOption',
      eventType: 'gameEffect',
      retreatPaths,
    };
    return event;
  }

  it('records the retreats the defender may make, and leaves the engagement open', () => {
    // The defender is the faster and has one way back: a step straight back.
    const next = applyResolveEngageRetreatOptionEvent(
      retreatOption([['step']]),
      retreatBeingWorkedOut(),
    );
    const front = getFrontEngagementStateFromMovement(next);

    // The retreat is recorded as the procedure worked it out.
    expect(front.engagementResolutionState.retreatPaths).toStrictEqual([
      ['step'],
    ]);
    // Whether to take it is the defender's owner's choice, still to come
    // (§6.3.2 step 3), so the engagement stays open.
    expect(front.engagementResolutionState.defendingUnitRetreats).toBe(
      'pending',
    );
    expect(front.completed).toBe(false);
  });

  it('with no retreat to make, the defender stands and the engagement is complete', () => {
    // The defender is not the faster, or has nowhere to go: no retreats.
    const next = applyResolveEngageRetreatOptionEvent(
      retreatOption([]),
      retreatBeingWorkedOut(),
    );

    // Nothing more is owed before the melee in Phase 4 (§6.3.2 step 4).
    expect(getEngagementStateFromMovement(next).completed).toBe(true);
    // It was never offered the choice, so it is recorded as standing, and
    // no retreat will open for it.
    expect(
      getFrontEngagementStateFromMovement(next).engagementResolutionState,
    ).toMatchObject({
      defendingUnitRetreats: false,
      retreatPaths: [],
      retreatState: 'bypassed',
    });
  });
});

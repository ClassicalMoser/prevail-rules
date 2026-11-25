import type { Board, MoveDelta } from '@entities';
import type { GameState, MovementResolutionState } from '@game';
import { getFrontEngagementRetreatState } from '@queries';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createFrontEngagementState,
  createGameStateResolvingCommand,
  createGameStateWithBoard,
  createMovementResolutionState,
  createTestUnit,
  placed,
} from '@testing';
import { updateCurrentInitiative } from '@transforms/pureTransforms';

import { applyOpenRetreatFromEngagementEvent } from './applyOpenRetreatFromEngagementEvent';

/**
 * Opens the retreat of a defender engaged from the front that chose to fall
 * back (§6.3.2), writing the retreats its procedure recorded on the event.
 * The transform does not judge them, so each case varies the event to show
 * one branch.
 *
 * White's defender stands on E-5 facing north, where it was engaged.
 * TODO(misleading): the event carries nothing; the retreats are the ones the
 * engagement recorded, so each case varies the engagement, not the event.
 * Settle by saying so.
 */
describe('applyOpenRetreatFromEngagementEvent function', () => {
  const event = {
    effectType: 'openRetreatFromEngagement' as const,
    eventType: 'gameEffect' as const,
  };

  /** White's unit, engaged from the front where it stood. */
  const defender = createTestUnit('white');

  /** Black's unit, which walked into it head-on, facing south. */
  const attacker = createTestUnit('black', { attack: 2 });

  /**
   * Black holds the initiative and carries out a Move: its unit has walked
   * head-on into White's on E-5, and White, offered these retreats, chose to
   * fall back. The board holds what the case says it does.
   */
  function defenderChoseToRetreat(
    retreatPaths: MoveDelta[][] | 'pending',
    options: {
      board?: Board;
      movement?: Partial<MovementResolutionState>;
    } = {},
  ): GameState {
    // By default the two stand engaged on E-5, the attacker having entered
    // the defender's space as the engagement started (§6.3.2): the defender
    // faces north, the attacker opposite it.
    const board =
      options.board ?? createBoardWithEngagedUnits(defender, attacker, 'E-5');
    const base = updateCurrentInitiative(
      createGameStateWithBoard(board),
      'black',
    );

    // White declined to commit a card. The defender could get away, and
    // chose to; its retreat is not open.
    const front = createFrontEngagementState({
      defendingUnitRetreats: true,
      defensiveCommitment: { commitmentType: 'declined' },
      retreatPaths,
    });
    const movement = createMovementResolutionState(base, {
      engagementState: front,
      movingUnit: attacker,
      targetPlacement: { coordinate: 'E-5', facing: 'south' },
      ...options.movement,
    });
    const resolving = createGameStateResolvingCommand(movement, base);
    return resolving;
  }

  it('a lone retreat is opened already chosen, for the defender standing there', () => {
    // On an empty board the defender's one retreat is a step straight back.
    const opened = applyOpenRetreatFromEngagementEvent(
      event,
      defenderChoseToRetreat([['step']]),
    );
    const retreat = getFrontEngagementRetreatState(opened);

    // The defender falls back, named as the board holds it.
    expect(retreat.retreatingUnit).toStrictEqual(defender);
    // One legal retreat is no choice (§9.1.3), and one that can be made
    // never turns into a rout (§9.1.6).
    expect(retreat.chosenRetreatPath).toStrictEqual(['step']);
    expect(retreat.routState).toBe('bypassed');
  });

  it('a tie is opened for the defender to choose', () => {
    // Two equally small retreats, as the engagement recorded them when an
    // enemy stands behind the defender.
    const opened = applyOpenRetreatFromEngagementEvent(
      event,
      defenderChoseToRetreat([
        ['turnLeft', 'step'],
        ['turnRight', 'step'],
      ]),
    );
    const retreat = getFrontEngagementRetreatState(opened);

    // Both are offered, and neither is chosen for the defender's owner.
    expect(retreat.legalRetreatPaths).toStrictEqual([
      ['turnLeft', 'step'],
      ['turnRight', 'step'],
    ]);
    expect(retreat.chosenRetreatPath).toBe('pending');
  });

  it('throws when the engagement recorded no retreat, since a defender with nowhere to go stands', () => {
    // A front-engaged defender may fall back only where there is somewhere to
    // fall back to (§9.1.5); with nowhere it stands and the units fight on, so
    // no retreat is ever opened for it.
    expect(() =>
      applyOpenRetreatFromEngagementEvent(event, defenderChoseToRetreat([])),
    ).toThrow('A defender with nowhere to retreat stands; no retreat opens');
  });

  it('throws when the retreat option has not been resolved yet', () => {
    // The paths are recorded when the engagement resolves the retreat option,
    // before the defender decides; opening earlier has nothing to open with.
    expect(() =>
      applyOpenRetreatFromEngagementEvent(
        event,
        defenderChoseToRetreat('pending'),
      ),
    ).toThrow('The retreat option has not been resolved yet');
  });

  it('throws when no defender stands in the engaged space', () => {
    // Black's unit stands alone on E-5: the board has lost the defender a
    // front engagement holds there until it falls back (§6.3.2).
    const state = defenderChoseToRetreat([['step']], {
      board: createBoardWithUnits([placed(attacker, 'E-5', 'south')]),
    });

    expect(() => applyOpenRetreatFromEngagementEvent(event, state)).toThrow(
      'No defender stands in the engaged space',
    );
  });

  it('throws when the move into the defender has not been written', () => {
    // An engagement opens only from a move written into the enemy, so an
    // engagement on an unwritten move is a fault in whatever wrote it.
    const state = defenderChoseToRetreat([['step']], {
      movement: { targetPlacement: 'pending' },
    });

    expect(() => applyOpenRetreatFromEngagementEvent(event, state)).toThrow(
      'The move has not been written yet',
    );
  });
});

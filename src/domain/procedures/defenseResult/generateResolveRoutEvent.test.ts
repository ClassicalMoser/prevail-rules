import {
  createEmptyGameState,
  createOpenedEngagementState,
  createOpenedRearEngagementResolutionState,
  createOpenedRoutState,
} from '@factories';
import {
  createAttackApplyStateWithRout,
  createCleanupPhaseStateWithRallyRout,
  createGameStateMovingInto,
  createGameStateResolvingCommand,
  createGameStateResolvingMelee,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createRoutState,
  createTestUnit,
  placed,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { generateResolveRoutEvent } from './generateResolveRoutEvent';

// TODO(misleading): the event carries the paying player and the penalty, not
// the affected units; and the order the two melee sides are asked in decides
// nothing, since only one rout is ever awaiting its penalty. Settle by
// rewording the header.
/**
 * `resolveRout` materializes rout discards: penalty and affected units come from whichever
 * rout substep is active—ranged attack-apply, melee (initiative player’s apply first),
 * rear engagement during movement, or cleanup rally after failed support.
 */
describe('generateResolveRoutEvent function', () => {
  it('charges the morale of a shot’s routed defender', () => {
    // White's unit, Morale 2, shot by the black archer two spaces ahead of it.
    const target = placed(
      createTestUnit('white', { morale: 2 }),
      'E-5',
      'north',
    );
    const shooter = placed(
      createTestUnit('black', { attack: 2 }),
      'C-5',
      'south',
    );

    // The target has routed and left the board; its rout is open, its cost
    // not yet counted.
    const board = createGameStateWithUnits([shooter]);
    const shot = createRangedAttackResolutionState(board, {
      attackApplyState: createAttackApplyStateWithRout(target.unit),
      attackingUnit: shooter.unit,
      defendingUnit: target.unit,
    });
    const state = createGameStateResolvingCommand(shot, board);

    // White discards one card for each point of the unit's Morale (§9.3.2).
    expect(generateResolveRoutEvent(state)).toStrictEqual({
      effectType: 'resolveRout',
      eventType: 'gameEffect',
      penalty: 2,
      player: 'white',
    });
  });

  it('in a melee, counts the rout still awaiting its penalty, not the one already counted', () => {
    // White holds the initiative, so black's unit routed first and black has
    // already been charged its Morale (§7.5.6, §9.3.3). Both units have left
    // the board.
    const whiteUnit = createTestUnit('white', { morale: 1 });
    const blackUnit = createTestUnit('black', { morale: 2 });
    const blackPaid = createRoutState('black', blackUnit, {
      cardsChosen: true,
      completed: true,
      numberToDiscard: 2,
    });
    const melee = createMeleeResolutionState(createEmptyGameState('standard'), {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRout(whiteUnit),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRout(
        blackUnit,
        { routState: blackPaid },
      ),
    });
    const state = createGameStateResolvingMelee(melee, 'white');

    // White's rout is the one still to count, and costs white's unit's Morale.
    expect(generateResolveRoutEvent(state)).toStrictEqual({
      effectType: 'resolveRout',
      eventType: 'gameEffect',
      penalty: 1,
      player: 'white',
    });
  });

  it('resolves the rout of a unit engaged from the rear', () => {
    // Black's move came at white's unit, Morale 2, from behind: it routed on
    // the spot and its owner pays at once (§6.3.3).
    const whiteUnit = createTestUnit('white', { morale: 2 });
    const rear = createOpenedEngagementState(
      createOpenedRearEngagementResolutionState(whiteUnit),
    );
    const state = createGameStateMovingInto(rear);

    expect(generateResolveRoutEvent(state)).toStrictEqual({
      effectType: 'resolveRout',
      eventType: 'gameEffect',
      penalty: 2,
      player: 'white',
    });
  });

  it('resolves the rout of the units a rally could not cover, their Morale summed', () => {
    // White rallied and two of its units, Morale 2 and Morale 1, found no
    // place at the support check; they rout together (§10.4.6).
    const base = createEmptyGameState('standard');
    const uncovered = createOpenedRoutState('white', [
      createTestUnit('white', { morale: 2 }),
      createTestUnit('white', { morale: 1 }),
    ]);
    const state = updatePhaseState(
      base,
      createCleanupPhaseStateWithRallyRout(base, uncovered),
    );

    // One discard for both, of their Morale added up (§9.3.3, §10.4.7).
    expect(generateResolveRoutEvent(state)).toStrictEqual({
      effectType: 'resolveRout',
      eventType: 'gameEffect',
      penalty: 3,
      player: 'white',
    });
  });

  it('throws when the command being resolved holds no rout', () => {
    // Where a rout can sit is the query's answer, so a command that holds none
    // leaves this procedure with no penalty to work out. Here a Move is under
    // way whose unit has walked into nobody.
    const empty = createEmptyGameState('standard');
    const state = createGameStateResolvingCommand(
      createMovementResolutionState(empty),
      empty,
    );

    // Nobody is routing, so there is no penalty to count.
    expect(() => generateResolveRoutEvent(state)).toThrow(
      'No rout is awaiting its penalty',
    );
  });
});

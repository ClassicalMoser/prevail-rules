import { createEmptyGameState } from '@factories';
import {
  getFrontEngagementRetreatState,
  getMeleeRetreatState,
  getRangedAttackRetreatState,
} from '@queries';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createFrontEngagementState,
  createGameStateMovingInto,
  createGameStateResolvingCommand,
  createGameStateResolvingMelee,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createRetreatState,
  createTestUnit,
  legalRetreatsOf,
  placed,
} from '@testing';

import { updatePhaseState } from '../state/updatePhaseState';
import { updateRetreatState } from './updateRetreatState';

/**
 * A unit falls back in three places: after a shot (§7.5), after a melee, on
 * whichever side was driven back (§7.2), and when a defender met head on
 * chooses to give ground (§6.3.2). The retreat is written where it was
 * opened; this writer carries it forward and never opens one.
 */
describe('updateRetreatState function', () => {
  // White's unit on E-5, facing north, and the ways back the rules give it.
  const whiteUnit = createTestUnit('white', { attack: 2 });
  const struck = placed(whiteUnit, 'E-5', 'north');
  const waysBack = legalRetreatsOf(struck);

  // The black unit fighting or shooting it.
  const blackUnit = createTestUnit('black', { attack: 2 });

  // White's retreat once the unit has fallen back. With one way back, the
  // path is chosen as the retreat opens.
  const fellBack = createRetreatState(whiteUnit, waysBack, {
    completed: true,
  });

  it('writes a retreat a shot forced onto the shot’s results', () => {
    // Black's skirmishers on C-5 drove white's unit back, and its retreat is
    // open.
    const shooter = placed(blackUnit, 'C-5', 'south');
    const board = createGameStateWithUnits([struck, shooter]);
    const shot = createRangedAttackResolutionState(board, {
      attackApplyState: createAttackApplyStateWithRetreat(
        whiteUnit,
        legalRetreatsOf(struck, [shooter]),
      ),
      attackingUnit: blackUnit,
      defendingUnit: whiteUnit,
    });
    const shooting = createGameStateResolvingCommand(shot, board);

    const after = updateRetreatState(shooting, fellBack);

    // The shot's results hold the finished retreat.
    expect(getRangedAttackRetreatState(after)).toBe(fellBack);
  });

  it('in a melee, writes the retreat on the side of the unit falling back', () => {
    // Black holds the initiative. Its blow drove white's unit back; white's
    // blow reached nothing.
    const fighting = createGameStateResolvingMelee(
      createMeleeResolutionState(createEmptyGameState('standard'), {
        attackOnFirstPlayerApplyState:
          createAttackApplyStateWithNothingDue(blackUnit),
        attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
          whiteUnit,
          waysBack,
        ),
      }),
      'black',
    );

    const after = updateRetreatState(fighting, fellBack);

    // White's side of the melee holds the finished retreat.
    expect(getMeleeRetreatState(after, 'white')).toBe(fellBack);
  });

  it('writes a front defender’s retreat onto the engagement, since no attack forced it', () => {
    // A move walked into white's unit head on; white, the faster, chose to
    // give ground and its retreat is open.
    const moving = createGameStateMovingInto(
      createFrontEngagementState({
        defendingUnitRetreats: true,
        retreatState: createRetreatState(whiteUnit, waysBack),
      }),
    );

    const after = updateRetreatState(moving, fellBack);

    // The engagement holds the finished retreat.
    expect(getFrontEngagementRetreatState(after)).toBe(fellBack);
  });

  it('throws when the shot did not drive its target back', () => {
    // The shot reached nothing, so no retreat was opened.
    const empty = createEmptyGameState('standard');
    const shooting = createGameStateResolvingCommand(
      createRangedAttackResolutionState(empty, {
        attackApplyState: createAttackApplyStateWithNothingDue(whiteUnit),
      }),
      empty,
    );

    expect(() => updateRetreatState(shooting, fellBack)).toThrow(
      'No retreat state found in attack apply state',
    );
  });

  it('throws in a melee when the unit falling back is on the other side', () => {
    // Black holds the initiative. White's blow drove black's unit back;
    // black's blow reached nothing, so white has no retreat.
    const fighting = createGameStateResolvingMelee(
      createMeleeResolutionState(createEmptyGameState('standard'), {
        attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
          blackUnit,
          legalRetreatsOf(placed(blackUnit, 'E-5', 'south')),
        ),
        attackOnSecondPlayerApplyState:
          createAttackApplyStateWithNothingDue(whiteUnit),
      }),
      'black',
    );

    expect(() => updateRetreatState(fighting, fellBack)).toThrow(
      'No retreat state found in attack apply state',
    );
  });

  it('throws when a front defender has not chosen to give ground', () => {
    // A move walked into white's unit head on; no retreat is open.
    const moving = createGameStateMovingInto(createFrontEngagementState());

    expect(() => updateRetreatState(moving, fellBack)).toThrow(
      'No retreat state found in front engagement',
    );
  });

  it('throws in Phase 3 between units, when nothing is retreating', () => {
    // No unit's move or shot is under way.
    const between = createGameStateResolvingCommand('pending');

    expect(() => updateRetreatState(between, fellBack)).toThrow(
      'No command resolution state found',
    );
  });

  it('throws in a phase where nothing falls back', () => {
    const playingCards = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );

    expect(() => updateRetreatState(playingCards, fellBack)).toThrow(
      'Retreat state update not expected in phase: playCards',
    );
  });
});

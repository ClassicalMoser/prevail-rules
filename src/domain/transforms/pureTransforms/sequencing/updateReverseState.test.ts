import { createEmptyGameState } from '@factories';
import { getMeleeReverseState, getRangedAttackReverseState } from '@queries';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithReverse,
  createGameStateMovingInto,
  createGameStateResolvingCommand,
  createGameStateResolvingMelee,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createReverseState,
  createTestUnit,
  placed,
} from '@testing';

import { updatePhaseState } from '../state/updatePhaseState';
import { updateReverseState } from './updateReverseState';

/**
 * Only an attack turns a unit about (§9.2): after a shot in Phase 3, or on
 * either side of a melee in Phase 4. The reverse is written on the results
 * of the attack that forced it; this writer carries it forward and never
 * opens one.
 */
describe('updateReverseState function', () => {
  const whiteUnit = createTestUnit('white', { attack: 2 });
  const blackUnit = createTestUnit('black', { attack: 2 });

  // White's reverse once the unit has turned about.
  const turned = createReverseState(whiteUnit, { completed: true });

  it('writes a reverse a shot forced onto the shot’s results', () => {
    // Black's skirmishers on C-5 shot white's unit on E-5 hard enough to turn it
    // about, and the reverse is open.
    const board = createGameStateWithUnits([
      placed(blackUnit, 'C-5', 'south'),
      placed(whiteUnit, 'E-5', 'north'),
    ]);
    const shot = createRangedAttackResolutionState(board, {
      attackApplyState: createAttackApplyStateWithReverse(whiteUnit),
      attackingUnit: blackUnit,
      defendingUnit: whiteUnit,
    });
    const shooting = createGameStateResolvingCommand(shot, board);

    const after = updateReverseState(shooting, turned);

    // The shot's results hold the finished reverse.
    expect(getRangedAttackReverseState(after)).toBe(turned);
  });

  it('in a melee, writes the reverse on the side of the unit turning about', () => {
    // Black holds the initiative. Its blow reversed white's unit; white's
    // blow reached nothing.
    const fighting = createGameStateResolvingMelee(
      createMeleeResolutionState(createEmptyGameState('standard'), {
        attackOnFirstPlayerApplyState:
          createAttackApplyStateWithNothingDue(blackUnit),
        attackOnSecondPlayerApplyState:
          createAttackApplyStateWithReverse(whiteUnit),
      }),
      'black',
    );

    const after = updateReverseState(fighting, turned);

    // White's side of the melee holds the finished reverse.
    expect(getMeleeReverseState(after, 'white')).toBe(turned);
  });

  it('throws when the shot did not turn its target about', () => {
    // The shot reached nothing, so no reverse was opened.
    const empty = createEmptyGameState('standard');
    const shooting = createGameStateResolvingCommand(
      createRangedAttackResolutionState(empty, {
        attackApplyState: createAttackApplyStateWithNothingDue(whiteUnit),
      }),
      empty,
    );

    expect(() => updateReverseState(shooting, turned)).toThrow(
      'No reverse state found in attack apply state',
    );
  });

  it('throws in a melee when the unit turning about is on the other side', () => {
    // Black holds the initiative. White's blow reversed black's unit;
    // black's blow reached nothing, so white has no reverse.
    const fighting = createGameStateResolvingMelee(
      createMeleeResolutionState(createEmptyGameState('standard'), {
        attackOnFirstPlayerApplyState:
          createAttackApplyStateWithReverse(blackUnit),
        attackOnSecondPlayerApplyState:
          createAttackApplyStateWithNothingDue(whiteUnit),
      }),
      'black',
    );

    expect(() => updateReverseState(fighting, turned)).toThrow(
      'No reverse state found in attack apply state',
    );
  });

  it('throws during a move, which reverses nobody', () => {
    // A unit is moving and has walked into nobody.
    const moving = createGameStateMovingInto('pending');

    expect(() => updateReverseState(moving, turned)).toThrow(
      'Reverse state update not expected in issueCommands (command type: movement)',
    );
  });

  it('throws in Phase 3 between units, when nothing is turning about', () => {
    // No unit's move or shot is under way.
    const between = createGameStateResolvingCommand('pending');

    expect(() => updateReverseState(between, turned)).toThrow(
      'No command resolution state found',
    );
  });

  it('throws in a phase where no attack is carried out', () => {
    const playingCards = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );

    expect(() => updateReverseState(playingCards, turned)).toThrow(
      'Reverse state update not expected in phase: playCards',
    );
  });
});

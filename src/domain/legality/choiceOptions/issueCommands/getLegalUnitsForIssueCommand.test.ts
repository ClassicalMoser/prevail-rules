import {
  createGameState,
  createGameStateWithEngagedUnits,
  createTestCommand,
  createTestUnit,
  createUnitWithPlacement,
} from '@testing';
import { addUnitsToCommandedUnits, deployCommander } from '@transforms';

import { getLegalUnitsForIssueCommand } from './getLegalUnitsForIssueCommand';

/**
 * The units an order may name under its full restrictions (§4.3.4): the
 * player's own units on the board, free of an engagement, not yet ordered
 * this round, matching its traits and types, and within inspiration range.
 */
describe('getLegalUnitsForIssueCommand function', () => {
  /** An order for one unit with no inspiration limit or filter. */
  const unrestrictedCommand = createTestCommand({
    number: 1,
    restrictions: { inspirationRangeRestriction: -1, restrictionType: 'none' },
  });

  it('includes friendly units on board when unrestricted', () => {
    // One black unit on E-5.
    const state = createGameState([['E-5', 'black']]);

    // An order with no limits reaches it wherever it stands.
    expect(
      getLegalUnitsForIssueCommand(unrestrictedCommand, 'black', state),
    ).toStrictEqual([
      createUnitWithPlacement({
        coordinate: 'E-5',
        facing: 'north',
        playerSide: 'black',
      }),
    ]);
  });

  it('offers only the issuing player’s units', () => {
    // A white unit on E-6 stands beside black's on E-5.
    const state = createGameState([
      ['E-5', 'black'],
      ['E-6', 'white'],
    ]);

    // An order reaches only its own side's units (§4.3.4).
    const units = getLegalUnitsForIssueCommand(
      unrestrictedCommand,
      'black',
      state,
    ).map((eligible) => eligible.placement.coordinate);
    expect(units).toStrictEqual(['E-5']);
  });

  it('excludes units outside inspiration range', () => {
    // Black units on E-5, with the commander, and far off on A-1.
    const rangedCommand = createTestCommand({
      number: 1,
      restrictions: { inspirationRangeRestriction: 1, restrictionType: 'none' },
    });
    const state = deployCommander(
      createGameState([
        ['E-5', 'black'],
        ['A-1', 'black'],
      ]),
      'black',
      'E-5',
    );

    // Only the unit within one space of the commander may be ordered.
    const units = getLegalUnitsForIssueCommand(
      rangedCommand,
      'black',
      state,
    ).map((eligible) => eligible.placement.coordinate);
    expect(units).toStrictEqual(['E-5']);
  });

  it('excludes units already commanded', () => {
    // Black's one unit has had its order this round.
    const placed = createGameState([['E-5', 'black']]);
    const state = addUnitsToCommandedUnits(placed, [
      createTestUnit('black', { instanceNumber: 1 }),
    ]);

    // One order per unit per round (§4.3.6).
    expect(
      getLegalUnitsForIssueCommand(unrestrictedCommand, 'black', state),
    ).toStrictEqual([]);
  });

  it('excludes a unit in an engaged space', () => {
    const ours = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const theirs = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    // Our unit and an enemy stand in E-5, locked in a fight (§2.2.1).
    const state = createGameStateWithEngagedUnits(ours, theirs, 'E-5', 'north');

    // An engaged unit cannot be ordered (§4.3.4), so nobody is offered.
    expect(
      getLegalUnitsForIssueCommand(unrestrictedCommand, 'black', state),
    ).toStrictEqual([]);
  });
});

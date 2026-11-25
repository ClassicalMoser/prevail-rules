import { createEmptyGameState, createSetupUnitsEvent } from '@factories';
import { createTestUnit, placed, withReservedUnits } from '@testing';

import { isValidSetupUnitsEvent } from './isValidSetupUnitsEvent';

/**
 * A side deploys its whole army at once: every unit it holds in reserve, each
 * once, one to a space, on the empty spaces of its own zone, and its
 * commander on one of those spaces too (§3.5.1, §3.5.3).
 *
 * These cases play a Mini game, on the small board. On a bare board a zone is
 * the three rows nearest the side's edge, less the two columns at each end
 * (§3.5.4): White's is rows A to C and Black's rows F to H, each from column
 * 3 to column 10.
 */
describe('isValidSetupUnitsEvent function', () => {
  // Two stand-in units for White and one for Black, all waiting in reserve.
  // Any unit type will do: deployment does not read a unit's stats.
  const whiteFirst = createTestUnit('white', { attack: 2, instanceNumber: 1 });
  const whiteSecond = createTestUnit('white', {
    attack: 2,
    instanceNumber: 2,
  });
  const blackUnit = createTestUnit('black', { attack: 2 });
  const beforeDeployment = withReservedUnits(createEmptyGameState('mini'), [
    whiteFirst,
    whiteSecond,
    blackUnit,
  ]);

  it('accepts the whole army placed in the zone, the commander sharing a space with a unit', () => {
    // White's two units on A-3 and A-4, its commander with the first.
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'A-3',
      player: 'white',
      unitPlacements: [
        placed(whiteFirst, 'A-3', 'south'),
        placed(whiteSecond, 'A-4', 'south'),
      ],
    });

    expect(isValidSetupUnitsEvent(event, beforeDeployment)).toStrictEqual({
      result: true,
    });
  });

  it('accepts the commander alone on an empty space of the zone', () => {
    // White's commander stands on B-5, where no unit is placed.
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'B-5',
      player: 'white',
      unitPlacements: [
        placed(whiteFirst, 'A-3', 'south'),
        placed(whiteSecond, 'A-4', 'south'),
      ],
    });

    expect(isValidSetupUnitsEvent(event, beforeDeployment)).toStrictEqual({
      result: true,
    });
  });

  it('refuses an army placed only in part', () => {
    // White places one of its two units; the other is left in reserve.
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'A-3',
      player: 'white',
      unitPlacements: [placed(whiteFirst, 'A-3', 'south')],
    });

    // The whole army is placed at once (§3.5.1).
    expect(isValidSetupUnitsEvent(event, beforeDeployment)).toStrictEqual({
      errorReason: 'Expected 2 unit placements, got 1',
      result: false,
    });
  });

  it("refuses a placement of the other side's unit", () => {
    // White names Black's unit in place of its own second unit.
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'A-3',
      player: 'white',
      unitPlacements: [
        placed(whiteFirst, 'A-3', 'south'),
        placed(blackUnit, 'A-4', 'south'),
      ],
    });

    // A side deploys only its own army.
    expect(isValidSetupUnitsEvent(event, beforeDeployment)).toStrictEqual({
      errorReason: 'Setup placement unit does not belong to the player',
      result: false,
    });
  });

  it('refuses a unit of its own side that is not waiting in reserve', () => {
    // A third White unit the army never brought.
    const notBrought = createTestUnit('white', {
      attack: 2,
      instanceNumber: 3,
    });
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'A-3',
      player: 'white',
      unitPlacements: [
        placed(whiteFirst, 'A-3', 'south'),
        placed(notBrought, 'A-4', 'south'),
      ],
    });

    // Only the units in reserve deploy.
    expect(isValidSetupUnitsEvent(event, beforeDeployment)).toStrictEqual({
      errorReason: "Unit is not in white's reserved units",
      result: false,
    });
  });

  it('refuses one unit placed twice', () => {
    // White's first unit on two spaces, standing in for the second.
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'A-3',
      player: 'white',
      unitPlacements: [
        placed(whiteFirst, 'A-3', 'south'),
        placed(whiteFirst, 'A-4', 'south'),
      ],
    });

    // A unit stands on one space.
    expect(isValidSetupUnitsEvent(event, beforeDeployment)).toStrictEqual({
      errorReason: 'Duplicate unit in setup placements',
      result: false,
    });
  });

  it('refuses a unit placed outside the zone', () => {
    // E-5 is in the middle of the board, outside White's rows.
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'A-3',
      player: 'white',
      unitPlacements: [
        placed(whiteFirst, 'A-3', 'south'),
        placed(whiteSecond, 'E-5', 'south'),
      ],
    });

    expect(isValidSetupUnitsEvent(event, beforeDeployment)).toStrictEqual({
      errorReason: 'Coordinate E-5 is not an empty setup-zone space for white',
      result: false,
    });
  });

  it('refuses two units placed on one space', () => {
    // Both White units on A-3.
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'A-3',
      player: 'white',
      unitPlacements: [
        placed(whiteFirst, 'A-3', 'south'),
        placed(whiteSecond, 'A-3', 'south'),
      ],
    });

    // One unit to a space (§2.2.1).
    expect(isValidSetupUnitsEvent(event, beforeDeployment)).toStrictEqual({
      errorReason: 'Duplicate coordinate in setup placements',
      result: false,
    });
  });

  it('refuses the commander placed outside the zone', () => {
    // The units are placed well; the commander stands on E-5.
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'E-5',
      player: 'white',
      unitPlacements: [
        placed(whiteFirst, 'A-3', 'south'),
        placed(whiteSecond, 'A-4', 'south'),
      ],
    });

    // The commander stands in its own zone (§3.5.3).
    expect(isValidSetupUnitsEvent(event, beforeDeployment)).toStrictEqual({
      errorReason:
        'Commander coordinate E-5 is not an empty setup-zone space for white',
      result: false,
    });
  });

  it('throws, naming the side, when that side has no units left to place', () => {
    // Only White's units wait in reserve; Black has none to deploy.
    const blackDeployed = withReservedUnits(createEmptyGameState('mini'), [
      whiteFirst,
      whiteSecond,
    ]);
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'G-5',
      player: 'black',
      unitPlacements: [],
    });

    // The sequencer asks only a side with units in reserve, so the
    // enumerator's throw is left for validatePlayerChoice to catch.
    expect(() => isValidSetupUnitsEvent(event, blackDeployed)).toThrow(
      'black has no units left to place',
    );
  });
});

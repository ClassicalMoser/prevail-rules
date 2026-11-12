import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { createGameState } from '@testing';
import { defaultBotTemperament } from '@bot/temperament';
import { surveyBattlefield } from './battlefieldSurvey';
import { appraisePlacement } from './appraisePlacement';

/**
 * Where a bot likes a unit to end its move.
 */
describe('appraisePlacement function', () => {
  it('prefers taking an enemy in the back to standing still', () => {
    // A black unit on E-5 facing north, and a white unit on D-5 also facing
    // north: stepping in from behind routs it on the spot (§6.3.3).
    const state = createGameState([
      ['E-5', 'black', 'north'],
      ['D-5', 'white', 'north'],
    ]);
    const mover = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    const survey = surveyBattlefield(state, 'black');
    const rearCharge = appraisePlacement(
      state,
      survey,
      mover,
      { coordinate: 'D-5', facing: 'north' },
      defaultBotTemperament,
    );
    const standing = appraisePlacement(
      state,
      survey,
      mover,
      mover.placement,
      defaultBotTemperament,
    );
    expect(rearCharge).toBeGreaterThan(standing);
  });

  it('prefers facing a nearby enemy to turning its back on it', () => {
    // A black unit on E-5 and a white unit two spaces south on G-5, close
    // enough to charge; with its back to it, the black unit could be routed.
    const state = createGameState([
      ['E-5', 'black', 'south'],
      ['G-5', 'white', 'north'],
    ]);
    const mover = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    const survey = surveyBattlefield(state, 'black');
    const facing = appraisePlacement(
      state,
      survey,
      mover,
      { coordinate: 'E-5', facing: 'south' },
      defaultBotTemperament,
    );
    const turnedAway = appraisePlacement(
      state,
      survey,
      mover,
      { coordinate: 'E-5', facing: 'north' },
      defaultBotTemperament,
    );
    expect(facing).toBeGreaterThan(turnedAway);
  });
});

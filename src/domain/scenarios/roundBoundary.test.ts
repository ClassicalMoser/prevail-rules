import type { AuthoritativeGameState } from '@game';
import { createInitialGameState, createSetupUnitsEvent } from '@factories';
import { getLegalSetupUnits } from '@legality';
import { blackMiniStarterArmy, whiteMiniStarterArmy } from '@sampleValues';
import { throwIfUndefined } from '@utils';
import { validatePlayerChoice } from '@validation';
import { generateEventFromProcedure } from '@procedures';
import { getExpectedEvent } from '@expected';
import { applyEvent } from '@transforms';

/**
 * Round 0 is setup (§3.5): White, holding the initiative, places its whole
 * army, then Black does, each legally, and then the round ends and round 1
 * begins. Played through the engines from a new game with the mini starter
 * armies, each unit placed on the first empty space of its own zone.
 */
describe('round 0', () => {
  /** The side expected to set up places its whole reserve, in zone order. */
  function setsUp(state: AuthoritativeGameState): AuthoritativeGameState {
    const expected = getExpectedEvent(state);
    if (
      expected.actionType !== 'playerChoice' ||
      expected.choiceType !== 'setupUnits'
    ) {
      throw new Error('a side should be asked to set up');
    }
    const player = expected.playerSource;
    if (player !== 'white' && player !== 'black') {
      throw new Error('setup is a side’s choice');
    }
    const legal = getLegalSetupUnits(state, player);
    if (legal === null) {
      throw new Error('the side should have units to place');
    }
    const facing = player === 'white' ? 'south' : 'north';
    const unitPlacements = legal.units.map((unit, index) => ({
      placement: {
        coordinate: throwIfUndefined(legal.coordinates[index], 'a space'),
        facing,
      } as const,
      unit,
    }));
    const event = createSetupUnitsEvent({
      commanderCoordinate: throwIfUndefined(legal.coordinates[0], 'a space'),
      player,
      unitPlacements,
    });
    // Each setup is legal: every reserved unit once, in its own zone.
    expect(validatePlayerChoice(event, state)).toStrictEqual({ result: true });
    return applyEvent(event, state);
  }

  it('sets up White, then Black, then ends the round into round 1', () => {
    const game = createInitialGameState({
      blackArmy: blackMiniStarterArmy,
      gameMode: 'mini',
      whiteArmy: whiteMiniStarterArmy,
    });

    // White holds the initiative, so White sets up first.
    expect(getExpectedEvent(game)).toMatchObject({
      choiceType: 'setupUnits',
      playerSource: 'white',
    });
    const whitePlaced = setsUp(game);
    // Then Black.
    expect(getExpectedEvent(whitePlaced)).toMatchObject({
      choiceType: 'setupUnits',
      playerSource: 'black',
    });
    const bothPlaced = setsUp(whitePlaced);
    // Setup is still round 0 until the round ends.
    expect(bothPlaced.currentRoundState.roundNumber).toBe(0);
    expect(bothPlaced.reservedUnits).toStrictEqual([]);

    // With both armies placed, the game owes the end of round 0.
    const expected = getExpectedEvent(bothPlaced);
    expect(expected).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'roundEnd',
    });
    if (expected.actionType !== 'gameEffect') {
      throw new Error('the end of the round is an effect the game owes');
    }
    const ending = generateEventFromProcedure(bothPlaced, expected.effectType, {
      nextFloat: () => 0,
    });
    const roundOne = applyEvent(ending, bothPlaced);

    // Round 1 begins with cards to choose.
    expect(roundOne.currentRoundState.roundNumber).toBe(1);
    expect(roundOne.currentRoundState.currentPhaseState).toStrictEqual({
      phase: 'playCards',
      step: 'chooseCards',
    });
  });
});

import type { StandardBoard } from '@entities';
import type { EngagementState } from '@game';
import {
  createFlankEngagementState,
  createFrontEngagementState,
  createGameStateWithEngagedUnits,
  createGameStateWithUnits,
  createRearEngagementState,
  createRoutState,
  createTestCard,
  createUnitWithPlacement,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getExpectedEngagementEvent } from './getExpectedEngagementEvent';

/**
 * getExpectedEngagementEvent: expected player-choice or effect event for the current engagement sub-step.
 */
describe('getExpectedEngagementEvent', () => {
  function createGameStateWithTargetUnit(playerSide: 'black' | 'white') {
    return createGameStateWithUnits([
      {
        unit: createUnitWithPlacement({ playerSide }).unit,
        coordinate: 'E-5',
        facing: 'north',
      },
    ]);
  }

  it('given when there is nothing to engage, throws', () => {
    const gameState = createGameStateWithUnits([]);
    const engagementState = createFrontEngagementState();

    expect(() =>
      getExpectedEngagementEvent(gameState, engagementState),
    ).toThrow('nothing to engage');
  });

  it('given when the defending unit is already engaged, throws', () => {
    const gameState = createGameStateWithEngagedUnits(
      createUnitWithPlacement({ playerSide: 'black' }).unit,
      createUnitWithPlacement({ playerSide: 'white' }).unit,
    );
    const engagementState = createFrontEngagementState();

    expect(() =>
      getExpectedEngagementEvent(gameState, engagementState),
    ).toThrow('defending unit is already engaged');
  });

  it('given when the defending unit is friendly, throws', () => {
    const gameState = createGameStateWithTargetUnit('white');
    const engagementState = createFrontEngagementState();

    expect(() =>
      getExpectedEngagementEvent(gameState, engagementState),
    ).toThrow('defending unit is friendly');
  });

  it('given resolve flank engagement when the defender has not rotated yet', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = createFlankEngagementState({
      defenderRotated: false,
    });

    expect(getExpectedEngagementEvent(gameState, engagementState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveFlankEngagement',
    });
  });

  it('given when the engagement is already complete, throws', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = {
      ...createFrontEngagementState(),
      completed: true,
    };

    expect(() =>
      getExpectedEngagementEvent(gameState, engagementState),
    ).toThrow('Engagement state is already complete');
  });

  it('given when flank engagement is resolved but not marked complete, throws', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = createFlankEngagementState({
      defenderRotated: true,
    });

    expect(() =>
      getExpectedEngagementEvent(gameState, engagementState),
    ).toThrow(
      'Flank engagement resolution complete but not marked as completed',
    );
  });

  it('given resolve rout for rear engagement when rout is not complete', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = createRearEngagementState();

    expect(getExpectedEngagementEvent(gameState, engagementState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    });
  });

  it('given when rear engagement is already complete, throws', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = createRearEngagementState({
      routState: createRoutState('black', createUnitWithPlacement().unit, {
        completed: true,
        numberToDiscard: 1,
        cardsChosen: true,
      }),
      completed: true,
    });

    expect(() =>
      getExpectedEngagementEvent(gameState, engagementState),
    ).toThrow('Rear engagement resolution state is already complete');
  });

  it('given when rear rout is complete but the engagement is not, throws', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = createRearEngagementState({
      routState: createRoutState('black', createUnitWithPlacement().unit, {
        completed: true,
        numberToDiscard: 1,
        cardsChosen: true,
      }),
    });

    expect(() =>
      getExpectedEngagementEvent(gameState, engagementState),
    ).toThrow('Rear engagement resolution complete but not advanced');
  });

  it('given a front engagement is pending, asks the defender to commit to movement', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = createFrontEngagementState();

    expect(getExpectedEngagementEvent(gameState, engagementState)).toEqual({
      actionType: 'playerChoice',
      playerSource: 'white',
      choiceType: 'commitToMovement',
    });
  });

  it('given resolve the retreat option when the defender can retreat but has not chosen yet', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = createFrontEngagementState({
      defensiveCommitment: {
        commitmentType: 'completed',
        card: createTestCard(),
      },
      defendingUnitCanRetreat: undefined,
      defendingUnitRetreats: undefined,
      defendingUnitRetreated: undefined,
    });

    expect(getExpectedEngagementEvent(gameState, engagementState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveEngageRetreatOption',
    });
  });

  it('given retreat is still undecided, asks the defender whether to retreat', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = createFrontEngagementState({
      defensiveCommitment: {
        commitmentType: 'completed',
        card: createTestCard(),
      },
      defendingUnitCanRetreat: true,
      defendingUnitRetreats: undefined,
      defendingUnitRetreated: undefined,
    });

    expect(getExpectedEngagementEvent(gameState, engagementState)).toEqual({
      actionType: 'playerChoice',
      playerSource: 'white',
      choiceType: 'chooseWhetherToRetreat',
    });
  });

  it('given ask the defender to choose a retreat option after choosing to retreat', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = createFrontEngagementState({
      defensiveCommitment: {
        commitmentType: 'completed',
        card: createTestCard(),
      },
      defendingUnitCanRetreat: true,
      defendingUnitRetreats: true,
      defendingUnitRetreated: undefined,
    });

    expect(getExpectedEngagementEvent(gameState, engagementState)).toEqual({
      actionType: 'playerChoice',
      playerSource: 'white',
      choiceType: 'chooseRetreatOption',
    });
  });

  it('given when the defender cannot retreat, throws', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = createFrontEngagementState({
      defensiveCommitment: {
        commitmentType: 'completed',
        card: createTestCard(),
      },
      defendingUnitCanRetreat: false,
      defendingUnitRetreats: undefined,
      defendingUnitRetreated: undefined,
    });

    expect(() =>
      getExpectedEngagementEvent(gameState, engagementState),
    ).toThrow('Defending unit cannot retreat');
  });

  it('given when retreat is denied but the state is not marked complete, throws', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = createFrontEngagementState({
      defensiveCommitment: {
        commitmentType: 'completed',
        card: createTestCard(),
      },
      defendingUnitCanRetreat: true,
      defendingUnitRetreats: false,
      defendingUnitRetreated: undefined,
    });

    expect(() =>
      getExpectedEngagementEvent(gameState, engagementState),
    ).toThrow(
      'Front engagement resolution complete but not marked as completed',
    );
  });

  it('given when retreat is chosen but the state is not marked complete, throws', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = createFrontEngagementState({
      defensiveCommitment: {
        commitmentType: 'completed',
        card: createTestCard(),
      },
      defendingUnitCanRetreat: true,
      defendingUnitRetreats: true,
      defendingUnitRetreated: true,
    });

    expect(() =>
      getExpectedEngagementEvent(gameState, engagementState),
    ).toThrow(
      'Front engagement resolution complete but not marked as completed',
    );
  });

  it('given for an invalid engagement type, throws', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = {
      ...createFrontEngagementState(),
      engagementResolutionState: {
        ...createFrontEngagementState().engagementResolutionState,
        engagementType: 'invalid',
      } as never,
    } as EngagementState<StandardBoard>;

    expect(() =>
      getExpectedEngagementEvent(gameState, engagementState),
    ).toThrow('Invalid engagement type');
  });
});

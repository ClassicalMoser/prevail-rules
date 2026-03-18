import type { EngagementState, StandardBoard } from '@entities';
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

  it('should throw when there is nothing to engage', () => {
    const gameState = createGameStateWithUnits([]);
    const engagementState = createFrontEngagementState();

    expect(() =>
      getExpectedEngagementEvent(gameState, engagementState),
    ).toThrow('nothing to engage');
  });

  it('should throw when the defending unit is already engaged', () => {
    const gameState = createGameStateWithEngagedUnits(
      createUnitWithPlacement({ playerSide: 'black' }).unit,
      createUnitWithPlacement({ playerSide: 'white' }).unit,
    );
    const engagementState = createFrontEngagementState();

    expect(() =>
      getExpectedEngagementEvent(gameState, engagementState),
    ).toThrow('defending unit is already engaged');
  });

  it('should throw when the defending unit is friendly', () => {
    const gameState = createGameStateWithTargetUnit('white');
    const engagementState = createFrontEngagementState();

    expect(() =>
      getExpectedEngagementEvent(gameState, engagementState),
    ).toThrow('defending unit is friendly');
  });

  it('should resolve flank engagement when the defender has not rotated yet', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = createFlankEngagementState({
      defenderRotated: false,
    });

    expect(getExpectedEngagementEvent(gameState, engagementState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveFlankEngagement',
    });
  });

  it('should throw when the engagement is already complete', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = {
      ...createFrontEngagementState(),
      completed: true,
    };

    expect(() =>
      getExpectedEngagementEvent(gameState, engagementState),
    ).toThrow('Engagement state is already complete');
  });

  it('should throw when flank engagement is resolved but not marked complete', () => {
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

  it('should resolve rout for rear engagement when rout is not complete', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = createRearEngagementState();

    expect(getExpectedEngagementEvent(gameState, engagementState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    });
  });

  it('should throw when rear engagement is already complete', () => {
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

  it('should throw when rear rout is complete but the engagement is not', () => {
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

  it('should ask the defender to commit to movement when a front engagement is pending', () => {
    const gameState = createGameStateWithTargetUnit('black');
    const engagementState = createFrontEngagementState();

    expect(getExpectedEngagementEvent(gameState, engagementState)).toEqual({
      actionType: 'playerChoice',
      playerSource: 'white',
      choiceType: 'commitToMovement',
    });
  });

  it('should resolve the retreat option when the defender can retreat but has not chosen yet', () => {
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

  it('should ask the defender whether to retreat when retreat is still undecided', () => {
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

  it('should ask the defender to choose a retreat option after choosing to retreat', () => {
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

  it('should throw when the defender cannot retreat', () => {
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

  it('should throw when retreat is denied but the state is not marked complete', () => {
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

  it('should throw when retreat is chosen but the state is not marked complete', () => {
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

  it('should throw for an invalid engagement type', () => {
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

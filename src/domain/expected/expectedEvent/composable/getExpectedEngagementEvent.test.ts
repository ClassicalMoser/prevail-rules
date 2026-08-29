import {
  createFlankEngagementState,
  createFrontEngagementState,
  createRearEngagementState,
  createRetreatState,
  createRoutState,
  createTestCard,
  createUnitWithPlacement,
} from '@testing';

import { getExpectedEngagementEvent } from './getExpectedEngagementEvent';

/**
 * GetExpectedEngagementEvent: expected player-choice or effect for the current engagement resolution sub-step.
 *
 * Does not validate board context (empty square, already engaged, friendly unit): that belongs to callers
 * that build `EngagementState` from live game state.
 */
describe(getExpectedEngagementEvent, () => {
  it('given resolve flank engagement when the defender has not rotated yet', () => {
    const engagementState = createFlankEngagementState({
      defenderRotated: false,
    });

    expect(getExpectedEngagementEvent(engagementState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveFlankEngagement',
    });
  });

  it('given when the engagement is already complete, throws', () => {
    const engagementState = {
      ...createFrontEngagementState(),
      completed: true,
    };

    expect(() => getExpectedEngagementEvent(engagementState)).toThrow(
      'Engagement state is already complete',
    );
  });

  it('given when flank engagement is resolved but not marked complete, throws', () => {
    const engagementState = createFlankEngagementState({
      defenderRotated: true,
    });

    expect(() => getExpectedEngagementEvent(engagementState)).toThrow(
      'Flank engagement resolution complete but not marked as completed',
    );
  });

  it('given resolve rout for rear engagement when rout is not complete', () => {
    const engagementState = createRearEngagementState();

    expect(getExpectedEngagementEvent(engagementState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    });
  });

  it('given when rear engagement is already complete, throws', () => {
    const engagementState = createRearEngagementState({
      completed: true,
      routState: createRoutState('black', createUnitWithPlacement().unit, {
        cardsChosen: true,
        completed: true,
        numberToDiscard: 1,
      }),
    });

    expect(() => getExpectedEngagementEvent(engagementState)).toThrow(
      'Rear engagement resolution state is already complete',
    );
  });

  it('given when rear rout is complete but the engagement is not, throws', () => {
    const engagementState = createRearEngagementState({
      routState: createRoutState('black', createUnitWithPlacement().unit, {
        cardsChosen: true,
        completed: true,
        numberToDiscard: 1,
      }),
    });

    expect(() => getExpectedEngagementEvent(engagementState)).toThrow(
      'Rear engagement resolution complete but not advanced',
    );
  });

  it('given a front engagement is pending, asks the defender to commit to movement', () => {
    const engagementState = createFrontEngagementState();

    expect(getExpectedEngagementEvent(engagementState)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'commitToMovement',
      playerSource: 'white',
    });
  });

  it('given resolve the retreat option when the defender can retreat but has not chosen yet', () => {
    const engagementState = createFrontEngagementState({
      defendingUnitCanRetreat: 'pending' as const,
      defendingUnitRetreated: 'pending' as const,
      defendingUnitRetreats: 'pending' as const,
      defensiveCommitment: {
        card: createTestCard(),
        commitmentType: 'completed',
      },
    });

    expect(getExpectedEngagementEvent(engagementState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveEngageRetreatOption',
    });
  });

  it('given retreat is still undecided, asks the defender whether to retreat', () => {
    const engagementState = createFrontEngagementState({
      defendingUnitCanRetreat: true,
      defendingUnitRetreated: 'pending' as const,
      defendingUnitRetreats: 'pending' as const,
      defensiveCommitment: {
        card: createTestCard(),
        commitmentType: 'completed',
      },
    });

    expect(getExpectedEngagementEvent(engagementState)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseWhetherToRetreat',
      playerSource: 'white',
    });
  });

  it('asks the defender to choose a retreat option after accepting retreat with multiple destinations', () => {
    const retreatingUnit = createUnitWithPlacement({ playerSide: 'white' });
    const engagementState = createFrontEngagementState({
      defendingUnitCanRetreat: true,
      defendingUnitRetreated: 'pending' as const,
      defendingUnitRetreats: true,
      defensiveCommitment: {
        card: createTestCard(),
        commitmentType: 'completed',
      },
      retreatState: createRetreatState(retreatingUnit, {
        finalPosition: 'pending',
        legalRetreatOptions: [
          { coordinate: 'E-4', facing: 'north' },
          { coordinate: 'E-6', facing: 'north' },
        ],
      }),
    });

    expect(getExpectedEngagementEvent(engagementState)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseRetreatOption',
      playerSource: 'white',
    });
  });

  it('expects resolveRetreat when the accepted retreat already has a finalPosition', () => {
    const retreatingUnit = createUnitWithPlacement({ playerSide: 'white' });
    const engagementState = createFrontEngagementState({
      defendingUnitCanRetreat: true,
      defendingUnitRetreated: 'pending' as const,
      defendingUnitRetreats: true,
      defensiveCommitment: {
        card: createTestCard(),
        commitmentType: 'completed',
      },
      retreatState: createRetreatState(retreatingUnit, {
        finalPosition: { coordinate: 'E-4', facing: 'north' },
        legalRetreatOptions: [{ coordinate: 'E-4', facing: 'north' }],
      }),
    });

    expect(getExpectedEngagementEvent(engagementState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRetreat',
    });
  });

  it('given when the defender cannot retreat, throws', () => {
    const engagementState = createFrontEngagementState({
      defendingUnitCanRetreat: false,
      defendingUnitRetreated: 'pending' as const,
      defendingUnitRetreats: 'pending' as const,
      defensiveCommitment: {
        card: createTestCard(),
        commitmentType: 'completed',
      },
    });

    expect(() => getExpectedEngagementEvent(engagementState)).toThrow(
      'Defending unit cannot retreat',
    );
  });

  it('given when retreat is denied but the state is not marked complete, throws', () => {
    const engagementState = createFrontEngagementState({
      defendingUnitCanRetreat: true,
      defendingUnitRetreated: 'pending' as const,
      defendingUnitRetreats: false,
      defensiveCommitment: {
        card: createTestCard(),
        commitmentType: 'completed',
      },
    });

    expect(() => getExpectedEngagementEvent(engagementState)).toThrow(
      'Front engagement resolution complete but not marked as completed',
    );
  });

  it('throws when nested retreat is completed but engagement is not marked complete', () => {
    const retreatingUnit = createUnitWithPlacement({ playerSide: 'white' });
    const engagementState = createFrontEngagementState({
      defendingUnitCanRetreat: true,
      defendingUnitRetreated: true,
      defendingUnitRetreats: true,
      defensiveCommitment: {
        card: createTestCard(),
        commitmentType: 'completed',
      },
      retreatState: createRetreatState(retreatingUnit, {
        completed: true,
        finalPosition: { coordinate: 'E-4', facing: 'north' },
        legalRetreatOptions: [{ coordinate: 'E-4', facing: 'north' }],
      }),
    });

    expect(() => getExpectedEngagementEvent(engagementState)).toThrow(
      'Front engagement retreat completed but engagement not marked as completed',
    );
  });

  it('given for an invalid engagement type, throws', () => {
    const engagementState = {
      ...createFrontEngagementState(),
      engagementResolutionState: {
        ...createFrontEngagementState().engagementResolutionState,
        engagementType: 'invalid',
      } as never,
    };

    expect(() => getExpectedEngagementEvent(engagementState)).toThrow(
      'Invalid engagement type',
    );
  });
});

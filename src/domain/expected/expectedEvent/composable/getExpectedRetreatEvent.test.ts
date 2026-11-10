import {
  createRetreatState,
  createRoutState,
  createUnitWithPlacement,
  legalRetreatsOf,
} from '@testing';

import { getExpectedRetreatEvent } from './getExpectedRetreatEvent';

/**
 * GetExpectedRetreatEvent: next retreat-resolution event from retreat substate.
 */
describe('getExpectedRetreatEvent function', () => {
  // The retreating unit: black, on E-5 facing north.
  const unitPlacement = createUnitWithPlacement();
  // Open ground behind: the unit can fall straight back one space.
  const openGround = legalRetreatsOf(unitPlacement);
  // A white unit on F-5 facing the retreating unit closes its way back, so it
  // has nowhere to go (§9.1.5).
  const cutOff = legalRetreatsOf(unitPlacement, [
    createUnitWithPlacement({
      coordinate: 'F-5',
      facing: 'north',
      playerSide: 'white',
    }),
  ]);
  // A white unit on F-5 looking away blocks the space but not the way round:
  // the unit has two tied ways back, one angled each side (§9.1.3).
  const tied = legalRetreatsOf(unitPlacement, [
    createUnitWithPlacement({
      coordinate: 'F-5',
      facing: 'south',
      playerSide: 'white',
    }),
  ]);

  it('given trigger rout when there are no legal retreat options and no rout state', () => {
    // Cut off from every retreat, and the rout slot not yet opened.
    const retreatState = createRetreatState(unitPlacement, cutOff);

    expect(getExpectedRetreatEvent(retreatState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'triggerRoutFromRetreat',
    });
  });

  it('given delegate to rout when retreat has no options and rout is not complete', () => {
    // Cut off from every retreat, and the unit's rout is open but unfinished.
    const retreatState = createRetreatState(unitPlacement, cutOff, {
      routState: createRoutState('black', unitPlacement.unit, {
        cardsChosen: false,
      }),
    });

    expect(getExpectedRetreatEvent(retreatState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    });
  });

  it('given multiple options exist, asks the player to choose a retreat option', () => {
    // Two tied ways back, so the player has a real choice to make.
    const retreatState = createRetreatState(unitPlacement, tied);

    expect(getExpectedRetreatEvent(retreatState)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseRetreatOption',
      playerSource: 'black',
    });
  });

  it('given the retreat is already chosen, returns resolveRetreat', () => {
    // The one way back is already picked; the unit only has to move.
    const retreatState = createRetreatState(unitPlacement, openGround, {
      chosenRetreatPath: ['step'],
    });

    expect(getExpectedRetreatEvent(retreatState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRetreat',
    });
  });

  it('given when the retreat is already complete, throws', () => {
    // The retreat has been fully played out, so nothing more is expected of it.
    const retreatState = createRetreatState(unitPlacement, openGround, {
      completed: true,
      chosenRetreatPath: ['step'],
    });

    expect(() => getExpectedRetreatEvent(retreatState)).toThrow(
      'Retreat state is already complete',
    );
  });

  it('given when rout is complete but retreat is not marked complete, throws', () => {
    // The rout of the cut-off unit has finished, yet the retreat still reads open.
    const retreatState = createRetreatState(unitPlacement, cutOff, {
      routState: createRoutState('black', unitPlacement.unit, {
        cardsChosen: true,
        completed: true,
        numberToDiscard: 1,
      }),
    });

    expect(() => getExpectedRetreatEvent(retreatState)).toThrow(
      'Retreat state has completed rout but not marked as completed',
    );
  });

  it('a single retreat option left unchosen when the retreat opens throws', () => {
    // Open ground leaves one way back, which the game picks when the retreat opens.
    const retreatState = createRetreatState(unitPlacement, openGround, {
      chosenRetreatPath: 'pending' as const,
    });

    expect(() => getExpectedRetreatEvent(retreatState)).toThrow(
      'A retreat with a single option should have it chosen when it opens',
    );
  });
});

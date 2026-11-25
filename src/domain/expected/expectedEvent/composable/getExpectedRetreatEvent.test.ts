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

  describe('a unit with nowhere to go routs instead (§9.1.6)', () => {
    it('opens the rout that takes the place of the retreat', () => {
      // Cut off from every retreat, and the rout slot not yet opened.
      const retreatState = createRetreatState(unitPlacement.unit, cutOff);

      // The engine opens the rout, and the unit leaves the board.
      expect(getExpectedRetreatEvent(retreatState)).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'triggerRoutFromRetreat',
      });
    });

    it('then waits on that rout to be paid for', () => {
      // Cut off from every retreat, and the unit's rout is open but unfinished.
      const retreatState = createRetreatState(unitPlacement.unit, cutOff, {
        routState: createRoutState('black', unitPlacement.unit),
      });

      // The open rout's own next step: its Morale counted first.
      expect(getExpectedRetreatEvent(retreatState)).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'resolveRout',
      });
    });

    it('refuses a rout marked bypassed, since a unit cut off must rout', () => {
      // Cut off, yet the rout reads as one the unit was spared: a forged state.
      const retreatState = createRetreatState(unitPlacement.unit, cutOff, {
        routState: 'bypassed',
      });

      expect(() => getExpectedRetreatEvent(retreatState)).toThrow(
        'Retreat with no legal options cannot have a bypassed rout',
      );
    });

    it('throws once the rout is paid but the retreat still reads open, since paying closes it', () => {
      // The rout of the cut-off unit has finished, yet the retreat still reads open.
      const retreatState = createRetreatState(unitPlacement.unit, cutOff, {
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
  });

  describe('a unit with somewhere to go falls back', () => {
    it('asks its owner to choose among tied ways back', () => {
      // Two tied ways back, so the player has a real choice to make.
      const retreatState = createRetreatState(unitPlacement.unit, tied);

      // The retreating unit is black's, so black chooses (§9.1.3).
      expect(getExpectedRetreatEvent(retreatState)).toStrictEqual({
        actionType: 'playerChoice',
        choiceType: 'chooseRetreatOption',
        playerSource: 'black',
      });
    });

    it('moves the unit once its way back is chosen', () => {
      // The one way back is already picked; the unit only has to move.
      // A single way back is taken as the retreat opens.
      const retreatState = createRetreatState(unitPlacement.unit, openGround);

      // Carrying out the move is the engine's work.
      expect(getExpectedRetreatEvent(retreatState)).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'resolveRetreat',
      });
    });

    it('throws on a single way back left unchosen, since the retreat takes it as it opens', () => {
      // Open ground leaves one way back, which the game picks when the retreat opens.
      const retreatState = createRetreatState(unitPlacement.unit, openGround, {
        chosenRetreatPath: 'pending',
      });

      // One way back is not a choice, so asking the player would be wrong.
      expect(() => getExpectedRetreatEvent(retreatState)).toThrow(
        'A retreat with a single option should have it chosen when it opens',
      );
    });
  });

  it('a finished retreat has nothing left to ask for, so asking throws', () => {
    // The retreat has been fully played out, so nothing more is expected of it.
    const retreatState = createRetreatState(unitPlacement.unit, openGround, {
      completed: true,
    });

    expect(() => getExpectedRetreatEvent(retreatState)).toThrow(
      'Retreat state is already complete',
    );
  });
});

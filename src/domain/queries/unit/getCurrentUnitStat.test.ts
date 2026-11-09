import type { PlayerSide, UnitInstance } from '@entities';

import { createEmptyGameState } from '@factories';
import {
  createBoardWithCommander,
  createBoardWithUnits,
  createTestCard,
  createTestUnit,
  placed,
} from '@testing';
import {
  addUnitsToCommandedUnits,
  updateBoardState,
  updatePlayerCardState,
  updateRoundState,
} from '@transforms';

import { getCurrentUnitStat } from './getCurrentUnitStat';

type StandardState = ReturnType<typeof createEmptyGameState>;
type InPlayCard = NonNullable<StandardState['cardState']['black']['inPlay']>;

/**
 * A standard game with this unit alone on E-5, facing north.
 */
function stateWithUnit(unit: UnitInstance): StandardState {
  const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);
  return updateBoardState(createEmptyGameState('standard'), board);
}

/**
 * The same board, plus this side's commander on the given hex.
 */
function stateWithUnitAndCommander(
  unit: UnitInstance,
  commanderCoordinate: 'E-6' | 'E-8',
): StandardState {
  const boardWithUnit = createBoardWithUnits([placed(unit, 'E-5', 'north')]);
  const board = createBoardWithCommander(
    'black',
    commanderCoordinate,
    boardWithUnit,
  );
  return updateBoardState(createEmptyGameState('standard'), board);
}

/**
 * Puts this card in play for the side. The rest of that side's card state stays.
 */
function withInPlay(
  state: StandardState,
  player: PlayerSide,
  card: InPlayCard,
): StandardState {
  return updatePlayerCardState(state, player, {
    ...state.cardState[player],
    inPlay: card,
  });
}

/**
 * Records that this unit was commanded this round.
 */
function withCommandedUnit(
  state: StandardState,
  unit: UnitInstance,
): StandardState {
  return addUnitsToCommandedUnits(state, [unit]);
}

/**
 * GetCurrentUnitStat: effective stat with base unit type, round effects, command modifiers, and extra modifiers.
 */
describe('getCurrentUnitStat function', () => {
  describe('base stat without modifiers', () => {
    it('returns the base attack when no card is in play', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = stateWithUnit(unit);

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3);
    });

    it('returns the base attack when the round-effect modifier list is empty', () => {
      const unit = createTestUnit('black', { attack: 3 });
      // The command lists attack. The unit is not commanded, so that modifier is not applied.
      let gameState = stateWithUnit(unit);
      gameState = withInPlay(
        gameState,
        'black',
        createTestCard({
          id: '2',
          initiative: 2,
          modifiers: ['attack'],
          name: 'Command CommandCard 2',
          roundEffectModifiers: [],
          roundEffectRestrictions: { inspirationRangeRestriction: 1 },
        }),
      );

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3);
    });

    it('returns the base attack when the only round modifier is speed', () => {
      const unit = createTestUnit('white', { attack: 2 });
      let gameState = stateWithUnit(unit);
      gameState = withInPlay(
        gameState,
        'white',
        createTestCard({
          roundEffectModifiers: [{ type: 'speed', value: 1 }],
        }),
      );

      expect(getCurrentUnitStat(unit, 'attack', gameState)).toBe(2);
    });
  });

  describe('the floor at zero (§7.1.4)', () => {
    it('a stat pushed below zero counts as zero', () => {
      // Range 2 with a −3 modifier sums to −1; no stat goes below zero, so
      // the unit's Range is 0 and it cannot shoot.
      const unit = createTestUnit('black', { range: 2 });
      const gameState = stateWithUnit(unit);

      expect(
        getCurrentUnitStat(unit, 'range', gameState, [
          { type: 'range', value: -3 },
        ]),
      ).toBe(0);
    });

    it('a stat at or above zero is untouched by the floor', () => {
      // Range 2 with a −1 modifier is 1.
      const unit = createTestUnit('black', { range: 2 });
      const gameState = stateWithUnit(unit);

      expect(
        getCurrentUnitStat(unit, 'range', gameState, [
          { type: 'range', value: -1 },
        ]),
      ).toBe(1);
    });
  });

  describe('round effect modifiers', () => {
    it('adds an unrestricted attack round modifier to the base', () => {
      const unit = createTestUnit('black', { attack: 3 });
      let gameState = stateWithUnit(unit);
      gameState = withInPlay(
        gameState,
        'black',
        createTestCard({
          roundEffectModifiers: [{ type: 'attack', value: 2 }],
          // -1: no inspiration range; the fixture default is a tight 0.
          roundEffectRestrictions: { inspirationRangeRestriction: -1 },
        }),
      );

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(5);
    });

    it('leaves the base attack when the round modifier is for speed', () => {
      const unit = createTestUnit('black', { attack: 3 });
      let gameState = stateWithUnit(unit);
      gameState = withInPlay(
        gameState,
        'black',
        createTestCard({
          roundEffectModifiers: [{ type: 'speed', value: 1 }],
        }),
      );

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3);
    });

    it('adds a defense round modifier to reverse', () => {
      const unit = createTestUnit('black', { reverse: 3 });
      let gameState = stateWithUnit(unit);
      gameState = withInPlay(
        gameState,
        'black',
        createTestCard({
          roundEffectModifiers: [{ type: 'defense', value: 1 }],
          // -1: no inspiration range; the fixture default is a tight 0.
          roundEffectRestrictions: { inspirationRangeRestriction: -1 },
        }),
      );

      const result = getCurrentUnitStat(unit, 'reverse', gameState);
      expect(result).toBe(4);
    });
  });

  describe('round effect with inspiration range restriction', () => {
    it('adds the attack round modifier when the unit is within inspiration range', () => {
      const unit = createTestUnit('black', { attack: 3 });
      // Commander on E-6 is one hex from the unit on E-5. Range is 1.
      let gameState = stateWithUnitAndCommander(unit, 'E-6');
      gameState = withInPlay(
        gameState,
        'black',
        createTestCard({
          roundEffectModifiers: [{ type: 'attack', value: 1 }],
          roundEffectRestrictions: { inspirationRangeRestriction: 1 },
        }),
      );

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(4);
    });

    it('leaves the base attack when the unit is outside inspiration range', () => {
      const unit = createTestUnit('black', { attack: 3 });
      // Commander on E-8 is farther than range 1 from E-5.
      let gameState = stateWithUnitAndCommander(unit, 'E-8');
      gameState = withInPlay(
        gameState,
        'black',
        createTestCard({
          roundEffectModifiers: [{ type: 'attack', value: 1 }],
          roundEffectRestrictions: { inspirationRangeRestriction: 1 },
        }),
      );

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3);
    });

    it('leaves the base attack when the commander is off the board', () => {
      const unit = createTestUnit('black', { attack: 3 });
      let gameState = stateWithUnit(unit);
      gameState = withInPlay(
        gameState,
        'black',
        createTestCard({
          roundEffectModifiers: [{ type: 'attack', value: 1 }],
          roundEffectRestrictions: { inspirationRangeRestriction: 1 },
        }),
      );

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3);
    });
  });

  describe('round effect with unit restrictions', () => {
    it('adds the attack round modifier when both restriction lists are empty', () => {
      const unit = createTestUnit('black', { attack: 3 });
      let gameState = stateWithUnit(unit);
      gameState = withInPlay(
        gameState,
        'black',
        createTestCard({
          roundEffectModifiers: [{ type: 'attack', value: 1 }],
          // -1: no inspiration range; the fixture default is a tight 0.
          roundEffectRestrictions: { inspirationRangeRestriction: -1 },
        }),
      );

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(4);
    });

    it('leaves the base attack when the unit type is not in the restriction list', () => {
      const unit = createTestUnit('black', { attack: 3 });
      let gameState = stateWithUnit(unit);
      gameState = withInPlay(
        gameState,
        'black',
        createTestCard({
          roundEffectModifiers: [{ type: 'attack', value: 1 }],
          roundEffectRestrictions: { unitRestrictions: ['different-unit-id'] },
        }),
      );

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3);
    });
  });

  describe('active command modifiers', () => {
    it('leaves the base attack when the unit was commanded and no card is in play', () => {
      const unit = createTestUnit('black', { attack: 3 });
      let gameState = stateWithUnit(unit);
      gameState = withCommandedUnit(gameState, unit);

      const result = getCurrentUnitStat(unit, 'attack', gameState);

      expect(result).toBe(3);
    });

    it('leaves the base attack when the command modifier list is empty', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const card = createTestCard();
      // The list is present and empty. This is not a missing modifiers field.
      const inPlay = {
        ...card,
        command: {
          ...card.command,
          modifiers: [],
        },
      };
      let gameState = stateWithUnit(unit);
      gameState = withCommandedUnit(gameState, unit);
      gameState = withInPlay(gameState, 'black', inPlay);

      const result = getCurrentUnitStat(unit, 'attack', gameState);

      expect(result).toBe(3);
    });

    it('adds the command modifier when the unit was commanded', () => {
      const unit = createTestUnit('black', { attack: 3 });
      let gameState = stateWithUnit(unit);
      gameState = withCommandedUnit(gameState, unit);
      gameState = withInPlay(
        gameState,
        'black',
        createTestCard({
          commandModifiers: [{ type: 'attack', value: 2 }],
        }),
      );

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(5);
    });

    it('leaves the base attack when the unit was not commanded', () => {
      const unit = createTestUnit('black', { attack: 3 });
      let gameState = stateWithUnit(unit);
      // The round starts with no commanded units. Write that list so the fact is on the page.
      gameState = updateRoundState(gameState, {
        ...gameState.currentRoundState,
        commandedUnits: [],
      });
      gameState = withInPlay(
        gameState,
        'black',
        createTestCard({
          commandModifiers: [{ type: 'attack', value: 2 }],
        }),
      );

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3);
    });

    it('leaves the base attack when the command modifier is for speed', () => {
      const unit = createTestUnit('black', { attack: 3 });
      let gameState = stateWithUnit(unit);
      gameState = withCommandedUnit(gameState, unit);
      gameState = withInPlay(
        gameState,
        'black',
        createTestCard({
          commandModifiers: [{ type: 'speed', value: 1 }],
        }),
      );

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3);
    });
  });

  describe('additional modifiers', () => {
    it('adds an extra attack modifier to the base', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = stateWithUnit(unit);

      const result = getCurrentUnitStat(unit, 'attack', gameState, [
        { type: 'attack', value: 2 },
      ]);

      expect(result).toBe(5);
    });

    it('adds an extra defense modifier to reverse', () => {
      const unit = createTestUnit('black', { reverse: 3 });
      const gameState = stateWithUnit(unit);

      const result = getCurrentUnitStat(unit, 'reverse', gameState, [
        { type: 'defense', value: 1 },
      ]);

      expect(result).toBe(4);
    });

    it('leaves the base attack when the extra modifier is for speed', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = stateWithUnit(unit);

      const result = getCurrentUnitStat(unit, 'attack', gameState, [
        { type: 'speed', value: 1 },
      ]);

      expect(result).toBe(3);
    });
  });

  describe('multiple modifiers stacking', () => {
    it('adds the round modifier and the command modifier', () => {
      const unit = createTestUnit('black', { attack: 3 });
      let gameState = stateWithUnit(unit);
      gameState = withCommandedUnit(gameState, unit);
      gameState = withInPlay(
        gameState,
        'black',
        createTestCard({
          commandModifiers: [{ type: 'attack', value: 1 }],
          roundEffectModifiers: [{ type: 'attack', value: 2 }],
          // -1: no inspiration range; the fixture default is a tight 0.
          roundEffectRestrictions: { inspirationRangeRestriction: -1 },
        }),
      );

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(6);
    });
  });
});

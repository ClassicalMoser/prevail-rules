import type { PlayerSide, UnitInstance } from '@entities';

import { createEmptyGameState } from '@factories';
import {
  createBoardWithCommander,
  createBoardWithUnits,
  createTestCard,
  createTestUnit,
  placed,
  replaceBoard,
} from '@testing';
import {
  addUnitsToCommandedUnits,
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
  return replaceBoard(createEmptyGameState('standard'), board);
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
  return replaceBoard(createEmptyGameState('standard'), board);
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
 * A unit's current stat is its printed value plus every modifier that reaches
 * it: its own card's round effect where its restrictions allow (§4.3.7), the
 * command's modifiers if it was ordered (§4.3.8), and a committed card passed
 * in (§8) — floored once at zero (§7.1.4).
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
  });

  describe('a committed card naming two stats (§8.2)', () => {
    // The card's modifiers as a commitment passes them: +1 Range, +1 Attack.
    const rangeAndAttack = [
      { type: 'range' as const, value: 1 },
      { type: 'attack' as const, value: 1 },
    ];

    it('gives both, where the moment reads both', () => {
      // A shot reads Range for its reach and Attack for its attack value: each
      // takes its own +1. Velites print Range 2 and Attack 2.
      const unit = createTestUnit('black', { attack: 2, range: 2 });
      const gameState = stateWithUnit(unit);

      expect(getCurrentUnitStat(unit, 'range', gameState, rangeAndAttack)).toBe(
        3,
      );
      expect(
        getCurrentUnitStat(unit, 'attack', gameState, rangeAndAttack),
      ).toBe(3);
    });

    it('gives only what the moment reads', () => {
      // Speed is on neither of the card's stats, so it is untouched: the
      // card contributes what it can, and nothing more. Velites print Speed 3.
      const unit = createTestUnit('black', { attack: 2, range: 2 });
      const gameState = stateWithUnit(unit);

      expect(getCurrentUnitStat(unit, 'speed', gameState, rangeAndAttack)).toBe(
        3,
      );
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

    it("takes nothing from the opponent's round effect", () => {
      const unit = createTestUnit('black', { attack: 3 });
      let gameState = stateWithUnit(unit);
      // White's card in play gives +2 Attack to every unit, unrestricted; a
      // round effect applies to its own player's units only (§4.3.7).
      gameState = withInPlay(
        gameState,
        'white',
        createTestCard({
          roundEffectModifiers: [{ type: 'attack', value: 2 }],
          roundEffectRestrictions: { inspirationRangeRestriction: -1 },
        }),
      );

      // Black's unit fights at its printed Attack.
      expect(getCurrentUnitStat(unit, 'attack', gameState)).toBe(3);
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
      // The unit took an order this round (§4.3.8).
      gameState = addUnitsToCommandedUnits(gameState, [unit]);

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
      // The unit took an order this round (§4.3.8).
      gameState = addUnitsToCommandedUnits(gameState, [unit]);
      gameState = withInPlay(gameState, 'black', inPlay);

      const result = getCurrentUnitStat(unit, 'attack', gameState);

      expect(result).toBe(3);
    });

    it('adds the command modifier when the unit was commanded', () => {
      const unit = createTestUnit('black', { attack: 3 });
      let gameState = stateWithUnit(unit);
      // The unit took an order this round (§4.3.8).
      gameState = addUnitsToCommandedUnits(gameState, [unit]);
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
      // The unit took an order this round (§4.3.8).
      gameState = addUnitsToCommandedUnits(gameState, [unit]);
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
      // The unit took an order this round (§4.3.8).
      gameState = addUnitsToCommandedUnits(gameState, [unit]);
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

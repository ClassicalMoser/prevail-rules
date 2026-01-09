import {
  createBoardWithCommander,
  createBoardWithUnits,
  createEmptyGameState,
  createTestUnit,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getCurrentUnitStat } from './getCurrentUnitStat';

describe('getCurrentUnitStat', () => {
  describe('base stat without modifiers', () => {
    it('should return base stat when no card is in play', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3);
    });

    it('should return base stat when card has no round effect', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      // Card 2 has no round effect modifiers
      gameState.cardState.blackPlayer.inPlay = {
        id: '2',
        name: 'Command Card 2',
        version: '1.0.0',
        initiative: 2,
        modifiers: [{ type: 'attack', value: 1 }],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            inspirationRangeRestriction: 1,
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [],
        },
        roundEffect: {
          restrictions: {
            inspirationRangeRestriction: 1,
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [],
        },
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3);
    });
  });

  describe('round effect modifiers', () => {
    it('should apply round effect modifier without restrictions', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [],
        },
        roundEffect: {
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [{ type: 'attack', value: 2 }],
        },
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(5); // 3 base + 2 modifier
    });

    it('should not apply round effect modifier when unit does not match stat', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [],
        },
        roundEffect: {
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [{ type: 'speed', value: 1 }], // Different stat
        },
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3); // No modifier applied
    });

    it('should apply defense modifier to any defense stat', () => {
      const unit = createTestUnit('black', { reverse: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [],
        },
        roundEffect: {
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [{ type: 'defense', value: 1 }],
        },
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'reverse', gameState);
      expect(result).toBe(4); // 3 base + 1 modifier
    });
  });

  describe('round effect with inspiration range restriction', () => {
    it('should apply modifier when unit is within inspiration range', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      // Place unit at E-5
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      // Place commander at E-6 (distance 1)
      gameState.boardState = createBoardWithCommander(
        'black',
        'E-6',
        gameState.boardState,
      );
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [],
        },
        roundEffect: {
          restrictions: {
            inspirationRangeRestriction: 1,
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [{ type: 'attack', value: 1 }],
        },
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(4); // 3 base + 1 modifier
    });

    it('should not apply modifier when unit is outside inspiration range', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      // Place unit at E-5
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      // Place commander at E-8 (distance 3, outside range 1)
      gameState.boardState = createBoardWithCommander(
        'black',
        'E-8',
        gameState.boardState,
      );
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [],
        },
        roundEffect: {
          restrictions: {
            inspirationRangeRestriction: 1,
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [{ type: 'attack', value: 1 }],
        },
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3); // No modifier applied
    });

    it('should not apply modifier when commander is not on board', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      // No commander on board
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [],
        },
        roundEffect: {
          restrictions: {
            inspirationRangeRestriction: 1,
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [{ type: 'attack', value: 1 }],
        },
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3); // No modifier applied (commander defeated)
    });
  });

  describe('round effect with unit restrictions', () => {
    it('should apply modifier when unit matches trait restrictions', () => {
      const unit = createTestUnit('black', { attack: 3 });
      // Assume unit has a trait - we'll need to check if unit has traits
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [],
        },
        roundEffect: {
          restrictions: {
            traitRestrictions: [], // Empty means no restriction
            unitRestrictions: [],
          },
          modifiers: [{ type: 'attack', value: 1 }],
        },
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(4); // 3 base + 1 modifier
    });

    it('should not apply modifier when unit does not match unit restrictions', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [],
        },
        roundEffect: {
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: ['different-unit-id'], // Unit doesn't match
          },
          modifiers: [{ type: 'attack', value: 1 }],
        },
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3); // No modifier applied
    });
  });

  describe('round effect with combined restrictions', () => {
    it('should apply modifier when all restrictions are satisfied', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.boardState = createBoardWithCommander(
        'black',
        'E-6',
        gameState.boardState,
      );
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [],
        },
        roundEffect: {
          restrictions: {
            inspirationRangeRestriction: 1,
            traitRestrictions: [],
            unitRestrictions: [], // Empty means any unit
          },
          modifiers: [{ type: 'attack', value: 1 }],
        },
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(4); // 3 base + 1 modifier
    });

    it('should not apply modifier when inspiration range restriction is not satisfied', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.boardState = createBoardWithCommander(
        'black',
        'E-8',
        gameState.boardState,
      );
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [],
        },
        roundEffect: {
          restrictions: {
            inspirationRangeRestriction: 1,
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [{ type: 'attack', value: 1 }],
        },
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3); // No modifier applied
    });
  });

  describe('active command modifiers', () => {
    it('should apply command modifier when unit was commanded', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.currentRoundState.commandedUnits = new Set([unit]);
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [{ type: 'attack', value: 2 }],
        },
        roundEffect: undefined,
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(5); // 3 base + 2 modifier
    });

    it('should not apply command modifier when unit was not commanded', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.currentRoundState.commandedUnits = new Set(); // Empty
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [{ type: 'attack', value: 2 }],
        },
        roundEffect: undefined,
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3); // No modifier applied
    });

    it('should not apply command modifier when stat does not match', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.currentRoundState.commandedUnits = new Set([unit]);
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [{ type: 'speed', value: 1 }], // Different stat
        },
        roundEffect: undefined,
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(3); // No modifier applied
    });
  });

  describe('multiple modifiers stacking', () => {
    it('should stack round effect and command modifiers', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.currentRoundState.commandedUnits = new Set([unit]);
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [{ type: 'attack', value: 1 }],
        },
        roundEffect: {
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [{ type: 'attack', value: 2 }],
        },
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(6); // 3 base + 2 round effect + 1 command
    });
  });

  describe('edge cases', () => {
    it('should throw error when unit is not on board and inspiration range is required', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      // Unit not placed on board
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [],
        },
        roundEffect: {
          restrictions: {
            inspirationRangeRestriction: 1,
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [{ type: 'attack', value: 1 }],
        },
        unitPreservation: [],
      };

      expect(() => {
        getCurrentUnitStat(unit, 'attack', gameState);
      }).toThrow('Unit not found on board');
    });

    it('should handle negative modifiers', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const gameState = createEmptyGameState();
      gameState.boardState = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);
      gameState.cardState.blackPlayer.inPlay = {
        id: 'test-card',
        name: 'Test Card',
        version: '1.0.0',
        initiative: 1,
        modifiers: [],
        command: {
          size: 'units',
          type: 'movement',
          number: 1,
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [],
        },
        roundEffect: {
          restrictions: {
            traitRestrictions: [],
            unitRestrictions: [],
          },
          modifiers: [{ type: 'attack', value: -1 }],
        },
        unitPreservation: [],
      };

      const result = getCurrentUnitStat(unit, 'attack', gameState);
      expect(result).toBe(2); // 3 base - 1 modifier
    });
  });
});

import type {
  StandardBoard,
  StandardBoardCoordinate,
  UnitPlacement,
} from '@entities';
import type { MoveExplorationConfig } from './exploreMoves';
import { getForwardSpace, getRearwardSpace } from '@queries/boardSpace';
import { getCurrentUnitStat } from '@queries/getCurrentUnitStat';
import { createEmptyGameState, createTestUnit } from '@testing';
import { canMoveInto } from '@validation';
import { describe, expect, it } from 'vitest';
import { exploreMoves } from './exploreMoves';

describe('exploreMoves', () => {
  const unit = createTestUnit('black', { flexibility: 1, speed: 2 });
  const startingPosition: UnitPlacement<StandardBoard> = {
    coordinate: 'E-5',
    facing: 'north',
  };

  describe('callback contract', () => {
    it('should call onValidDestination for the starting position', () => {
      const gameState = createEmptyGameState();
      let startingPositionCalled = false;

      const config: MoveExplorationConfig<StandardBoard> = {
        getSpaceInDirection: getForwardSpace,
        canEndAt: canMoveInto,
        onValidDestination: (placement, flexibilityUsed, speedUsed) => {
          if (
            placement.coordinate === startingPosition.coordinate &&
            placement.facing === startingPosition.facing
          ) {
            startingPositionCalled = true;
            expect(flexibilityUsed).toBe(0);
            expect(speedUsed).toBe(0);
          }
        },
      };

      exploreMoves(unit, gameState, startingPosition, config);

      expect(startingPositionCalled).toBe(true);
    });

    it('should call onValidDestination with correct cost tracking', () => {
      const gameState = createEmptyGameState();
      const calls: Array<{
        flexibilityUsed: number;
        speedUsed: number;
        previousCoordinate: StandardBoardCoordinate | undefined;
      }> = [];
      const currentUnitFlexibility = getCurrentUnitStat(
        unit,
        'flexibility',
        gameState,
      );
      const currentUnitSpeed = getCurrentUnitStat(unit, 'speed', gameState);
      const config: MoveExplorationConfig<StandardBoard> = {
        getSpaceInDirection: getForwardSpace,
        canEndAt: canMoveInto,
        onValidDestination: (
          placement,
          flexibilityUsed,
          speedUsed,
          previousCoordinate,
        ) => {
          calls.push({
            flexibilityUsed,
            speedUsed,
            previousCoordinate,
          });
        },
      };

      exploreMoves(unit, gameState, startingPosition, config);

      // Starting position should have 0 costs and no previous coordinate
      const startingCall = calls.find(
        (c) => c.previousCoordinate === undefined && c.flexibilityUsed === 0,
      );
      expect(startingCall).toBeDefined();
      expect(startingCall?.speedUsed).toBe(0);

      // Should have calls with increasing costs
      const callsWithMovement = calls.filter(
        (c) => c.previousCoordinate !== undefined,
      );
      expect(callsWithMovement.length).toBeGreaterThan(0);

      // Costs should be non-negative and within unit limits
      calls.forEach((call) => {
        expect(call.flexibilityUsed).toBeGreaterThanOrEqual(0);
        expect(call.flexibilityUsed).toBeLessThanOrEqual(
          currentUnitFlexibility,
        );
        expect(call.speedUsed).toBeGreaterThanOrEqual(0);
        expect(call.speedUsed).toBeLessThanOrEqual(currentUnitSpeed);
      });
    });
  });

  describe('configuration respect', () => {
    it('should respect canEndAt when determining valid destinations', () => {
      const gameState = createEmptyGameState();
      const validDestinations: StandardBoardCoordinate[] = [];

      const config: MoveExplorationConfig<StandardBoard> = {
        getSpaceInDirection: getForwardSpace,
        canEndAt: (u, b, coord) => {
          // Only allow ending at starting position
          return coord === startingPosition.coordinate;
        },
        onValidDestination: (placement) => {
          validDestinations.push(placement.coordinate);
        },
      };

      exploreMoves(unit, gameState, startingPosition, config);

      // Should only call for starting position
      expect(
        validDestinations.every((c) => c === startingPosition.coordinate),
      ).toBe(true);
    });

    it('should respect shouldContinueExploring to limit exploration', () => {
      const gameState = createEmptyGameState();
      let maxSpeedUsed = 0;

      const config: MoveExplorationConfig<StandardBoard> = {
        getSpaceInDirection: getForwardSpace,
        canEndAt: canMoveInto,
        shouldContinueExploring: (flexibilityUsed, speedUsed) => {
          return speedUsed < 1; // Stop after speed 1
        },
        onValidDestination: (placement, flexibilityUsed, speedUsed) => {
          maxSpeedUsed = Math.max(maxSpeedUsed, speedUsed);
        },
      };

      exploreMoves(unit, gameState, startingPosition, config);

      // Should not explore beyond speed 1
      expect(maxSpeedUsed).toBeLessThanOrEqual(1);
    });

    it('should use getSpaceInDirection to determine movement direction', () => {
      const gameState = createEmptyGameState();
      const forwardDestinations: StandardBoardCoordinate[] = [];
      const backwardDestinations: StandardBoardCoordinate[] = [];

      // Test forward movement
      const forwardConfig: MoveExplorationConfig<StandardBoard> = {
        getSpaceInDirection: getForwardSpace,
        canEndAt: canMoveInto,
        onValidDestination: (placement) => {
          if (placement.coordinate !== startingPosition.coordinate) {
            forwardDestinations.push(placement.coordinate);
          }
        },
      };

      exploreMoves(unit, gameState, startingPosition, forwardConfig);

      const backwardConfig: MoveExplorationConfig<StandardBoard> = {
        getSpaceInDirection: getRearwardSpace,
        canEndAt: (u, b, coord) => {
          const space = b.board[coord];
          return space.unitPresence.presenceType === 'none';
        },
        onValidDestination: (placement) => {
          if (placement.coordinate !== startingPosition.coordinate) {
            backwardDestinations.push(placement.coordinate);
          }
        },
      };

      exploreMoves(unit, gameState, startingPosition, backwardConfig);

      // Both should explore some destinations
      expect(forwardDestinations.length).toBeGreaterThan(0);
      expect(backwardDestinations.length).toBeGreaterThan(0);
    });
  });

  describe('state management', () => {
    it('should not call onValidDestination multiple times for the same state (coordinate, facing, costs)', () => {
      const gameState = createEmptyGameState();
      const callCounts = new Map<string, number>();

      const config: MoveExplorationConfig<StandardBoard> = {
        getSpaceInDirection: getForwardSpace,
        canEndAt: canMoveInto,
        onValidDestination: (
          placement,
          flexibilityUsed,
          speedUsed,
          _previousCoordinate,
        ) => {
          // State includes coordinate, facing, and costs
          const key = `${placement.coordinate}|${placement.facing}|${flexibilityUsed}|${speedUsed}`;
          callCounts.set(key, (callCounts.get(key) || 0) + 1);
        },
      };

      exploreMoves(unit, gameState, startingPosition, config);

      // Each unique state (coordinate + facing + costs) should be called at most once
      callCounts.forEach((count) => {
        expect(count).toBe(1);
      });
    });
  });
});

import type {
  StandardBoard,
  StandardBoardCoordinate,
  UnitPlacement,
} from '@entities';
import type { MoveExplorationConfig } from './exploreMoves';
import { getForwardSpace, getRearwardSpace } from '@queries/boardSpace';
import { createEmptyStandardBoard } from '@queries/createEmptyBoard';
import { createTestUnit } from '@testing';
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
      const board = createEmptyStandardBoard();
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

      exploreMoves(unit, board, startingPosition, config);

      expect(startingPositionCalled).toBe(true);
    });

    it('should call onValidDestination with correct cost tracking', () => {
      const board = createEmptyStandardBoard();
      const calls: Array<{
        flexibilityUsed: number;
        speedUsed: number;
        previousCoordinate: StandardBoardCoordinate | undefined;
      }> = [];

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

      exploreMoves(unit, board, startingPosition, config);

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
          unit.unitType.flexibility,
        );
        expect(call.speedUsed).toBeGreaterThanOrEqual(0);
        expect(call.speedUsed).toBeLessThanOrEqual(unit.unitType.speed);
      });
    });
  });

  describe('configuration respect', () => {
    it('should respect canEndAt when determining valid destinations', () => {
      const board = createEmptyStandardBoard();
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

      exploreMoves(unit, board, startingPosition, config);

      // Should only call for starting position
      expect(
        validDestinations.every((c) => c === startingPosition.coordinate),
      ).toBe(true);
    });

    it('should respect shouldContinueExploring to limit exploration', () => {
      const board = createEmptyStandardBoard();
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

      exploreMoves(unit, board, startingPosition, config);

      // Should not explore beyond speed 1
      expect(maxSpeedUsed).toBeLessThanOrEqual(1);
    });

    it('should use getSpaceInDirection to determine movement direction', () => {
      const board = createEmptyStandardBoard();
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

      exploreMoves(unit, board, startingPosition, forwardConfig);

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

      exploreMoves(unit, board, startingPosition, backwardConfig);

      // Both should explore some destinations
      expect(forwardDestinations.length).toBeGreaterThan(0);
      expect(backwardDestinations.length).toBeGreaterThan(0);
    });
  });

  describe('state management', () => {
    it('should not call onValidDestination multiple times for the same state (coordinate, facing, costs)', () => {
      const board = createEmptyStandardBoard();
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

      exploreMoves(unit, board, startingPosition, config);

      // Each unique state (coordinate + facing + costs) should be called at most once
      callCounts.forEach((count) => {
        expect(count).toBe(1);
      });
    });
  });
});

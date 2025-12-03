# Prevail Rules

A TypeScript rules engine for **Prevail: Ancient Battles**, a tactical board game where players command armies of historical units.

## About the Game

Prevail: Ancient Battles is a two-player tactical board game featuring:

- **Unit-based combat** with facing, movement, and engagement mechanics
- **Command cards** that determine initiative and available actions each round
- **Tactical positioning** where unit facing, flanking, and engagement rules matter
- **Multiple board sizes** (standard, small, large) for different game scenarios

Units have stats like speed, flexibility, attack, and range. Movement is constrained by terrain, unit facing, and the ability to pass through friendly units. Combat involves engagements where units face off, with rules for flanking, rear attacks, and facing changes.

## What This Library Does

This library provides a **type-safe rules engine** that:

- Validates unit movements and combat actions
- Calculates legal moves based on unit stats and board state
- Enforces game rules (engagement, facing, movement constraints)
- Manages game state (rounds, phases, command cards, board positions)

Perfect for building a web-based implementation of the game.

## Installation

```bash
npm install @classicalmoser/prevail-rules
```

## Quick Start

```typescript
import {
  createEmptyStandardBoard,
  getLegalUnitMoves,
} from '@classicalmoser/prevail-rules';
import { canMoveInto } from '@classicalmoser/prevail-rules/validation';

// Create a board
const board = createEmptyStandardBoard();

// Check if a unit can move into a space
const canMove = canMoveInto(unit, board, 'F-5');

// Get all legal moves for a unit (considers speed, flexibility, facing, terrain)
const legalMoves = getLegalUnitMoves(unit, board, {
  coordinate: 'E-5',
  facing: 'north',
});
```

## Key Features

### Type Safety

The library uses TypeScript generics to ensure board types match their coordinates:

```typescript
// ✅ Type-safe
const standardBoard: StandardBoard = createEmptyStandardBoard();
const space = getBoardSpace(standardBoard, 'E-5');

// ❌ Type error
const space = getBoardSpace(standardBoard, 'A-1' as SmallBoardCoordinate);
```

### Validation Functions

All validation functions return booleans and never throw:

```typescript
canMoveInto(unit, board, coordinate); // true/false
canMoveThrough(unit, board, coordinate); // true/false
isLegalMove(moveCommand, boardState); // true/false
```

See [`src/validation/README.md`](./src/validation/README.md) for the validation pattern.

### Core Functions

- `getLegalUnitMoves()` - Calculate all legal moves for a unit
- `getBoardSpace()` - Get board space at coordinate
- `getPlayerUnitWithPosition()` - Get friendly unit at position
- Board operations: adjacency, areas, directions, facing calculations

## Project Structure

```
src/
├── entities/      # Game models (Game, Board, Unit, Card, etc.)
├── functions/     # Business logic (movement, board operations)
├── validation/    # Rule validation (canMoveInto, canEngageEnemy, etc.)
├── commands/       # Command objects (MoveUnitCommand, etc.)
└── testing/       # Test helpers
```

## Development

```bash
# Install
pnpm install

# Type check
pnpm typecheck

# Test
pnpm test

# Lint & format
pnpm validate
```

The project uses path aliases (`@entities`, `@functions`, `@validation`, etc.) - see `tsconfig.json` for the full list.

## Documentation

- [`src/validation/README.md`](./src/validation/README.md) - Validation function patterns
- [`src/entities/README.md`](./src/entities/README.md) - Entity patterns and type safety

## License

ISC

## Repository

[GitHub](https://github.com/ClassicalMoser/prevail-rules)

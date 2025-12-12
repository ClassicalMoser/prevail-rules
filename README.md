# Prevail Rules

> **⚠️ Work In Progress:** This project is in active development. The domain layer provides a solid foundation with entities, events, queries, and validation, but the Rules Engine and some state transitions are still being implemented. Expect documentation to be incomplete and all changes to be breaking.

A TypeScript rules engine for **Prevail: Ancient Battles**, a tactical board game where players command armies of historical units. This is a **unified source of truth** rules engine designed to be shared across browser clients, web servers, and future clients.

## About the Game

Prevail: Ancient Battles is a two-player tactical board game designed as a response to the typical rules bloat that comes with many existing historical battlefield miniatures games.

### Game Distinctives

#### High Abstraction

- **Singular Win Condition**: If at any moment a player's hand has no cards remaining, they have lost the battle. Your hand represents your army's will to fight—when it's gone, the battle is over. No complex victory point calculations or unit elimination tracking needed.
- **Morale/Casualty/Fatigue Abstraction**: The hand cards represent all of these together through a simple combination of key traits. Cards are discarded on important unit routs, and spent for commands or additional commitments. No separate tracking systems are needed.
- **Unit Support System**: Units must be "preserved" by cards in your hand. If you can't maintain support for a unit type (by having cards that preserve them), those units break and rout. This elegantly models the historical reality that armies need command structure to function.
- **Card-Based Command**: Every action requires committing a card. Cards provide both the command capability (what you can order) and the initiative value (when you act). This dual-purpose design eliminates separate command point systems.
- **Commander Representation**: Commanders move on the board to provide "inspiration range" for issuing commands. Position your commanders strategically to extend your command reach, but risk them in the fighting. This creates meaningful tactical decisions without complex command radius rules or separate command phase mechanics.
- **Realistic Modeling**: Certain historical tactics and unit types which normally require additional rules overhead can be expressed more straightforwardly under this flexible system. The card system's restrictions and modifiers handle special cases naturally, keeping the core rules simple while allowing for historical authenticity.

#### Historical Accuracy

- **Authentic unit types**: Units represent historical formations (Polybian Hastatii, Hellenistic Thureophoroi, etc.)
- **Tactical positioning**: Facing, flanking, and engagement rules reflect historical combat dynamics
- **Command structure**: Command cards and initiative system model historical command and control
- **Terrain effects**: Board terrain (elevation, water, terrain types) affects movement and combat

#### No Tokens, No Measurement, No Dice

- **No tokens**: Game state is represented purely in unit positions and command cards—no status markers, wound counters, or resource tokens cluttering the board.
- **No measurement**: Movement and ranges are discrete board spaces, not measured distances. No rulers or templates needed.
- **No dice**: All outcomes are deterministic calculations based on unit stats, positioning, and card effects. Combat resolution is predictable and skill-based, not luck-based.

### Gameplay Overview

Prevail: Ancient Battles is a two-player tactical board game featuring:

- **Unit-based combat** with facing, movement, and engagement mechanics
- **Command cards** that determine initiative and available actions each round
- **Tactical positioning** where unit facing, flanking, and engagement rules matter
- **Multiple board sizes** (standard, small, large) for different game scenarios

Units have stats like speed, flexibility, attack, and range. Movement is constrained by terrain, unit facing, and the ability to pass through friendly units. Combat involves engagements where units face off, with rules for flanking, rear attacks, and facing changes.

## What This Library Does

This library provides a **type-safe, pure function-based rules engine** that:

- **Validates** unit movements and combat actions according to game rules
- **Calculates** legal moves based on unit stats, board state, and terrain
- **Enforces** game rules (engagement, facing, movement constraints) deterministically
- **Manages** game state (rounds, phases, command cards, board positions) immutably
- **Executes** events through a pure function pipeline: validate → apply or reject

The engine is **runtime-agnostic** and designed to be shared across browser clients, web servers, and future clients. All game logic is implemented as pure functions with no side effects, making it highly testable and portable.

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
src/domain/
├── entities/      # Domain models (Game, Board, Unit, Card, etc.)
├── events/        # Event definitions (PlayerChoice, GameEffect)
├── queries/       # Read operations (getLegalMoves, getBoardSpace, etc.)
├── validation/    # Rule validation (canMoveInto, isLegalMove, etc.)
├── transforms/    # State transitions (RulesEngine, applyEvent, etc.)
├── ruleValues/    # Game constants and configuration
├── sampleValues/  # Placeholder data for development
├── testing/       # Test helpers and utilities
└── utils/         # General utilities
```

See [`src/domain/README.md`](./src/domain/README.md) for detailed architecture documentation.

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

The project uses path aliases (`@entities`, `@queries`, `@validation`, etc.) - see `tsconfig.json` for the full list.

## Documentation

- [`src/domain/README.md`](./src/domain/README.md) - Domain layer architecture and design
- [`src/domain/validation/README.md`](./src/domain/validation/README.md) - Validation function patterns
- [`src/domain/entities/README.md`](./src/domain/entities/README.md) - Entity patterns and type safety

## License

ISC

## Repository

[GitHub](https://github.com/ClassicalMoser/prevail-rules)

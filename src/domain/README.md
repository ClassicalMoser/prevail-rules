# Domain Layer: Prevail: Ancient Battles Rules Engine

> **⚠️ Work In Progress:** This project is in active development. The domain layer provides a solid foundation with entities, events, queries, and validation, but the Rules Engine and some state transitions are still being implemented. See the [Transforms section](#5-transforms-transforms) for current status. Expect documentation to be incomplete and all changes to be breaking.

This directory contains the **unified source of truth** for all game rules and business logic for the digital adaptation of the board game Prevail: Ancient Battles. This codebase serves as the authoritative rules engine that can be shared across:

- **Browser clients** (React or Solid.js web app)
- **Web server** (Node.js backend via WS)
- **Future clients** (mobile apps, desktop applications)
- **Service workers** (offline game logic, background processing)

## Purpose

This domain layer provides a **runtime-agnostic, pure function-based rules engine** that enforces game rules deterministically without side effects. All game logic is implemented as pure functions that take a game state and an event (player choice or game effect), and return the new game state or a rejection, making it:

- **Testable**: Pure functions are easy to test in isolation
- **Portable**: Works in any JavaScript/TypeScript runtime
- **Reliable**: No hidden state or side effects means predictable behavior
- **Type-safe**: Full TypeScript coverage with compile-time guarantees

## Game Distinctives

Prevail: Ancient Battles is designed as a response to the typical rules bloat that comes with many existing historical battlefield miniatures games:

### High Abstraction

- **Singular Win Condition**: If at any moment a player's hand has no cards remaining, they have lost the battle. Your hand represents your army's will to fight—when it's gone, the battle is over. No complex victory point calculations or unit elimination tracking needed.
- **Morale/Casualty/Fatigue Abstraction**: The hand cards represent all of these together through a simple combination of key traits. Cards are discarded on important unit routs, and spent for commands or additional commitments. No separate tracking systems are needed.
- **Unit Support System**: Units must be "preserved" by cards in your hand. If you can't maintain support for a unit type (by having cards that preserve them), those units break and rout. This elegantly models the historical reality that armies need command structure to function.
- **Card-Based Command**: Every action requires committing a card. Cards provide both the command capability (what you can order) and the initiative value (when you act). This dual-purpose design eliminates separate command point systems.
- **Commander Representation**: Commanders move on the board to provide "inspiration range" for issuing commands. Position your commanders strategically to extend your command reach, but risk them in the fighting. This creates meaningful tactical decisions without complex command radius rules or separate command phase mechanics.
- **Realistic Modeling**: Certain historical tactics and unit types which normally require additional rules overhead can be expressed more straightforwardly under this flexible system. The card system's restrictions and modifiers handle special cases naturally, keeping the core rules simple while allowing for historical authenticity.

### Historical Accuracy

- **Authentic unit types**: Units represent historical formations (Polybian Hastatii, Hellenistic Thureophoroi, etc.)
- **Tactical positioning**: Facing, flanking, and engagement rules reflect historical combat dynamics
- **Command structure**: Command cards and initiative system model historical command and control
- **Terrain effects**: Board terrain (elevation, water, terrain types) affects movement and combat

### No Tokens, No Measurement, No Dice

- **No tokens**: Game state is represented purely in unit positions and command cards—no status markers, wound counters, or resource tokens cluttering the board.
- **No measurement**: Movement and ranges are discrete board spaces, not measured distances. No rulers or templates needed.
- **No dice**: All outcomes are deterministic calculations based on unit stats, positioning, and card effects. Combat resolution is predictable and skill-based, not luck-based.

## Architecture Overview

The domain layer is organized into clear, modular components:

### Core Components

#### 1. **Entities** (`entities/`)

Domain models representing game concepts. All entities follow a **schema-first type safety pattern** that ensures both runtime validation (via Zod) and compile-time type safety (via TypeScript).

**Key Entities:**

- `Game` / `GameState` - Complete game configuration and current state
- `Board` - Game board with spaces, terrain, and unit positions
- `UnitType` / `UnitInstance` - Unit definitions and instances on the board
- `Card` / `CardState` - Command cards and their state
- `Player` / `PlayerSide` - Player information
- `RoundState` / `PhaseState` - Round and phase tracking

**Pattern:** All entities use Zod schemas for runtime validation and TypeScript interfaces for compile-time checking, with `AssertExact` ensuring type-schema alignment.

#### 2. **Events** (`events/`)

Immutable event objects representing all possible game actions. Events are the **only way** to modify game state.

**Event Categories:**

- **Player Choice Events** (`playerChoices/`): Actions initiated by players
  - `ChooseCardEvent` - Select a command card
  - `IssueCommandEvent` - Issue a command to units
  - `MoveUnitEvent` - Move a unit
  - `MoveCommanderEvent` - Move a commander
  - `CommitToMeleeEvent` - Commit a card to a melee combat
  - `CommitToMovementEvent` - Commit a card to a unit movement
  - `CommitToRangedAttackEvent` - Commit a card to a ranged attack
  - `PerformRangedAttackEvent` - Perform a ranged attack
  - `ChooseMeleeResolutionEvent` - Choose a melee to resolve
  - `ChooseRallyEvent` - Choose whether to perform a rally
  - `SetupUnitsEvent` - Place units on the board

- **Game Effect Events** (`gameEffects/`): Deterministic game state changes
  - `ResolveEngagementEvent` - Resolve unit engagement
  - `ResolveMeleeEvent` - Resolve melee combat
  - `ResolveRangedAttackEvent` - Resolve ranged attack
  - `ResolveInitiativeEvent` - Determine initiative
  - `ResolveRetreatEvent` - Resolve unit retreat
  - `ResolveRoutEvent` - Resolve unit rout
  - `ResolveReverseEvent` - Resolve unit facing reversal
  - `ResolveRallyEvent` - Resolve unit rally
  - `ResolveUnitsBrokenEvent` - Resolve units that are no longer supported

**Pattern:** Events are discriminated unions with `eventType` and nested `choiceType`/`effectType` fields for efficient validation and type narrowing.

#### 3. **Queries** (`queries/`)

Pure functions that extract information from game state without modifying it. These are the "read" operations of the domain.

**Query Categories:**

- **Board Operations** (`boardSpace/`): Coordinate calculations, adjacency, directions, areas
  - `getBoardSpace()` - Get space at coordinate
  - `getAdjacentSpaces()` - Get adjacent spaces
  - `getFrontSpaces()` / `getFlankingSpaces()` / `getBackSpaces()` - Directional spaces
  - `getSpacesAhead()` / `getSpacesBehind()` - Area calculations
  - `getForwardSpace()` / `getLeftSpace()` / `getRightSpace()` - Directional movement

- **Unit Operations** (`unit/`, `unitMovement/`, `unitPresence/`): Unit queries
  - `getLegalUnitMoves()` - Calculate all legal moves for a unit
  - `getLegalRetreats()` - Calculate legal retreat paths
  - `getPlayerUnitWithPosition()` - Find friendly unit at position
  - `getLinesFromUnit()` - Get all line formations that include a given unit

- **Phase Operations**: Round and phase queries
  - `getNextPhase()` - Get the next phase in the round sequence

- **Facing Operations** (`facings/`): Direction calculations
  - `getOppositeFacing()` - Get opposite direction
  - `getLeftFacing()` / `getRightFacing()` - Get relative directions
  - `getAdjacentFacings()` / `getOrthogonalFacings()` - Get related directions

**Pattern:** Query functions can throw errors for invalid inputs (e.g., invalid coordinates). They are "getters" that assume valid state.

#### 4. **Validation** (`validation/`)

Pure functions that check whether game actions, states, or conditions are valid according to game rules. These are the "guard" operations.

**Validation Categories:**

- **Unit Movement** (`unitMovement/`): Movement rule validation
  - `canMoveInto()` - Check if unit can move to space
  - `canMoveThrough()` - Check if unit can pass through space
  - `canEngageEnemy()` - Check if unit can engage enemy
  - `isLegalMove()` - Validate complete move command

- **Unit Presence** (`unitPresence/`): Unit state validation
  - `hasNoUnit()` / `hasSingleUnit()` / `hasEngagedUnits()` - Type guards
  - `isAtPlacement()` - Check if unit is at position

- **Card Validation**: Card choice validation
  - `isLegalCardChoice()` - Validate card selection
  - `isLegalCommanderMove()` - Validate commander movement

- **General Validation**: Other rule checks
  - `isValidLine()` - Validate line formation
  - `matchesUnitRequirements()` - Check unit requirements
  - `isSameUnitInstance()` / `isSameUnitType()` - Unit comparison

**Pattern:** Validation functions **always return boolean** and **never throw errors**. They wrap query functions in try-catch to return `false` on any error.

#### 5. **Transforms** (`transforms/`)

State transition functions that apply events to game state. This is the "write" layer of the domain.

**Components:**

- **Rules Engine** (`engine.ts`): Main engine for executing events
  - ⚠️ **Work In Progress** - The rules engine is currently a stub implementation
  - **Planned behavior**: Player inputs events → game validates → either applies or rejects
  - `RulesEngine.execute()` - Execute single event (validation → apply or reject)
  - `RulesEngine.executeSequence()` - Execute multiple events in sequence
  - Validates events before applying using domain validation functions
  - Handles triggered events (e.g., engagement from movement)
  - Returns results without side effects

- **State Transitions** (`stateTransitions/`): Individual event application functions
  - `applyMoveUnitEvent()` - Apply unit movement
  - (Additional transition functions for each event type)

**Pattern:** Transforms are pure functions that take `(event, state)` and return `newState`. They never mutate input state. The rules engine validates player inputs and either applies the state transition or rejects with errors.

#### 6. **Rule Values** (`ruleValues/`)

Game constants and configuration values.

- `traits.ts` - Unit trait definitions
- `gameTypes.ts` - Game type configurations
- `ruleValues.ts` - General rule constants

#### 7. **Sample Values** (`sampleValues/`)

Placeholder data for development and testing until a permanent database is set up.

- `tempUnits.ts` - Sample unit definitions
- `tempCommandCards.ts` - Sample command cards

#### 8. **Testing** (`testing/`)

Test helpers and utilities for writing domain tests.

- `createBoard.ts` - Board creation helpers
- `createUnitInstance.ts` - Unit instance helpers
- `unitHelpers.ts` - Unit testing utilities
- `testHelpers.ts` - General test utilities

#### 9. **Utils** (`utils/`)

General utility functions used across the domain.

- `assertExact.ts` - Type assertion utility for schema-first pattern

## Game Engine Outline

The domain layer provides the foundation for a complete game engine. Here's a suggested architecture for implementing a full game engine on top of this domain:

### 1. **Event Sourcing Layer**

- **Event Store**: Persist all events in sequence
- **Event Replay**: Reconstruct game state from event history
- **Event Validation**: Use domain validation before persisting
- **Snapshot System**: Periodic state snapshots for performance

### 2. **Command Layer** (Application Layer)

- **Command Handlers**: Translate user actions into domain events
- **Command Validation**: Pre-validate commands before creating events
- **Command Queue**: Queue commands for sequential processing
- **Authorization**: Check player permissions for commands

### 3. **Query Layer** (Read Model)

- **Game State Projections**: Materialized views of current game state
- **Legal Move Cache**: Cache legal moves for performance
- **Board State Queries**: Optimized queries for board visualization
- **History Queries**: Query past game states and events

### 4. **Phase Management**

- **Phase Transitions**: Automatically advance phases based on game state
- **Phase Validation**: Ensure all phase requirements are met
- **Phase Notifications**: Notify clients of phase changes
- **Turn Management**: Track whose turn it is within each phase

### 5. **Initiative System**

- **Initiative Calculation**: Determine initiative from card choices
- **Initiative Resolution**: Resolve ties and special cases
- **Initiative Tracking**: Track initiative throughout the round

### 6. **Combat Resolution**

- **Melee Resolution**: Orchestrate melee combat resolution
- **Ranged Attack Resolution**: Handle ranged attack calculations
- **Support Calculation**: Calculate unit support bonuses
- **Combat Outcome Application**: Apply combat results to game state

### 7. **Game Flow Orchestration**

- **Round Management**: Manage round lifecycle
- **Phase Orchestration**: Coordinate phase transitions
- **Event Triggering**: Automatically trigger game effect events
- **State Synchronization**: Keep all game state consistent

### 8. **Client Interface**

- **Event API**: Accept events from clients
- **State API**: Provide current game state to clients
- **Query API**: Provide optimized queries for UI
- **WebSocket/SSE**: Real-time state updates

### 9. **Persistence Layer**

- **Game Repository**: Save/load games
- **Event Persistence**: Store event stream
- **State Persistence**: Store state snapshots
- **Migration System**: Handle schema changes

### 10. **Validation & Error Handling**

- **Pre-execution Validation**: Validate events before execution
- **Post-execution Validation**: Verify state consistency
- **Error Recovery**: Handle and recover from errors
- **Audit Logging**: Log all state changes

## Design Principles

### Pure Functions

All domain logic is implemented as pure functions:

- No side effects (no I/O, no mutations)
- Same input always produces same output
- Easy to test and reason about

### Immutability

All state is immutable:

- Events are immutable objects
- State transitions create new state, never mutate
- Enables time-travel debugging and event replay

### Type Safety

Full TypeScript coverage:

- Compile-time type checking
- Runtime validation with Zod schemas
- Type-schema alignment verification

### Validation Pattern

Clear separation between queries and validation:

- **Queries** can throw (assume valid input)
- **Validation** never throws (always returns boolean)
- Validation wraps queries in try-catch

### Event-Driven Architecture

All state changes go through events:

- Events are the single source of truth
- Events can be logged, replayed, and audited
- Events enable event sourcing patterns

## Usage Example

> ⚠️ **Note**: The Rules Engine is currently a work in progress. The example below shows a general representation of the planned API.

```typescript
import { RulesEngine } from '@transforms';
import { createEmptyStandardBoard } from '@queries';
import { MoveUnitEvent } from '@events';
import type { GameState } from '@entities';

// Create initial game state
const initialState: GameState = {
  currentRoundNumber: 1,
  currentRoundState: {
    /* ... */
  },
  currentInitiative: 'white',
  boardState: createEmptyStandardBoard(),
  cardState: {
    /* ... */
  },
  defeatedUnits: new Set(),
};

// Create rules engine
const engine = new RulesEngine();

// Player inputs a move event
const moveEvent: MoveUnitEvent = {
  eventType: 'playerChoice',
  choiceType: 'moveUnit',
  player: 'white',
  unit: {
    /* ... */
  },
  from: { coordinate: 'E-5', facing: 'north' },
  to: { coordinate: 'D-5', facing: 'north' },
};

// Game validates, then either applies or rejects
const result = engine.execute(moveEvent, initialState);

if (result.success) {
  // Event was validated and applied
  // Use result.newState for updated game state
  // Check result.triggeredEvents for automatic events (e.g., engagement)
} else {
  // Event was rejected - handle result.errors
  console.error('Move rejected:', result.errors);
}
```

## Directory Structure

```
domain/
├── entities/          # Domain models (Game, Board, Unit, Card, etc.)
├── events/            # Event definitions (PlayerChoice, GameEffect)
├── queries/           # Read operations (getLegalMoves, getBoardSpace, etc.)
├── validation/        # Rule validation (canMoveInto, isLegalMove, etc.)
├── transforms/        # State transitions (RulesEngine, applyEvent, etc.)
├── ruleValues/        # Game constants and configuration
├── sampleValues/      # Placeholder data for development
├── testing/           # Test helpers and utilities
└── utils/             # General utilities
```

## Related Documentation

- [`entities/README.md`](./entities/README.md) - Entity patterns and type safety
- [`validation/README.md`](./validation/README.md) - Validation function patterns
- [Root `README.md`](../../README.md) - Project overview and installation

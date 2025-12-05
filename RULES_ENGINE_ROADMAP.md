# Rules Engine Roadmap

This document outlines the path from the current state to a full, runtime-agnostic rules engine.

## Current State

You have:

- ✅ **Entities**: Well-defined domain models (Game, GameState, Board, Unit, Card, etc.)
- ✅ **Events**: Player choices and game effects with schemas
- ✅ **Validation**: Functions that check if actions are legal
- ✅ **Functions**: Business logic for calculations (movement, facing, etc.)

## What's Missing

To build a full rules engine, you need:

1. **Rule Definitions**: Structured representation of game rules
2. **State Transitions**: Pure functions that apply events to game state
3. **Rules Engine**: Orchestrates rule evaluation and state updates
4. **Rule Composition**: How rules interact and execute in order
5. **Runtime-Agnostic Design**: Pure functions, no side effects, serializable

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Rules Engine                          │
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   Rules      │─────▶│   Engine     │                │
│  │  Registry    │      │  (Executor)  │                │
│  └──────────────┘      └──────────────┘                │
│         │                      │                        │
│         │                      ▼                        │
│         │              ┌──────────────┐                │
│         │              │   State      │                │
│         │              │  Transitions │                │
│         │              └──────────────┘                │
│         │                      │                        │
│         └──────────────────────┼──────────────────────┘
│                                ▼                        │
│                         ┌──────────────┐               │
│                         │  Game State  │               │
│                         └──────────────┘               │
└─────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Core Rule Infrastructure

#### 1.1 Define Rule Types

Create a discriminated union for all rule types:

```typescript
// src/domain/rules/ruleType.ts
export const ruleTypes = [
  'validate',
  'transform',
  'trigger',
  'condition',
] as const;

export type RuleType = (typeof ruleTypes)[number];
```

#### 1.2 Define Base Rule Interface

```typescript
// src/domain/rules/rule.ts
export interface Rule<TContext = unknown> {
  id: string;
  name: string;
  type: RuleType;
  priority?: number; // For ordering
  context?: TContext; // Rule-specific context
}
```

#### 1.3 Define Specific Rule Types

```typescript
// src/domain/rules/validationRule.ts
export interface ValidationRule<TEvent, TState> extends Rule {
  type: 'validate';
  validate: (event: TEvent, state: TState) => boolean;
}

// src/domain/rules/transformationRule.ts
export interface TransformationRule<TEvent, TState> extends Rule {
  type: 'transform';
  transform: (event: TEvent, state: TState) => TState;
}

// src/domain/rules/triggerRule.ts
export interface TriggerRule<TEvent, TState> extends Rule {
  type: 'trigger';
  condition: (event: TEvent, state: TState) => boolean;
  trigger: (event: TEvent, state: TState) => Event[];
}
```

### Phase 2: State Transitions

#### 2.1 Create State Transition Functions

Pure functions that apply events to state:

```typescript
// src/domain/rules/stateTransitions/moveUnitTransition.ts
export function applyMoveUnitEvent(
  event: MoveUnitEvent,
  state: GameState,
): GameState {
  // Immutable update - create new state
  const newBoardState = updateUnitPosition(
    state.boardState,
    event.unit,
    event.from,
    event.to,
  );

  return {
    ...state,
    boardState: newBoardState,
    currentRoundState: {
      ...state.currentRoundState,
      unitsThatMoved: new Set([
        ...state.currentRoundState.unitsThatMoved,
        event.unit,
      ]),
    },
  };
}
```

#### 2.2 Create Transition Registry

Map events to their transition functions:

```typescript
// src/domain/rules/stateTransitions/index.ts
import type { GameState } from '@entities';
import type { Event } from '@events';

export type StateTransition<TEvent extends Event> = (
  event: TEvent,
  state: GameState,
) => GameState;

export const stateTransitions: Map<string, StateTransition<Event>> = new Map([
  ['moveUnit', applyMoveUnitEvent],
  ['chooseCard', applyChooseCardEvent],
  // ... etc
]);
```

### Phase 3: Rules Engine Core

#### 3.1 Create Rules Registry

```typescript
// src/domain/rules/registry.ts
import type { GameState } from '@entities';
import type { Event } from '@events';

export class RulesRegistry {
  private validationRules: ValidationRule<Event, GameState>[] = [];
  private transformationRules: TransformationRule<Event, GameState>[] = [];
  private triggerRules: TriggerRule<Event, GameState>[] = [];

  registerValidation(rule: ValidationRule<Event, GameState>): void {
    this.validationRules.push(rule);
    this.sortByPriority(this.validationRules);
  }

  registerTransformation(rule: TransformationRule<Event, GameState>): void {
    this.transformationRules.push(rule);
    this.sortByPriority(this.transformationRules);
  }

  registerTrigger(rule: TriggerRule<Event, GameState>): void {
    this.triggerRules.push(rule);
    this.sortByPriority(this.triggerRules);
  }

  private sortByPriority<T extends Rule>(rules: T[]): void {
    rules.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  }

  getValidationRules(): ValidationRule<Event, GameState>[] {
    return [...this.validationRules];
  }

  getTransformationRules(): TransformationRule<Event, GameState>[] {
    return [...this.transformationRules];
  }

  getTriggerRules(): TriggerRule<Event, GameState>[] {
    return [...this.triggerRules];
  }
}
```

#### 3.2 Create Rules Engine

```typescript
// src/domain/rules/engine.ts
import type { GameState } from '@entities';
import type { Event } from '@events';
import { RulesRegistry } from './registry';
import { stateTransitions } from './stateTransitions';

export interface RuleExecutionResult {
  success: boolean;
  newState: GameState;
  triggeredEvents: Event[];
  errors: string[];
}

export class RulesEngine {
  constructor(private registry: RulesRegistry) {}

  /**
   * Execute an event against the current game state.
   * This is a pure function - no side effects.
   */
  execute(event: Event, state: GameState): RuleExecutionResult {
    const errors: string[] = [];
    const triggeredEvents: Event[] = [];

    // Step 1: Validate
    const validationRules = this.registry.getValidationRules();
    for (const rule of validationRules) {
      if (!rule.validate(event, state)) {
        errors.push(`Validation failed: ${rule.name}`);
        return {
          success: false,
          newState: state,
          triggeredEvents: [],
          errors,
        };
      }
    }

    // Step 2: Apply state transition
    const transition = stateTransitions.get(getEventType(event));
    if (!transition) {
      errors.push(`No transition found for event type: ${getEventType(event)}`);
      return {
        success: false,
        newState: state,
        triggeredEvents: [],
        errors,
      };
    }

    let newState = transition(event, state);

    // Step 3: Apply transformation rules
    const transformationRules = this.registry.getTransformationRules();
    for (const rule of transformationRules) {
      if (rule.applies?.(event, state) ?? true) {
        newState = rule.transform(event, newState);
      }
    }

    // Step 4: Check trigger rules
    const triggerRules = this.registry.getTriggerRules();
    for (const rule of triggerRules) {
      if (rule.condition(event, newState)) {
        const events = rule.trigger(event, newState);
        triggeredEvents.push(...events);
      }
    }

    return {
      success: true,
      newState,
      triggeredEvents,
      errors: [],
    };
  }

  /**
   * Execute multiple events in sequence.
   */
  executeSequence(
    events: Event[],
    initialState: GameState,
  ): RuleExecutionResult {
    let currentState = initialState;
    const allTriggeredEvents: Event[] = [];
    const allErrors: string[] = [];

    for (const event of events) {
      const result = this.execute(event, currentState);

      if (!result.success) {
        return {
          success: false,
          newState: currentState,
          triggeredEvents: allTriggeredEvents,
          errors: [...allErrors, ...result.errors],
        };
      }

      currentState = result.newState;
      allTriggeredEvents.push(...result.triggeredEvents);
      allErrors.push(...result.errors);
    }

    return {
      success: true,
      newState: currentState,
      triggeredEvents: allTriggeredEvents,
      errors: allErrors,
    };
  }
}
```

### Phase 4: Rule Definitions

#### 4.1 Define Game Rules

```typescript
import { isLegalMove } from '@validation';
// src/domain/rules/gameRules/movementRules.ts
import { RulesRegistry } from '../registry';

export function registerMovementRules(registry: RulesRegistry): void {
  // Validation rule: Unit moves must be legal
  registry.registerValidation({
    id: 'validate-unit-move',
    name: 'Validate Unit Move',
    type: 'validate',
    priority: 1,
    validate: (event, state) => {
      if (
        event.eventType === 'playerChoice' &&
        'unit' in event &&
        'to' in event
      ) {
        return isLegalMove(event as MoveUnitEvent, state.boardState);
      }
      return true; // Not a move event, skip
    },
  });

  // Trigger rule: Moving into enemy space triggers engagement
  registry.registerTrigger({
    id: 'trigger-engagement',
    name: 'Trigger Engagement on Move',
    type: 'trigger',
    priority: 1,
    condition: (event, state) => {
      if (event.eventType === 'playerChoice' && 'to' in event) {
        const moveEvent = event as MoveUnitEvent;
        const space = getBoardSpace(state.boardState, moveEvent.to.coordinate);
        return hasEnemyUnit(space, moveEvent.player);
      }
      return false;
    },
    trigger: (event, state) => {
      const moveEvent = event as MoveUnitEvent;
      // Generate ResolveEngagementEvent
      return [createEngagementEvent(moveEvent, state)];
    },
  });
}
```

### Phase 5: Runtime-Agnostic Design

#### 5.1 Ensure Pure Functions

All functions must be:

- ✅ **Pure**: Same inputs → same outputs
- ✅ **No side effects**: No I/O, no mutations
- ✅ **Serializable**: All data structures can be JSON serialized
- ✅ **Deterministic**: No randomness (or injectable RNG)

#### 5.2 Create Engine Factory

```typescript
// src/domain/rules/createEngine.ts
import { RulesEngine } from './engine';
import { registerCombatRules } from './gameRules/combatRules';
import { registerMovementRules } from './gameRules/movementRules';
import { RulesRegistry } from './registry';
// ... other rule sets

/**
 * Create a fully configured rules engine.
 * This is the main entry point for using the rules engine.
 */
export function createRulesEngine(): RulesEngine {
  const registry = new RulesRegistry();

  // Register all game rules
  registerMovementRules(registry);
  registerCombatRules(registry);
  // ... register other rule sets

  return new RulesEngine(registry);
}
```

### Phase 6: Integration Points

#### 6.1 Event Validation Wrapper

```typescript
// src/domain/rules/validateEvent.ts
import type { GameState } from '@entities';
import type { Event } from '@events';
import { createRulesEngine } from './createEngine';

const engine = createRulesEngine();

export function validateEvent(event: Event, state: GameState): boolean {
  const result = engine.execute(event, state);
  return result.success;
}
```

#### 6.2 State Update Wrapper

```typescript
// src/domain/rules/applyEvent.ts
import type { GameState } from '@entities';
import type { Event } from '@events';
import { createRulesEngine } from './createEngine';

const engine = createRulesEngine();

export function applyEvent(event: Event, state: GameState): GameState {
  const result = engine.execute(event, state);
  if (!result.success) {
    throw new Error(`Event execution failed: ${result.errors.join(', ')}`);
  }
  return result.newState;
}
```

## Implementation Order

1. **Start with State Transitions** (Phase 2)
   - Implement `applyMoveUnitEvent`
   - Implement `applyChooseCardEvent`
   - Create transition registry
   - Write tests for each transition

2. **Build Rules Engine Core** (Phase 3)
   - Create RulesRegistry
   - Create RulesEngine
   - Write tests

3. **Define Rule Infrastructure** (Phase 1)
   - Define rule types and interfaces
   - Follow schema-first pattern

4. **Implement Game Rules** (Phase 4)
   - Start with movement rules
   - Add combat rules
   - Add card rules
   - Test each rule set

5. **Ensure Runtime-Agnostic** (Phase 5)
   - Review all functions for purity
   - Remove any Node/browser-specific code
   - Add serialization tests

6. **Integration** (Phase 6)
   - Create public API
   - Add integration tests
   - Document usage

## Testing Strategy

### Unit Tests

- Each state transition function
- Each rule (validation, transformation, trigger)
- Rules engine execution

### Integration Tests

- Full event sequences
- Rule interactions
- State consistency

### Property Tests

- State immutability
- Determinism
- Serialization round-trips

## Key Principles

1. **Immutability**: Always return new state, never mutate
2. **Pure Functions**: No side effects, deterministic
3. **Type Safety**: Leverage TypeScript for compile-time safety
4. **Schema-First**: Follow existing pattern for all new entities
5. **Testability**: Every function should be easily testable
6. **Composability**: Rules should be composable and reusable

## Example Usage

```typescript
import { createRulesEngine } from '@rules';
import type { GameState, MoveUnitEvent } from '@domain';

const engine = createRulesEngine();
const initialState: GameState = /* ... */;
const moveEvent: MoveUnitEvent = /* ... */;

const result = engine.execute(moveEvent, initialState);

if (result.success) {
  const newState = result.newState;
  // Handle triggered events
  for (const triggeredEvent of result.triggeredEvents) {
    const nextResult = engine.execute(triggeredEvent, newState);
    // ... continue processing
  }
} else {
  console.error('Event failed:', result.errors);
}
```

## Next Steps

1. Review this roadmap
2. Start with Phase 2 (State Transitions) - most foundational
3. Implement incrementally with tests
4. Refine as you discover edge cases

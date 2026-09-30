# Events

Import as `@events`.

Schema-first definitions of what can happen. `playerChoices/` is a player's act. `gameEffects/` is a fact the game records. See [`gameEffects/README.md`](./gameEffects/README.md).

No behavior in this package. Applying an event is `@transforms`. Deciding which event comes next is `@expected`.

Declarations follow the schema-first pattern in [`entities`](../entities/README.md). Each event is a discriminated union: `eventType`, then `choiceType` or `effectType`.

## Player choices (`playerChoices/`)

A player's act:

- `ChooseCardEvent` selects a command card
- `IssueCommandEvent` issues a command to units
- `MoveUnitEvent` moves a unit
- `MoveCommanderEvent` moves a commander
- `CommitToMeleeEvent` commits a card to melee
- `CommitToMovementEvent` commits a card to a unit's movement
- `CommitToRangedAttackEvent` commits a card to a ranged attack
- `PerformRangedAttackEvent` performs a ranged attack
- `ChooseMeleeResolutionEvent` chooses which melee to resolve
- `ChooseRallyEvent` chooses whether to rally
- `SetupUnitsEvent` places units on the board

## Game effects (`gameEffects/`)

A fact the game records. Topic folders match `procedures/` and `transforms/stateTransitions/applyEffects/`. See [`gameEffects/README.md`](./gameEffects/README.md).

- `ResolveEngagementEvent`
- `ResolveMeleeEvent`
- `ResolveRangedAttackEvent`
- `ResolveInitiativeEvent`
- `ResolveRetreatEvent`
- `ResolveRoutEvent`
- `ResolveReverseEvent`
- `ResolveRallyEvent`
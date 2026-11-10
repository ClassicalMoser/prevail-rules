# Events

Import as `@events`.

Schema-first definitions of what can happen. `playerChoices/` is a player's act. `gameEffects/` is a fact the game records. See [`gameEffects/README.md`](./gameEffects/README.md).

No behavior in this package. Applying an event is `@transforms`. Deciding which event comes next is `@expected`.

Declarations follow the schema-first pattern in [`entities`](../entities/README.md). Each event is a discriminated union: `eventType`, then `choiceType` or `effectType`.

## Player choices (`playerChoices/`)

A player's act:

- `ChooseCardEvent` selects a command card
- `IssueCommandEvent` issues a command to units
- `ChooseMovingUnitEvent` names the next unit a Move order moves
- `CommitToMovementEvent` commits a card to that unit's movement, before it moves
- `MoveUnitEvent` writes that unit's move, as a path
- `MoveCommanderEvent` moves a commander
- `CommitToMeleeEvent` commits a card to melee
- `ChooseShooterEvent` names the next unit a Shoot order shoots with
- `CommitToRangedAttackEvent` commits the shooter's one card to the whole shot, before it aims
- `PerformRangedAttackEvent` names the shot's target and supporters
- `CommitToRangedDefenseEvent` commits a card for the shot's target, once it is named
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

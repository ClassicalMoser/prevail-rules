# Events

Import as `@events`.

Schema-first definitions of what can happen. `playerChoices/` is a player's act. `gameEffects/` is a fact the game records. See [`gameEffects/README.md`](./gameEffects/README.md).

No behavior in this package. Applying an event is `@transforms`. Deciding which event comes next is `@expected`.

Declarations follow the schema-first pattern in [`entities`](../entities/README.md). Each event is a discriminated union: `eventType`, then `choiceType` or `effectType`.

## Player choices (`playerChoices/`)

A player's act:

- `ChooseCardEvent` selects a command card
- `IssueCommandEvent` issues a command to units, or to a line named by its two ends
- `DoneIssuingCommandsEvent` stops issuing, forfeiting the orders left
- `ChooseMovingUnitEvent` names the next unit a Move order moves
- `CommitToMovementEvent` commits a card to that unit's movement, before it moves
- `ChooseWhetherToRetreatEvent` decides whether a front-engaged defender falls back
- `ChooseRetreatOptionEvent` chooses among equally small retreats
- `MoveUnitEvent` writes that unit's move, as a path
- `MoveCommanderEvent` moves a commander
- `CommitToMeleeEvent` commits a card to melee
- `ChooseShooterEvent` names the next unit a Shoot order shoots with
- `CommitToRangedAttackEvent` commits the shooter's one card to the whole shot, before it aims
- `PerformRangedAttackEvent` names the shot's target and supporters
- `CommitToRangedDefenseEvent` commits a card for the shot's target, once it is named
- `ChooseMeleeResolutionEvent` chooses which melee to resolve
- `ChooseRoutDiscardEvent` chooses the cards that pay for a rout
- `ChooseRallyEvent` chooses whether to rally
- `AssignUnitSupportEvent` gives each unit a place under the unit support a rally's hand holds
- `SetupUnitsEvent` places units on the board

## Game effects (`gameEffects/`)

A fact the game records. Topic folders match `procedures/` and `transforms/stateTransitions/applyEffects/`. See [`gameEffects/README.md`](./gameEffects/README.md).

- `StartEngagementEvent`, `ResolveEngageRetreatOptionEvent`, `OpenRetreatFromEngagementEvent` and `ResolveFlankEngagementEvent` carry a move into an engagement
- `ResolveMeleeEvent`
- `ResolveRangedAttackEvent`
- `ResolveInitiativeEvent`
- `ResolveRetreatEvent`
- `ResolveRoutEvent`
- `ResolveReverseEvent`
- `ResolveRallyEvent`

# applyEffects conventions

Handlers in this folder apply **game effect events** to `GameState`. They are routed by [`applyGameEffectEvent`](../applyGameEffectEvent.ts).

**Event shapes** live under [`events/gameEffects/`](../../../events/gameEffects/) with the **same subfolder names** as this package (`cards/`, `sequencing/`, `defenseResult/`, `movement/`, `resolveAttack/`). Each per-effect module documents _why_ fields exist (procedure-derived snapshots, subtree tags, etc.). Start from [`gameEffect.ts`](../../../events/gameEffects/gameEffect.ts) for the full discriminated union.

## Folder layout

Each subfolder has a small `index.ts` barrel; the **only** supported entry for the rest of the domain is the root [`index.ts`](./index.ts) (what `applyGameEffectEvent` imports). Avoid deep imports from outside this package.

| Folder                               | Responsibility                                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| [`cards/`](./cards/)                 | Discard / reveal played cards, resolve initiative, rally, unit-support consequences                  |
| [`sequencing/`](./sequencing/)       | Phase-completion effects (cleanup, issue commands, move commanders, play cards, resolve melee phase) |
| [`defenseResult/`](./defenseResult/) | Retreat, reverse, rout, trigger rout from retreat                                                    |
| [`movement/`](./movement/)           | Complete unit movement, start engagement, flank engagement, engage-retreat option                    |
| [`resolveAttack/`](./resolveAttack/) | Resolve melee / ranged attack, complete attack-apply and related command-resolution completes        |

`cards/applyUnitsLostSupportAfterRally` is not an effect apply: its one caller is the player choice `applyAssignUnitSupportEvent`, which imports it past the `cards/` barrel. A mark in the file says where it might go instead.

**Procedures** use the same subfolder names under [`procedures/`](../../../procedures/README.md) (`generate*` ↔ `apply*`). **Event types** use the same names under [`events/gameEffects/`](../../../events/gameEffects/).

Co-locate each handler with its `*.test.ts` in the same folder.

## Trust model

- **Procedure + log**: The expected engine decides which effect is owed. The procedure measures or draws what the event records, and does not validate the state (`src/domain/procedures/`). Replayed events are trusted.
- **Apply** maps **event payload + current state** to the next state. Avoid duplicating rule checks that the procedure already enforced.

## Throws

- **Allowed**: Throws from **narrowing helpers** (`getPlayCardsPhaseState`, `getIssueCommandsPhaseState`, `getCurrentPhaseState`, `getRangedAttackApplyState`, `getMeleeAttackApplyState`, `getFrontEngagementStateFromMovement`, `getFlankEngagementStateFromMovement`, `getRallyResolutionStateAwaitingBurn`, `getRallyResolutionStateAwaitingUnitSupport`, etc.). These are type guards, not business validation.
- **Avoid**: Defensive throws that only restate rules (“wrong engagement type”, “already resolved”, “wrong phase”) unless they remain as narrowing until payloads replace phase branching.

## TypeScript

- **No** `as` or non-null `!` in apply handlers. If the type system leaves a value optional, fix via **event fields** or a **throwing query** that narrows.

## Code structure (handlers)

- Prefer **`updatePhaseState`**, **`updateRoundState`**, the piece writers (**`deployUnit`**, **`moveUnitOnBoard`**, **`moveUnitIntoEngagement`**, **`routUnit`**, **`deployCommander`**, **`moveCommanderOnBoard`**, **`defeatCommander`**, which change the board and the index together), **`updatePlayerCards`** and **`replaceCardState`** (cards), **`updateCommandResolutionState`** (when replacing the active command resolution subtree), **`updateCurrentInitiative`**, and other **pure transforms** over hand-rolled top-level or nested spreads.
- Prefer **`@queries`** shared with procedures over re-implementing lookups in apply.

## Events

- An apply reads only where the game is, which slot it writes, and what the state holds by identity (where a named unit stands). Anything a rule decides (legality, line membership, whether a move enters an enemy, stats, thresholds, dice) belongs in **`generate*`** and on the **event** (Zod + `AssertExact` next to the manual type), or, for a player choice, on the choice where validation checks it.
- An apply moves the game to the step its effect leaves it on. That changes where the game is now, not what it owes next.
- An apply does not decide what is owed after it. Whether units or orders are left, and what a closed rout closes, are the expected engine's to ask for.
- Which slot an effect writes to is the state's to say when the state already names it: an apply asks a `@queries` reader (`getRetreatAwaitingRout`, `getAttackApplyToClose`, `findRoutLocation`) rather than reading a context field off the event, so the event and the state cannot disagree.
- Examples: `OpenRetreatFromAttackApplyEvent.retreatPaths` (what is legal), `ResolveMeleeEvent`'s attack results (a measurement), `ResolveRallyEvent`'s burnt card (a random draw).

## Tests

- One `*.test.ts` per handler; use `as unknown as Event` **only in tests** for exhaustiveness branches.

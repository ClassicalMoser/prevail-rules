# Sequence Substeps

Declaration-only nested states used inside phase steps. Import via `@game` (or `@game/substeps`). Queries and expected-event helpers live under `@queries` / `@expected`, not here.

## Layout

```
substeps/
  commandResolution/   # issueCommands command loop
  meleeResolution/     # resolveMelee
  rallyResolution/     # cleanup
  combatOutcomes/      # attack result, attack apply, retreat, rout, reverse
  engagement/          # movement collision (flank / front / rear)
```

## Hierarchy

```
Round
  └─ Phase (e.g. playCards, issueCommands, resolveMelee, cleanup)
      └─ Step (e.g. firstPlayerResolveCommands, resolveMelee, …)
          └─ Phase-owned resolution root (movement, ranged, melee, rally)
              └─ Shared outcome / engagement slices (attack apply, retreat, rout, …)
```

## By role

### Command resolution (`commandResolution/`)

Active command loop under `issueCommands`. `CommandResolutionState` is the union hanging on the phase; the two members are the concrete roots.

| State                         | Role                                  |
| ----------------------------- | ------------------------------------- |
| `CommandResolutionState`      | Union: movement \| ranged attack      |
| `MovementResolutionState`     | Unit move; may nest `EngagementState` |
| `RangedAttackResolutionState` | A shot; nests `AttackApplyState`      |

### Melee resolution (`meleeResolution/`)

| State                  | Role                                            |
| ---------------------- | ----------------------------------------------- |
| `MeleeResolutionState` | One melee; nests an `AttackApplyState` per side |

Both units strike at once and their applies resolve one at a time. The two
commitments are named for the order they are made in, and the two applies for
whose unit holds the result — `firstPlayer…` / `secondPlayer…`, as the phase
steps already are. The first player's blow lands first (§7.5.6), so the applies
resolve second player's unit first: the reverse of the slot names, written once
in `getMeleeAppliesInResolutionOrder`. Which colour holds the initiative is a
rule of the version being played; who owns an apply is read from its
`defendingUnit`.

### Rally (`rallyResolution/`)

| State                  | Role                                           |
| ---------------------- | ---------------------------------------------- |
| `RallyResolutionState` | Post-rally support check; may nest `RoutState` |

### Shared combat outcomes (`combatOutcomes/`)

Reusable under more than one parent (attack apply, retreat, engagement, rally). The `AttackResult` an apply carries is an entity in `@entities`, since the `resolveMelee` and `resolveRangedAttack` events carry it too.

| State              | Parents                                       | Nested                                      |
| ------------------ | --------------------------------------------- | ------------------------------------------- |
| `AttackApplyState` | ranged / melee resolution                     | `ReverseState`, `RetreatState`, `RoutState` |
| `RetreatState`     | attack apply, front engagement                | optional `RoutState`                        |
| `RoutState`        | attack apply, retreat, rear engagement, rally | —                                           |
| `ReverseState`     | attack apply                                  | —                                           |

A rout has four parent states, and the one that gets forgotten is the retreat:
a defender with nowhere to go routs from inside its own retreat slice. Those
four are five places to descend, because an attack apply sits on a ranged attack
and on each side of a melee. Anything that has to _locate_ a rout rather than
arriving at its parent reads `findRoutLocation`, which walks all five and says
which parent it found.

### Engagement (`engagement/`)

Collision when a move contacts an enemy. Container plus per-angle resolution:

| State                            | Role                                                    |
| -------------------------------- | ------------------------------------------------------- |
| `EngagementState`                | Container (`engagingUnit`, target, `completed`)         |
| `EngagementResolutionState`      | Union: flank \| front \| rear                           |
| `FlankEngagementResolutionState` | Rotate defender                                         |
| `FrontEngagementResolutionState` | Commit → can-retreat → choose → optional `RetreatState` |
| `RearEngagementResolutionState`  | Forced `RoutState`                                      |

## Retreat → rout nesting

`RetreatState` may hold a nested `RoutState` (composition, not recursion). No legal retreats (or a retreat that becomes a rout) seeds `routState` under the retreat slice; parent completion waits on the nested `completed` flag.

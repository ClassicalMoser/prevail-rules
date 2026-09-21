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
| `RangedAttackResolutionState` | Ranged fire; nests `AttackApplyState` |

### Melee resolution (`meleeResolution/`)

| State                  | Role                                         |
| ---------------------- | -------------------------------------------- |
| `MeleeResolutionState` | One melee; nests per-side `AttackApplyState` |

### Rally (`rallyResolution/`)

| State                  | Role                                           |
| ---------------------- | ---------------------------------------------- |
| `RallyResolutionState` | Post-rally support check; may nest `RoutState` |

### Shared combat outcomes (`combatOutcomes/`)

Reusable under more than one parent (attack apply, engagement, rally):

| State              | Parents                         | Nested                                      |
| ------------------ | ------------------------------- | ------------------------------------------- |
| `AttackResult`     | carried on attack apply         | —                                           |
| `AttackApplyState` | ranged / melee resolution       | `ReverseState`, `RetreatState`, `RoutState` |
| `RetreatState`     | attack apply, front engagement  | optional `RoutState`                        |
| `RoutState`        | retreat, rear engagement, rally | —                                           |
| `ReverseState`     | attack apply                    | —                                           |

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

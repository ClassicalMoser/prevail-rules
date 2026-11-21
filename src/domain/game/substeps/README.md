# Sequence Substeps

The states nested inside a phase step while something is being resolved. Each
is declared beside its schema; the readers are in `@queries` and `@expected`.

```
issueCommands  MovementResolutionState ─ EngagementState ─ front: RetreatState ─ RoutState
                                                         └ rear:  RoutState
               RangedAttackResolutionState ─ AttackApplyState
resolveMelee   MeleeResolutionState ─ AttackApplyState (one per unit)
cleanup        RallyResolutionState ─ RoutState

AttackApplyState ─ RetreatState ─ RoutState
                 ├ ReverseState
                 └ RoutState
```

A nested slot reads `'pending'` until its step is reached, `'bypassed'` when
the rules will never apply it, or the open substep.

A rout can sit under an attack apply, a retreat, a rear engagement or a rally;
anything that has to find one reads `findRoutLocation`.

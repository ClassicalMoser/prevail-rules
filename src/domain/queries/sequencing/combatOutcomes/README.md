# Combat outcome queries

An attack, an engagement, or a rally can end with a unit routed, retreated, or
reversed. Each of those is a substep stored on whichever parent caused it, and
the queries here reach them.

## Which parent holds what

| Substep            | Parents                                                                   |
| ------------------ | ------------------------------------------------------------------------- |
| `AttackApplyState` | the ranged attack resolution; either side of a melee resolution           |
| `RetreatState`     | an attack-apply; a front engagement the defender gave ground to           |
| `ReverseState`     | an attack-apply, and nothing else                                         |
| `RoutState`        | an attack-apply; a rear engagement; a rally; a retreat with nowhere to go |

The parent is part of the answer. A rout reached through a rear engagement is a
different fact about the game than a rout reached through a rally, even though
both return a `RoutState`, so each pair gets its own getter and the name says
which pair it is. That is why there is no single `getRoutState(state, parent)`.

The retreat-held rout has no getter. `getExpectedRetreatEvent` reads
`retreatState.routState` directly, because it needs to tell a rout that has not
opened yet from one that will never open, and a getter that throws cannot say
which it found.

## Routes and selections

Each substep's index lists its queries in two groups, and the distinction is
worth keeping when adding one.

A **route** descends to a named parent and reads its slot. It encodes position
and nothing else: `getRoutStateFromRally` knows where a rally keeps its rout.

A **selection** decides which of several candidates to answer about, and that
decision is a rule of the game. `getRoutStateFromMeleeResolutionByInitiative`
resolves the initiative player's side first because the rules say so;
`getRetreatStateReadyForResolveFromMelee` knows which retreats are waiting on a
move rather than a choice. These are the queries that carry gameplay, and they
are the ones to read first when the sequencing is unclear.

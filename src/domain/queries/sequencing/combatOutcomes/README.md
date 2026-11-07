# Combat outcome queries

An attack, an engagement or a rally can end with a unit routed, retreated or
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
both return a `RoutState`, so each pair gets its own query and the name says
which pair it is.

The retreat-held rout has no query of its own. `getExpectedRetreatEvent` reads
`retreatState.routState` directly, because it needs to tell a rout that has not
opened from one that will never open, and a getter that throws cannot say which
it found.

## Four kinds, and how to tell them apart

Every name here is one of four shapes. Adding a query means choosing one.

**A parent reader takes the parent and says `From`.**
`getRetreatStateFromAttackApply`, `getRoutStateFromRally`. The parent is the
argument, so there is no descent and no phase to consider. These are the only
queries that answer `'bypassed'`: the rules apply no such step to this attack,
which is a fact the caller can use. They throw only when the step is due and
has not been opened, because asking then is out of sequence.

**A scoped getter descends from the game state and leads with its context.**
`getMeleeRetreatState`, `getRangedAttackRoutState`. The caller already knows
where it is — usually because an event told it — and wants the substep there.
These throw when the context does not hold what they name.

**A selection picks among candidates by a rule of the game, and says `Next`.**
`getNextMeleeRoutState` resolves the initiative player's side first because the
rules say so. `getNextMeleeRetreatStateAwaitingMove` knows which retreats are
waiting on a move rather than a choice. These are the queries that carry
gameplay rather than position, and they are the ones to read first when the
sequencing is unclear. A selection with no candidate to pick takes the `find`
prefix and answers `undefined`, like `findNextMeleeDefendingPlayer`.

**A router walks every context and answers.** `findRoutState` and
`findRetreatState` return `undefined` when nothing is routing or retreating,
because most of a game has neither and asking is fair. `getRoutState` and
`getRetreatState` are the same walk for a caller that knows there must be one,
and throw when there is not.

`find` and `get` are not a fifth kind. They are a separate axis — whether the
query is total — and it crosses all four: `findNextMeleeDefendingPlayer` is a
selection, not a router. Absence is `undefined`, which is what
[`DESIGN.md`](../../../../../DESIGN.md) asks of a query. `null` is left to mean
something, as it does in the endgame check, where it is a draw.

A router reads each slot's own sentinel rather than calling the scoped getters,
so it needs no `try`. That duplicates a little descent knowledge against the
scoped getters, which is the price of one query that answers and one that
insists.

## Conditions are predicates, not getters

`isAwaitingRoutDiscard` takes a rout and answers whether its owner still owes
cards. It does not take a game state and it does not find anything.

A getter that also filtered used to live here, and every caller unwound it: one
re-checked the condition it had already applied, one turned its absent answer
straight back into a throw, and the endgame check kept a list of error message strings to
work out which throws meant absence. Keep the walk and the question apart.

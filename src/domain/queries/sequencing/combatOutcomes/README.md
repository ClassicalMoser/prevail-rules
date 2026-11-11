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

`getExpectedRetreatEvent` still reads `retreatState.routState` directly, because
it needs to tell a rout that has not opened from one that will never open, and a
getter that throws cannot say which it found. It descends the substep tree and
arrives holding the parent, so it has no need to look for one.

Everything else has to _locate_ a rout: legality to enumerate the discard, the
`resolveRout` procedure to work out the penalty, the endgame check to see whether
it can be paid. Each of those used to walk to it on its own, each walk knew four
parents instead of five, and a retreat with nowhere to go therefore opened a rout
that nothing downstream could resolve. They all read `findRoutLocation` now.

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

**A selection picks among candidates by a rule of the game.** `getNextMeleeRoutState`
resolves the second player's unit first, because that unit routs first (§7.5.6).
`findRoutOwingDiscard` picks the side that still owes cards;
`findRoutAwaitingPenalty` picks the rout `resolveRout` is due for. Both ask the
initiative player's side first, which settles a tie that never arises: the
sequencer owns the order of routs and opens them one at a time, so at most one
rout is ever awaiting;
`findRetreatAwaitingMove` and `findRetreatAwaitingRout` pick the retreat
`resolveRetreat` or `triggerRoutFromRetreat` is due for, asking after the units
in the order they suffer (§7.5.6). These are the
queries that carry gameplay rather than position, and they are the ones to read
first when the sequencing is unclear. A selection with no candidate to pick takes
the `find` prefix and answers `undefined`, like `findNextMeleeDefendingPlayer`.

A selection applies its question _while_ it walks, not after. A melee strikes
both units at once and settles their routs one side at a time, so the side that
has already paid still holds its rout: a walk that answered with the first rout
it found would answer about the wrong player while the other side still owed
cards. That is the bug the split below is careful about.

**A router walks every context and answers.** `findRoutLocation` answers with
the rout and the parent accountable for it; `findRoutState` is the same answer
without the parent, for the callers that do not need it. `findRetreatLocation`
and `findRetreatState` are the same pair for retreats: finishing a retreat has
to know whether a front engagement holds it, since that engagement then closes
with no melee (§6.3.2). All of them take the player, because a rout or a
retreat belongs to the one who pays for it and a melee holds one per side, so
asking without naming a player has no answer there. `getRoutState` and
`getRetreatState` are the same walk for a caller that knows there must be one,
and throw when there is not.

`find` and `get` are not a fifth kind. They are a separate axis — whether the
query is total — and it crosses all four: `findNextMeleeDefendingPlayer` is a
selection, not a router. Absence is `undefined`, which is what
[`DESIGN.md`](../../../../../DESIGN.md) asks of a query. `null` is left to mean
something, as it does in the options router, where it is "nothing is owed a
choice".

A router reads each slot's own sentinel rather than calling the scoped getters,
so it needs no `try`. That duplicates a little descent knowledge against the
scoped getters, which is the price of one query that answers and one that
insists.

A procedure is never told where it is: no event has arrived yet to say. So a
procedure reads a selection, and the event it builds names the parent, which is
what lets the transform that applies it use a scoped getter. A procedure that
tried scoped getters one after another and caught the misses was guessing at the
parent, and its guess was right only while the slots happened to open one at a
time.

Being total is what makes a router shareable. A scoped getter can only be called
by someone who already knows where they are, and a parent reader only by someone
holding the parent; neither can serve three layers that each arrive with
different context. A query that walks everywhere and tolerates absence can, and
that is why the four copies of this walk became one.

## Conditions are predicates, not getters

`isAwaitingRoutDiscard` takes a rout and answers whether its owner still owes
cards. It does not take a game state and it does not find anything.

A getter that also filtered used to live here, and every caller unwound it: one
re-checked the condition it had already applied, one turned its absent answer
straight back into a throw, and the endgame check kept a list of error message
strings to work out which throws meant absence. Keep the walk and the question
apart — and where a caller really does want both, as the discard legality and the
endgame check both want "the rout owing cards", give that pairing its own
selection rather than letting each caller filter a walk for itself.

# Current state — 2026-11-11

Where `prevail-rules` stands at `bde4cb3`. It is the input to the
correct-and-comply pass before the scout-then-read audit restarts, and it
replaces the assessment of 2026-11-10, which is in version control. What was
still open there is carried in Section 5; everything else there is closed.

The findings come from a read-only sweep: one reviewer per layer group in
dependency order, and one reading RULEBOOK Part II against the engine end to
end. A finding marked **verified** was checked against the code a second time
before it was written here. **Traced** means a reviewer followed it through
the code and nobody has re-checked it. **Plausible** means the code is as
described but whether it matters is not settled. Where two or more reviewers
found the same thing independently, the entry says so.

Out of scope, as before: terrain, elevation, line of sight, hidden units and
setup (RULEBOOK appendix A3, A5, A16, A17, A18, B6). Nothing in this file is
a style finding.

The gate at `bde4cb3`: `pnpm validate` clean, 445 spec files, 2283 specs
passing. Two reviewers saw one run-level error at the end of `pnpm test` while
several runs overlapped; a single run is clean. Not yet explained.

---

## Decided, and the work order (author, 2026-11-11)

Decisions made while reading this document. The work order below is complete
enough to run without the author present. Anything not listed is not decided.

| Item | Decision                                                                                                                                                                                                                                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1   | A unit on an event is identity only. One pure transform lifts a unit and sets it down at its new placement, and all six sites call it. The three Phase 3 applies read the unit from the board.                                                                                                       |
| E2   | `getLegalMoveUnits` and `getLegalRangedAttackers` read `inPlay` directly. The hand-visibility gate goes, because the in-play card is public (§4.1.2).                                                                                                                                                |
| E3   | A round's log ends with its own last event. `completeCleanupPhase` is appended before the reset; the new round's log starts empty. The application's filing under the old round already agrees.                                                                                                      |
| E4   | `modifierTypes` is dropped from the four `commitTo*` events, together with the four copies of `sameModifierTypes`. Legality and validation work from the card and the moment's accepted stats.                                                                                                       |
| E5   | The melee order enumerator answers an empty offer and checks that a melee is under way (ENGINES, enumerator contract).                                                                                                                                                                               |
| E6   | `processEvent` applies first, then stores the event. A failed save after a good apply is a refusal and leaves both unchanged.                                                                                                                                                                        |
| E7   | A finished game is not a fault. `advanceEffects` and `validateExpectedChoice` use `findExpectedEvent`; a late choice is refused with its own reason.                                                                                                                                                 |
| R1   | Yes: a front-engaged defender's committed card counts toward the retreat it is weighing. `getLegalRetreats` takes the commitment modifiers, both procedures pass them, and RULEBOOK §9.1.3 gets a clause saying so.                                                                                  |
| R2   | Closed, no change. The engager waits on its start space until the engagement is set up. A unit that starts behind its target engages from behind, a rear engagement that routs the defender (§6.3.3), and has very good reason to; the case that worried the sweep is one a player would not choose. |
| R3   | Only issue-or-stop changes: `ExpectedEventInfo` names both accepted choices, so validation and the options router stop re-deriving it. The other three stay as they are. Committing a few closely related consecutive choices in one event is acceptable and gives the client more flexibility.      |
| R4   | Done. A choice too large to list whole is offered a part at a time (`OpenChoice`, `findRefusal`), and the validator only walks the offers: moves, unit support, units orders. Lines are listed whole. See the run logs.                                                                              |
| R5   | The selections stay as they are. The sequencer owns the order of routs and opens them one at a time, so the selections' first-player-first order never has two candidates to choose between. The README sentence and the `findRoutOwingDiscard` JSDoc are corrected to say that.                     |
| R6   | Repo-wide: every total reader is `find*` and every `get*` insists. The `get*` readers that return `undefined` are renamed.                                                                                                                                                                           |

**No longer hands off.** The writer question was settled by the author's layer
principles (third pass), R4 is done, and `submittedTime` is dropped: it is
explicitly after the audit. The other three R3 shapes (`commitToMovement`,
`performRangedAttack`, `moveUnit`) stay as they are by the author's ruling.

**Work order.** One kind of change per commit, a failing spec first and its
own commit for each fix (AUDIT_PROCESS), then the fix. Run `pnpm validate` and
`pnpm test` before each commit and stop at the first failure, naming the
assertion. Specs follow STYLE: a title that states the rule in the game's
terms, a comment on each step, literal expected values, setup from factories,
transforms and `@testing`. Do not remove or rewrite an existing comment. No
more than ten agents in total. Before adding any helper, search the whole
package for it (queries, utils, factories, testing); group split modules in
sub-folders; one primary export per file.

1. E3, then E4, then E7, then E6, then E5: each is small and independent.
2. E2, with a spec that folds a two-shooter order on a seat's projection and
   compares it with `projectGameStateForVisibility`.
3. E1: the failing spec (a forged unit is not kept), the move-unit transform
   with its own spec, the six callers, then the three reads from the board.
4. R1: the failing spec (a defender whose only retreat needs one more
   Flexibility, committing Flexibility), `getLegalRetreats`, the two
   procedures, then the §9.1.3 clause in RULEBOOK. Add no appendix entry.
5. R3, issue-or-stop: `ExpectedEventInfo` names both accepted choices. Use the
   smallest shape that does it, then remove the hand-written acceptance in
   `validateExpectedChoice` and the constant in `getLegalPlayerChoiceOptions`.
6. R5: correct the combatOutcomes README sentence and the `findRoutOwingDiscard`
   JSDoc to say the sequencer owns the order and opens one rout at a time.
   Comments only; keep the author's reasoning (initiative decides a tie, and
   the explicit sequence means there is none).
7. The missing readers of 3.1, each in `@queries` and written to the reader
   model in `queries/sequencing/combatOutcomes/README.md` and the queries
   README: a `find*` is total and answers `undefined`, a `get*` insists. For
   each, add the reader with its own spec, then move the callers onto it, in a
   separate commit.
   - The acting player's remaining units and orders in Phase 3. Readers only.
     The writes stay hand-picked until the writer question is settled.
   - `find*` twins for the command resolution under way (movement, ranged
     attack, front engagement, melee), so the six enumerators stop walking it
     by hand. Where `@legality` and `@expected` write the same sequencing (the
     melee commit order, the front-engagement gates), add one selection in
     `@queries` that both call.
   - Whose rally it is: route the hand-written derivations through
     `getRallyingPlayer`. Leave the three callerless readers in place and
     marked; where two copies disagree (`discardPlayedCards`, `complete`),
     record it and stop.
   - `findRetreatAwaitingChoice`, in the order its siblings ask
     (second player first).
8. R6: rename each `get*` that returns `undefined` to a `find*`, add a `get*`
   twin only where a caller needs one that insists, update the callers, specs
   and both READMEs (the root README's `getForwardSpace` example included).
   List every `get*` that returns `undefined` by search first, not only the ones
   named in 3.4. One rename family per commit.
9. Update this file: move each finished item out of Sections 1 to 3 with the
   commit that closed it named in words, not by hash.

Anything that needs a game-rule or design choice not listed above stops the
run for the author. It is written down here and not guessed.

**Run log (2026-11-11, first pass).** Closed, each with a failing spec first:

- E1: `chooseMovingUnit`, `chooseShooter` and `performRangedAttack` store the
  unit, and the supporters, the board holds. `getUnitWithPlacementOnBoard`
  reads it; `moveUnitOnBoard` is the one transform that lifts a unit and sets
  it down, and the six sites call it.
- E2: a seat reads an opponent's order from the card in play.
- E3: the event that ends a round is not logged in the next one.
- E4: `modifierTypes` is gone from the four `commitTo*` events.
- E5: no melee order is offered while a melee is under way.
- E6: `processEvent` applies first, then records.
- E7: `advanceEffects` and `validateExpectedChoice` use `findExpectedEvent`.
- R1: the defender's committed card counts toward its retreat; RULEBOOK
  §9.1.3 says so.
- R3: `ExpectedEventInfo` names `alsoAccepted` for issue-or-stop.
- R5: the README and two JSDoc blocks say the sequencer owns the order.
- The missing readers of 3.1, except the three left there.
- R6, applied to `@queries`: eleven readers renamed to `find*`, in three
  families, and the queries README states the contract.

**Run log (2026-11-11, second pass).** The author's principle: no
belt-and-suspenders. When one layer owns a gate, a function asked outside it
throws with a clear message; a soft second guard (`[]`, `null`, `undefined`)
hides a failure in the first. Validation still never throws to its caller:
the legality function throws on-site and `validatePlayerChoice` catches at the
entry point. ENGINES' "an enumerator that finds no options answers with an
empty offer" means a fair question with nothing to offer, not a question that
should not have been asked. Closed, each with a failing spec first:

- E5, reversed in part: `getLegalChooseMeleeResolutionEvents` throws when
  asked mid-melee, as it already did when no engagements remain. The expected
  engine owns both gates.
- `getLegalDoneIssuingCommandsEvents`, `getLegalIssueCommands` and
  `getLegalShooterTargets` throw where they answered `null` for "not
  expected". The validators' "not expected in the current state" refusals and
  the options router's empty fallbacks for them are gone, and the router's
  `performRangedAttack` shooter is no longer nullable.
- `findMoveEnding`, `findLegalMoveDeltas` and
  `findExpectedAttackApplyStageEvent` (formerly `get*`): their `undefined` is
  a real answer, so they follow the find/get naming.
- The four enumerators whose `null` meant two things
  (`getLegalMoveUnits`, `getLegalRangedAttackers`, `getLegalRoutDiscardCards`,
  `getLegalAssignUnitSupport`): out of turn throws; nobody able to move or
  shoot is an empty list, which the expected engine and the `complete*Command`
  transforms read as the end of the order; a hand the seat cannot see is an
  empty offer, as `findOwnedPlayerCardState` documents. One transform spec
  had put a movement card in play for a ranged order, which `null` had hidden.
- The rest of the soft-empty list: `getLegalChooseCardOptions`,
  `getLegalChooseRetreatOptionEvents`, `getLegalChooseWhetherToRetreatEvents`
  and the four `getLegalCommitTo*` enumerators throw out of turn. A seat that
  has already chosen, a spectator, and a hidden hand stay real empty answers.
  `moveCommander` (a defeated commander is off the board, §4.2.8) and
  `setupUnits` (setup is out of scope) are unchanged. ENGINES says which empty
  answers are real.

**Run log (2026-11-11, third pass).** The author's principles, which settle most
layer questions without asking: only a query walks the tree; only a transform
mutates state; event applies compose and delegate; inlining a block is wrong,
and wrong twice when it is inlined elsewhere. Closed, each with a failing spec
first where a behaviour changed:

- The `TODO(wrong)` in `applyCompleteUnitMovementEvent`: it asks
  `findPositionOfUnit`, and a mover on neither space throws.
- `getCardInPlay` and `findCardInPlay` replace eight inline reads of the card
  in play. A missing card throws where the commander-moves procedure read it
  as "no orders" and the expected engine read it as "Move".
- Whose rally a step is on is read once (`findRallyingPlayer`,
  `findRallyResolutionState`) and written once (`updateRallyResolutionState`,
  `updateCleanupStep`). `getRallyStepRoutState` and
  `getIsFirstPlayerForResolveRallyStep` are gone, and past the rallies no stale
  rally rout is located.
- A front engagement's stage is read once (`getFrontEngagementStage`), and the
  sequencer and both legal enumerators dispatch on it.
- Phase 3 is written through one transform per slot, and the applies compose
  them: `getCommandingPlayer`, `updateRemainingUnitsForPlayer`,
  `updateRemainingCommandsForPlayer`, `updateIssueCommandsStep`,
  `openCommandResolution`, `clearCommandResolution`, and the two blocks
  `beginResolvingCommands` and `finishResolvingCommands` that five applies had
  written out by hand. Phase 4 and the commander moves likewise
  (`openMeleeResolution`, `clearMeleeResolution`, `updateMoveCommandersStep`).
- A fresh rout, retreat and melee have factories (`createOpenedRoutState`,
  `createOpenedRetreatState`, `createOpenedMeleeResolutionState`);
  `@testing`'s `createRetreatState` delegates to the retreat one, so a single
  legal path is chosen at once as the engine does.
- The retreat, reverse and rout writers read their apply through
  `getAttackApplyStateOfPlayer` and write it through `updateAttackApplyState`;
  an engagement is written one part at a time
  (`updateFront-`, `-Flank-` and `-RearEngagementResolutionState`,
  `completeEngagementInMovement`), and `findRearEngagementStateFromMovement`
  replaces a tree walk inside a transform. The orphan `attackApplyContext` is
  deleted.
- A player's cards change through `updatePlayerCards`, which reads the seat;
  `replaceCardState` and `updatePlayCardsStep` write back. The three seat
  checks and the card-state orphans are gone.
- `getLegalRangedAttackSupporters` throws outside Phase 3, as the other
  enumerators do. An engagement retreat recorded with no path throws, since a
  front-engaged defender with nowhere to go stands.
- The four `isValidCommitTo*Event` are one judgement (`isValidCommitment`);
  `findUnitIndex` and `findRankSpanBetweenEnds` replace restated lookups.
- Stale documents in Section 4, except where noted there.

**Run log (2026-11-11, fifth pass).** On the author's answers. Closed:

- The mode table, the entity bounds and the `@ruleValues` cycle (see 3.5).
- `submittedTime` is dropped (after the audit). `getLegalChooseCardOptions`
  throwing off its step is acceptable to clients.
- `@testing` delegates to production wherever it can. New opened-state
  factories (`createOpenedReverseState`, `createOpenedRallyResolutionState`,
  the three opened engagement resolutions, `createOpenedEngagementState`) replace
  blocks that applies built inline and that `@testing` then built again;
  `createRoutState`, `createReverseState`, `createRallyResolutionState`,
  `createMeleeResolutionState`, the three engagement-state builders and
  `updateCardState` start from the production factory or transform.
- Events: the projected-choice schema list is asserted against its type, and
  the list of choice types against the union of events (Section 7, scout 5).
- Functions with no caller in 3.3 stay: `eachUnitPresentOnce`,
  `eachCardPresentOnce`, `getEventStream` and `getRoundSnapshot` are for
  periodic integrity checks not yet implemented, or for consumers.

Six scouts and a report on the game tree against the events were run
read-only; they are in Section 7 with what each would cost.

Decision points left for the author, found on the way:

- **The combatOutcomes README** described `getNextMeleeRoutState` as asking the
  initiative player's side first; it asks the second player's. Corrected with
  R5.
- **Dropped or reworded specs.** The three "rejects committing with an empty
  modifier list" cases tested only the removed field. "stops after applying
  gameOver without re-querying expected event" no longer held and was
  reworded. Two `performRangedAttack` specs placed no units on the board and
  now do.

**Integrity check (2026-11-11, after the fifth pass).** The author asked for a
sanity check of every commit not yet pushed. Three reviewers, given the commits
but not my conclusions, compared each commit with its parent. None of the
refactors changed game behaviour; the only behaviour changes are the two
misuses made to throw on purpose (a shot's supporters asked for outside Phase 3,
and an engagement retreat recorded with no path). Fixed from what they found:

- `getLineBetweenEnds` had folded "the first end is not on the board" into "the
  two ends do not stand on one unbroken rank". It throws its own message again
  (failing spec first).
- Comments made false by `settleRout` (in `resolveRout.ts` and
  `findRoutLocation.ts`) no longer say the apply reads `routResolutionSource`.
- The "why" for the throw in `generateStartEngagementEvent` was lost when the
  engagement predicates became booleans: the two 45° facings cannot happen,
  because a front approach squares up (§6.2.3). It is back. The per-case
  comments in `applyStartEngagementEvent` are back too.
- "A defender with nowhere to fall back to stands" now cites §6.3.2 as well as
  §9.1.5 in three places; §6.3.2 step 2 is the rule that it stands.
- `playerChoiceTypes.ts` said the list was built from the event constants; it is
  written by hand and asserted against the events.
- The four opened-engagement factories share no spec file now; each has its own,
  titled for its function.
- Four fixtures used instance numbers (99, 999) above the new cap of 12.
- The effects README named `updateCardState`, a test helper, as a pure
  transform; it now names `updatePlayerCards` and `replaceCardState`.
- Stale lines in this document (`isValidLine`, the fixture setter, Section 7's
  "nothing changed yet").

Left for the author:

- **`updateHiddenPlayerCardState` was deleted** in the third pass for having no
  caller. That was before the author said functions with no caller may be
  consumer API. It writes the hand of a seat that cannot see it, which is what
  a client holds. Restore it, or leave it gone?
- **The test helper `assignInstanceNumbers`** numbers units 1, 2, 3… across both
  players and all unit types. A layout of more than 12 auto-numbered units would
  get numbers the schema now rejects. Nothing parses them and no spec does it
  today; numbering per player and type would match the game.
- **Public exports removed this session**, for the client/server handoff list:
  `meleeModifierTypes` and its three sibling tables with their four types
  (moved to `@ruleValues` under new names), `isValidChooseMeleeResolutionEvent`,
  `updateHiddenPlayerCardState`, and `gameModes` changed from an array to a
  record keyed by mode name.

---

## 1. Defects

E1 to E7 are closed; the run logs above name how.

---

## 2. Rule questions for the author

R1, R2, R3, R5 and R6 were decided on 2026-11-11 and are in the table above.
R6 was applied to `@queries`, and in the second pass to the three readers
outside it whose `undefined` is a real answer. The `getLegal*` enumerators
that still answer `null` are listed with the second pass's decision points.
R3's other three shapes
(`commitToMovement`, `performRangedAttack`, `moveUnit`) stay as they are.

**R4. Rules that live only in validation.** The support check's one place per
unit, pool capacity and "use what you have" (§10.4.3–10.4.5) are in
`isValidAssignUnitSupportEvent`, and the line between two named ends (§4.3.5)
and the order cap (§4.3.2) in `isValidIssueCommandEvent`. ENGINES §2 and the
validation README say validators check membership. A UI or bot can learn these
rules only by being refused. Options: a legality predicate validation calls; a
follow-up enumerator; or say in ENGINES that choices of several units at once
are judged in validation. (The legality README's citation of a nonexistent
`isValidLine` was removed in the events-README commit.) Pool identity is defined three ways (`unitSupportKindLabel` in
legality, `unitSupportLabel` and `sameUnitSupport` in validation).

Direction (author, 2026-11-11): legality predicates that validation calls, as
`canReverseUnit` is. Predicate versus enumerator needs more design work; the
author has been least hands-on here. Nothing is built.

Decided later the same day: a choice too large to list whole is offered a
part at a time, as an `OpenChoice` (`@utils`) of what may come next and
whether the choice may stop; a rule that binds the whole choice is a stopping
rule. The validator walks the submitted choice through the same offers with
`findRefusal` and only words the refusal; the reasons sit beside the offer in
`@legality`. ENGINES says so. Done:

- Moves: `LegalMoveDeltas` is `OpenChoice<MoveDelta>`, and `isValidMovePath`
  walks it.
- Unit support: `getLegalUnitSupportAssignments` holds one place per unit,
  capacity and "use what you have", which is its stopping rule: the player may
  stop exactly when nothing more is offered. The event is a flat list of
  `{ unit, unitSupport }` in any order. Neither the code nor the RULEBOOK says
  "pool" any more; cards of one kind stack (§10.4.3), and the RULEBOOK says
  "stack".
- Issue command (author: a line is named by its ends; range may be traced from
  any unit of it; no maximality). RULEBOOK §4.3.5 and its FAQ say so. The
  event carries a units selection or a line's two ends, and the apply reads
  the units between the ends off the board. Lines are listed whole by
  `getLegalLines`, since a line is fixed by its ends; a units order is an
  `OpenChoice` from `getLegalUnitsToOrder`.

- ~~The legality README's `isValidLine` still does not exist.~~ Fixed: the
  citation was removed.

---

## 3. Composition and shape

Duplicates and missing readers. Production duplicates are marked, not
replaced, in a scout pass; most of these wait on the author choosing a shape.

### 3.1 Missing readers

Closed. The first pass added the per-player Phase 3 readers, the total `find*`
twins for the order under way, the shot, the melee and the front engagement,
`findRetreatAwaitingChoice` and `findPlayerOwingMeleeCommitment`. The third
pass settled the three left over: Phase 3 slot writes, whose rally it is, and
the front-engagement gates (see the third-pass run log).

### 3.2 Combat outcomes

Mostly closed in the third pass: the five hand-replaced slots, the retreat and
rout built by hand, the orphan `attackApplyContext`, and the writers that each
walked to the attack apply. Left:

- The attack-apply events name their parent in four vocabularies:
  `attackResolutionContext` + `defendingPlayer` (the `open*FromAttackApply`
  events), `attackResolutionContext` with the player from the unit
  (`resolveReverse`), `retreatResolutionContext` + `retreatingPlayer`
  (`triggerRoutFromRetreat`), and `attackType` + `defendingPlayer`
  (`completeAttackApply`). The last two make their transforms dispatch by hand.
  It is an event's public shape, so it is the author's.
- A settled rout closes its parent four ways: inside `updateRoutState` (which
  also advances the cleanup step), inside `updateRetreatRoutState`, only if the
  caller remembers `closeRearEngagementWhenRouted`, and by a separate
  `completeAttackApply` effect. _Plausible_ as a risk; not yet scouted.
- A front-engagement retreat's paths are computed twice:
  `generateResolveEngageRetreatOptionEvent` emits only a boolean, and
  `generateOpenRetreatFromEngagementEvent` computes them again.

### 3.3 Cards, units and validation

Mostly closed in the third pass: the seat check, the card-state orphans, the
hand-rolled `hasUnitInArray`/`arrayWithoutUnit`, and the four commitment
validators. Left:

- `isValidSetupUnitsEvent` keeps its own `unitKey`. Setup is out of scope.
- `eachUnitPresentOnce` and `eachCardPresentOnce` have no caller; the load
  boundary is the natural one. `eachUnitPresentOnce` ignores reserved units and
  compares identity only, which E1's design makes enough. `getEventStream` and
  `getRoundSnapshot` have no caller: nothing rebuilds state from the stream.
- Who may be ordered (§4.3.4, §4.3.6) is checked in `getLegalUnitsForIssueCommand`
  and again in `canJoinLine`. They agree today. _Plausible._
- `@testing`'s `updateCardState` replaces the whole card state, which
  `replaceCardState` now does in production. Done in the fifth pass: the
  fixture setter delegates to `replaceCardState`.

### 3.4 State and event shapes

- The round number is stored twice (`gameStateBase.currentRoundNumber`,
  `roundState.roundNumber`), kept in step by two writers, read from different
  copies, created as 0 and 1, and bounded differently by the two schemas.
- Melee results are keyed by colour in `resolveMelee` and by initiative in the
  state, and the attack result is spelled three ways (`resolveMelee`,
  `resolveRangedAttack`, `AttackResult`). `applyResolveMeleeEvent` translates.
  `@events` cannot import `@game`, so a shared shape would sit in `@entities`.
- `completeRangedAttackCommand` closes one shot and the whole order; the
  transform tells which by re-running legality, which is how E2 reaches the
  fold. Movement has a per-unit effect. _Plausible._
- Commander defeat is held both in `lostCommanders` and by absence from the
  board, read from each by different queries, kept in step by one writer.
  _Plausible, low._
- The event-type lists (the `playerChoices` tuple, the 19 constants, the two
  unions; the `gameEffects` tuple in `@ruleValues`) are kept by hand. Whether
  dropping a union member fails typecheck is unchecked.

### 3.5 Rules in the wrong layer

Closed in the fourth pass (the sweep):

- The §8.4 table of what each moment's commitment accepts is in `@ruleValues`
  (`MELEE_COMMITMENT_MODIFIERS` and its three siblings), checked against
  `StatModifier`, and the four `commitTo*` events say only what they carry.
- "No inspiration range" is `NO_INSPIRATION_RANGE`, the schema's minimum and
  what `unitMatchesInspirationRange` reads as unrestricted.
- `@testing`'s fixture for an attack that reached nothing is
  `createAttackApplyStateWithNothingDue`, no longer sharing a name with the
  factory.
- `getMeleeSupportValue` excludes the fighter's back spaces (§7.3.1). It had
  asked for the half-board behind (§2.3.3); the two agree on all eight facings
  for adjacent spaces, so nothing changed.
- Predicates in `@queries` whose callers read only the answer return booleans
  (eight, then `matchesUnitRequirements` and the three engagement predicates).
  `findEngagementType` is the one statement of how an engagement is met, in
  place of three predicates chained by hand. `isSameCardValue` and
  `isAtPlacement` keep their `ValidationResult`, since each caller shows or
  throws the reason.
- `@testing`'s engaged-board fixture engages through `addUnitToBoard`.

Closed in the fifth pass, on the author's answers:

- **The §3.1.3 mode table.** One table, in `@entities`, keyed by mode name
  (`gameModes` is now a record; iterate `gameModeNames`), looked up by
  indexing where a game is composed. `createEmptyGameState` and
  `refineGameModeBoardSize` index it. `startNewGame` re-derived the fact three
  times (a switch, a catalog lookup, a board-size check that
  `parseLegalGameForMode` repeats) and now calls `createEmptyGameState` once.
- **Entity bounds.** Numeric limits stay declared in the schemas: Zod checks
  them where the value is parsed, a refine would add a step to validation, and
  they are declarations. The entities README now says so; refines are for
  rules that look across values. `instanceNumber` is bounded by
  `MAX_ARMY_UNIT_PER_TYPE_COUNT` where it said 20.
- **No circular dependency with `@ruleValues`.** `@ruleValues` imported
  nothing from the domain until the commitment table type-imported
  `StatModifier`; it no longer does.

---

## 4. Stale documents and comments

Closed in the third pass: each of the twelve listed spots was corrected, or the
code it described was changed (the in-play card reads, the exported per-choice
validator). One thing to check: the `openRetreatFromEngagement` fix rests on
§6.3.2 and §9.1.5 (a front-engaged defender may fall back only where there is
somewhere to go, and otherwise stands). The "D1 ruling" the old entry named is
not in the RULEBOOK, so if D1 said something else about a defender with no
retreat, that fix, and the throw it added in `applyOpenRetreatFromEngagementEvent`,
are the ones to revisit.

---

## 5. Carried over from 2026-11-10

| Item                                                 | Note                                                                                                                                                                                                                                                           |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `submittedTime` on player choices as a replay record | Dropped by the author: after the audit.                                                                                                                                                                                                                        |
| Writer question                                      | Closed: one query reads and one transform writes each slot (third pass).                                                                                                                                                                                       |
| `createInitialGameState` has no production caller    | `startNewGame` now calls `createEmptyGameState` once. Kept for consumers.                                                                                                                                                                                      |
| Seven `TODO` marks, each a decision for the author   | `UnitPlacement` and `createUnitWithPlacement` names; the rally rout's `'bypassed'`; whether the sequencer locates routs through `findRoutLocation`; the rout getters with no production caller; the melee apply's `player`. (The board-size lookup is closed.) |
| Spec type assertions without the STYLE comment       | Not recounted.                                                                                                                                                                                                                                                 |
| Headers on exported and local functions              | Not recounted.                                                                                                                                                                                                                                                 |
| 744 spec titles beginning "should" or "given"        | STYLE.                                                                                                                                                                                                                                                         |
| Commentary, layer by layer                           | Validation and transforms first.                                                                                                                                                                                                                               |

---

## 6. Checked and sound

So the next sweep need not repeat them:

- **Readers.** Every `find*` in `@queries` is total; the routers cover all five
  parents. Procedures read selections and transforms read the getter their
  event names, in the retreat, reverse, rout and attack-apply families.
- **Catches.** Five `catch` blocks in production, all at permitted boundaries,
  none rewording a message. None in queries, legality, expected, procedures,
  transforms. No input mutated; no narrowing assertions in production.
- **Declarations.** No `refine`, `superRefine` or `transform` in entities,
  events or game. `@utils`, `@ruleValues` and `@sampleValues` keep their
  import posture.
- **Sequencing against the rules.** Phase 1 reveal and initiative (§4.1),
  Phase 2 with fallen commanders skipped (§4.2), issue then resolve per player
  (§4.3), the shot sequence (§4.3.11, §7.4.5), melee commit order and staged
  applies (§7.2.2, §7.5.6), rally then support check (§10.3, §10.4), the rear,
  flank and front engagement branches.
- **Rules not yet exercised in the earlier assessment, now read.**
  - Shooting: eligibility at the shooter's own Range; the committed card
    stretches the shooter's arc only; no shooting into a melee; supporters
    ordered, unshot and unengaged, each spending its shot; attack floored once;
    a Shoot order with no target closes rather than stalls.
  - Two-stat commitments give +1 to each stat, on the committer's unit only.
  - Round-effect ranges read where a move begins (§4.3.7, §5.1.4).
  - Commander defeat only by an own unit's combat rout; not at the support
    check (§4.2.8, §9.3.5).
  - Ride-along into every engagement type; only the unit's own commander
    retreats with it (§4.3.10, §9.1.8).
  - Reverse checked when it comes due (§7.5.5).
  - Command modifiers only on the commanded, all round (§4.3.8).
- **Geometry and endgame.** `calculateInitiative`, `diagonalIsClear`, lines,
  arcs and distances, the §6.3.1 facing table, and §11.1–11.4 in order.

---

## 7. Scout reports (fifth pass)

Each is read-only, from the code and its specs; the claims that change what we
would do were spot-checked against the code (the commander readers, the two
retreat computations, the front-engagement rout spec, the round filing). None
found a defect a player can reach today except scout 5. "Shape cost" means a
change to a public event or state shape, which the client and server packages
consume. When written, nothing here had been changed; items done since are
marked **Done** or **Fixed** in their own subsection.

### 7.1 A settled rout closes its parent four ways

**Done (sixth pass, on the author's answers).** `settleRout` writes the rout
and, once it is settled, closes what it held open: a retreat, a rear
engagement or a rally. An attack's result stays open for `completeAttackApply`.
Both settlers call it. The writers only write: `updateRoutState` no longer
closes a rally or moves cleanup on, `updateRetreatRoutState` no longer closes
the retreat, and `closeRearEngagementWhenRouted` is gone. The author called the
closes inside the writers "the wrong closure".

**Verdict: design risk, low.** The four are layers of one chain every caller
goes through, not four alternatives. The two apply events that settle a rout
(`applyChooseRoutDiscardEvent`, `applyResolveRoutEvent`) both write through
`updateRoutState`. A ranged or melee rout leaves its apply open on purpose:
`completeAttackApply` is a separate effect, because both melee sides must
finish before the next stage (§7.5.6). The rear engagement is closed by
`closeRearEngagementWhenRouted`, which both settlers call; forgetting it is
loud (`getExpectedEngagementEvent` throws). The rally advances its step inside
`updateRoutState`, once; a second advance throws. No stall or double close is
reachable.

Two real findings. (1) `applyChooseRoutDiscardEvent` finds a retreat's rout
through `updateRoutState`'s `findRoutLocation` check, and `applyResolveRoutEvent`
through the event's `routResolutionSource` and a direct `updateRetreatRoutState`
call: two routes to the same write. (2) A rout nested in a **front**
engagement's retreat cannot arise (a front retreat always has a path), yet
`findRoutLocation` handles it, and the spec at
`applyChooseRoutDiscardEvent.test.ts` ("a front engagement whose defender had
nowhere to retreat lets it pay its rout") builds that unreachable state and
asserts only that the retreat closes, not the engagement.

**Proposal (no shape cost):** one `settleRout(state, rout)` that writes the rout
and applies all three closes, called by both settlers, so
`updateRoutState` returns to being a pure writer and `applyResolveRoutEvent`
loses its `routResolutionSource === 'retreat'` branch; make `findRoutLocation`
throw for a rout on a front engagement's retreat, and correct that spec.
(`resolveRout`'s `routResolutionSource` field would then be unread; dropping it
is a shape change, left for the author.)

### 7.2 `completeRangedAttackCommand` closes one shot and the whole order

**Verdict: design risk.** One effect, requested in four places (a finished
shot; units remain but none has a target; an empty list at resolve start; and
the post-shot case where nobody can shoot, where the transform has already
advanced). Its transform clears the shot, re-runs `getLegalRangedAttackers`,
and either keeps the survivors or finishes the order. It never asks why it was
called, and the expected engine uses the same legality query on the same state,
so they cannot disagree; no unit is shot twice or stranded. The cost: the log
cannot tell a shot ending from an order ending, and the transform mixes
bookkeeping with a legality filter (movement's `completeMovementCommand` has
the same body). Two branches in `getExpectedIssueCommandsPhaseEvent` (empty
list after a ranged resolve) cannot follow a shot. A minor, unbuilt-board case:
a unit with no target when the filter runs is dropped for good, where the rule
says it is skipped at step 1.

**Proposal (shape cost: one new effect type):** mirror movement. A per-shot
effect (`completeRangedAttack`) that only clears the shot; `completeRangedAttackCommand`
becomes the per-order effect the expected engine asks for only when nobody can
shoot or the list is empty; the legal filter moves out of the transform into
one shared pure step. Needs a new type in `ruleValues/gameEffectTypes.ts`,
`events/gameEffects/resolveAttack/` and the procedure registry; clients that
wait for `completeRangedAttackCommand` after a shot must wait for the new one;
old logs do not replay. Missing specs: a two-shooter order run end to end.

### 7.3 Commander defeat is held twice

**Decided (author, 2026-11-11): keep `lostCommanders`.** It is cheaper than
querying the board, meaningful, and true by construction: reserve, board,
defeated applies to units and commanders alike. The proposal below is declined;
what remains is only to put both readers behind one named query if they ever
multiply.

**Verdict: design risk, low; the redundancy is real.** `lostCommanders` has
exactly one reader (`getMoveCommandersStepFrom`, which skips a fallen side's
commander move) and one writer; board absence has five readers. They are
written together in one function (`defeatCommanderWithRoutedUnit`), reached only
from `removeUnitsLeavingUnderRout` (combat routs, correctly not the support
check), so no production path makes them disagree. Every question
`lostCommanders` answers can be answered by `findCommanderSpace(...) ===
undefined`, because the Move Commanders phase comes after setup places both
commanders. Specs that set one alone: `getMoveCommandersStepFrom.test.ts` and
`unitMatchesInspirationRange.test.ts`.

**Proposal (shape cost: removes `lostCommanders` from the state, its four
schemas and `createEmptyGameState`):** a `commanderIsFallen(state, side)` query
built on `findCommanderSpace`, read by `getMoveCommandersStepFrom`; delete the
list and `addCommanderToLostCommanders`. **Caveat for the author:** if
"defeated" must ever differ from "absent" (the deferred question about an enemy
entering a commander's space), the list earns its place; then keep it and put
both readers behind one named query.

### 7.4 A front-engagement retreat's paths are computed twice

**Verdict: design risk.** `generateResolveEngageRetreatOptionEvent` and
`generateOpenRetreatFromEngagementEvent` both look up the defender, build the
defender's commitment modifiers, and call `getLegalRetreats`; the first keeps
only whether the list is non-empty and the speed comparison. Between them only
two booleans flip, so they cannot disagree today. The risk is indirect: a
future change that moves or alters a unit between the two events, or an old log
whose first event said "can retreat" and whose second recorded `[]` (which the
apply now throws on). Nothing validates the second against the first. The
attack-apply path does it once: the procedure that opens the retreat computes
and records the paths, and empty means rout.

**Options.** (a) Leave it. (b) Cheapest, no shape cost: one shared query for the
"defender and its modifiers" lookup, so the same-inputs fact has one source.
(c) The tidy fix, shape cost: `resolveEngageRetreatOption` carries
`retreatPaths` (empty means it stands) and the paths wait in the front
engagement's resolution state, so `openRetreatFromEngagement` needs no
recomputation; both event schemas are `.strict()`, so a removed field breaks
parsing of old logs, and the resolution state gains a field. Author's call on
which event carries the paths and whether state or event holds them.

### 7.5 Hand-kept event-type lists

**Verdict: one real defect (fixed), two design risks.**

| List                                                                                              | Result                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PlayerChoiceEvent` type and schema, and the apply and validate switches                          | Dropping a member fails the typecheck. Not an issue.                                                                                                                                        |
| `projectedPlayerChoiceEventSchema` list                                                           | **Dropping an entry compiled silently**; the wire schema then refused that choice at runtime while the type allowed it. **Fixed:** asserted against its type (proved by dropping an entry). |
| `playerChoices` tuple against the event union                                                     | Drift was caught only where some consumer happened to switch on the tuple. **Fixed:** asserted against `PlayerChoiceEvent['choiceType']`.                                                   |
| `gameEffects` tuple, union, schema, procedure switch                                              | Each drift fails the typecheck. Not an issue; no change.                                                                                                                                    |
| The 19 `*_CHOICE_TYPE` constants                                                                  | Duplicate the tuple strings by hand; drift is now caught by the new assert.                                                                                                                 |
| `LegalPlayerChoiceOptions` union                                                                  | Hand-kept, tied only by the router's return type. Design risk, left.                                                                                                                        |
| `getLegalPlayerChoiceOptions.test.ts` partition (`allChoiceTypes`, `choicesNeedingRoundUnderWay`) | Both typed against `PlayerChoiceType`, so a wrong name fails; a **new** choice is omitted silently. Typing it as `Record<PlayerChoiceType, …>` would close that; not done.                  |

### 7.6 Who may be ordered is checked twice

**Verdict: design risk; the two agree on every input.** Predicate by predicate
(units order, line anchor and line member): friendly and on the board are given
by both; **engaged, already commanded and trait/type restrictions are written
twice** (`notEngaged`, `notAlreadyCommanded` and the pass-through
`unitMatchesTraitAndTypeRestrictions` in `getLegalUnitsForIssueCommand`;
`canJoinLine`'s inline checks). Inspiration range differs by rule (only a
line's anchor needs range, §4.3.5), and facing is line-only. Every case checked
(a commanded or engaged anchor or end, a line cut by a commanded unit, a member
that fails range) is consistent and rule-correct. Not covered by specs: a
commanded or engaged unit named as a line's end (the refusal-reason path), a
line trimmed by a commanded unit in the middle, and a cross-check that the
anchors' set is a subset of what `canJoinLine` accepts.

**Proposal (no shape cost):** one `@queries` predicate, "free of engagement, not
yet commanded, matching trait and type", called by both; range stays separate.
An edit to one copy, for example the "looser" engaged-unit rule noted at
RULEBOOK §4.3.5, would otherwise silently desynchronise them.

### 7.7 The game tree against the events

**Attack-apply parent vocabularies (3.2).** Not four spellings of the same
field but four shapes of "which apply": `open*FromAttackApply` carry
`attackResolutionContext` and, for melee only, `defendingPlayer` (the query
`getAttackApplyStateAt` dispatches, so the transforms do not); `resolveReverse`
carries the context with no discriminated union and takes the player from the
unit; `resolveRetreat` carries none and finds its retreat with
`findRetreatLocation`; `resolveRout` carries `routResolutionSource` with five
values and uses it only to ask "is it a retreat?"; `triggerRoutFromRetreat`
carries `retreatResolutionContext` (the same two literals under another name) and
`retreatingPlayer`, and its transform has **two hand-written ternaries**;
`completeAttackApply` carries `attackType` (`'ranged'`, from `@entities`) and
`defendingPlayer`, with an if-chain, and the ranged player is dead data. Also
`'ranged'` against `'rangedAttack'` for the same fact. The copies cannot
disagree under a procedure (it reads the player off the apply's unit); only a
hand-built or replayed event can, and the transforms then throw. The stated
reason for the context ("spares transforms re-branching on phase") is weak:
`updateAttackApplyState` already branches on phase, and `resolveRetreat` and
`resolveRout` work with none.

Options: (1) leave; (2) shape cost, two events: put `triggerRoutFromRetreat` and
`completeAttackApply` on the existing `AttackApplyLocation` and make
`resolveReverse` a discriminated union, deleting the ternaries and the if-chain;
(3) shape cost, seven or more events: drop the context and player and derive
them from identity and state, closest to "an event names a unit by identity".
Recommendation (2); (3) is a larger decision.

**The attack result spelled three ways, and colour against initiative.**
`resolveMelee` carries `whiteUnitRouted`/`blackUnitRetreated`…; `resolveRangedAttack`
carries `routed`/`retreated`/`reversed`; the state holds `AttackResult`
`{unitRouted, …}`. `applyAttackValue` already returns an `AttackResult`; each
generator unpacks it into the event and each transform repacks it (two unpacks,
two repacks, about twelve flag lines). The colour-to-slot mapping (colour in the
event, initiative in the state) is written in four places, all from
`state.currentInitiative`, so one transform cannot disagree with itself; it
could only drift if initiative changed between generating and applying, which
the flow does not allow. Options: (1) leave; (2) shape cost, both events: put
`AttackResult` in `@entities` (the precedent: `AttackType` is there) and nest it,
`{ defenderWithPlacement, attackResult }` and `{ whiteAttackResult, blackAttackResult }`,
colour kept in the event; (3) also drop the `…WithPlacement` fields, which the
state holds and the transforms read only `.unit` from.

**The round number stored twice (3.4).** `currentRoundNumber` (min 0) and
`roundState.roundNumber` (positive) are written together by exactly two
transforms (`applyCompleteCleanupPhaseEvent`, `applySetupUnitsEvent`) and read in
disjoint places (`processEvent` and `handleNewRound` read the first, the cleanup
transform reads the second), so they cannot disagree today; by design they are 0
and 1 during setup. A **discrepancy at the setup boundary**: `processEvent` files
each event under the round number of the state _before_ it, so the last setup
event is filed under round 0; the setup transition then resets the in-state log
to `[]` and `applyEvent` appends that event to it, so state round 1's log begins
with the last setup event while the stored round-1 stream begins empty and
round 0's stream (the setup events) is never flushed. The cleanup boundary is
handled on purpose (the log starts empty); the setup boundary is not. Options:
(1) leave, and add a schema refine or a spec linking the two; (2) remove
`currentRoundNumber` and read the round's own number (state shape cost; no event
shape cost; the application then files setup under round 1, a policy change for
the round-0 stream), recommended; (3) remove `roundState.roundNumber`.

**Decided (author, 2026-11-11):** round 0 has its own event structure (setup
only, not built out), so setup is not forced into the round-1 log and stream
rules. The event that ends a round may be better named `roundEnd` than
`completeCleanupPhase` (rename, to confirm). The ranged skip divergence in 7.2
is a definite error: fix it, with a failing spec first.

**Other discrepancies noted.** `resolveMelee` carries `location` and both
placements' coordinates, which the state also holds; `resolveReverse` carries a
placement with a unit again (`newUnitPlacement.unit` unread);
`resolveRetreat.startingPosition.placement` is read by the transform in place of
the board, so the event and the board can disagree and the event wins;
`resolveRout.penalty` is a computed value written to `numberToDiscard`, and
`unitInstances` beyond the first is ignored; the attack-apply factory lets a
rout win over retreat and reverse, so inconsistent event flags are silently
reconciled.

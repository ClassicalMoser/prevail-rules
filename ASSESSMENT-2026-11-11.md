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
| R4   | Direction only: legality predicates that validation calls, as `canReverseUnit` is. The author has been least hands-on here and says predicate versus enumerator needs more design work. Nothing is built yet.                                                                                        |
| R5   | The selections stay as they are. The sequencer owns the order of routs and opens them one at a time, so the selections' first-player-first order never has two candidates to choose between. The README sentence and the `findRoutOwingDiscard` JSDoc are corrected to say that.                     |
| R6   | Repo-wide: every total reader is `find*` and every `get*` insists. The `get*` readers that return `undefined` are renamed.                                                                                                                                                                           |

**Hands off, with no design yet:** the writer question, `submittedTime`, and
R4 beyond the direction above. The other three R3 shapes (`commitToMovement`,
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

Decision points left for the author, found on the way:

- **`getLegalChooseCardOptions` was documented as soft** ("does not throw ...
  so clients can re-enumerate after a peer commits"). It now throws off the
  chooseCards step, by the no-belt-and-suspenders principle. A client that
  re-enumerates after both players have chosen has moved past the step and
  would now be refused loudly; if that is a pattern the clients rely on, this
  one is for the author to reverse.
- **The combatOutcomes README** described `getNextMeleeRoutState` as asking the
  initiative player's side first; it asks the second player's. Corrected with
  R5.
- **Dropped or reworded specs.** The three "rejects committing with an empty
  modifier list" cases tested only the removed field. "stops after applying
  gameOver without re-querying expected event" no longer held and was
  reworded. Two `performRangedAttack` specs placed no units on the board and
  now do.

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
are judged in validation. The legality README cites an `isValidLine` that does
not exist. Pool identity is defined three ways (`unitSupportKindLabel` in
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

- The legality README's `isValidLine` still does not exist.

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
  `replaceCardState` now does in production; the fixture setter could delegate.

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

Left, each a design choice:

- **The §3.1.3 mode table is split.** Board size per mode is in
  `entities/gameModes`, limits in `@ruleValues`, assembly in `legality/army`,
  and the mode-to-board lookup is written twice, in `refineGameModeBoardSize`
  and `createEmptyGameState` (`startNewGame` no longer exists). `@factories`
  cannot import `@queries`, so a single lookup needs a function in `@entities`,
  which holds none, or a second table kept in step with the catalog.
- **Entity bounds that are rules.** The entities README says a schema is shape
  only and every rule about allowed values is a refine in `@legality`. Still in
  schemas: card commit stats `1..2` (§8.2), unit limit and count `≤ 12`
  (§3.1.4), initiative `1..4`, support count `≥ 1` (§10.4.2). Other bounds are
  arbitrary limits; `instanceNumber ≤ 20` does not match the type limit of 12.
  Moving a bound from a schema to a refine changes where bad data is caught on
  parse, so it is the author's.

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

| Item                                                 | Note                                                                                                                                                                                                                                                      |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `submittedTime` on player choices as a replay record | Agreed, not built. Do it before production.                                                                                                                                                                                                               |
| Writer question                                      | `update{Retreat,Reverse,Rout,AttackApply}State`; the melee slot ternary belongs here. Author's design call.                                                                                                                                               |
| `createInitialGameState` has no production caller    | `startNewGame` builds with `createEmptyGameState`. See also 3.5.                                                                                                                                                                                          |
| Seven `TODO` marks, each a decision for the author   | `UnitPlacement` and `createUnitWithPlacement` names; the board-size factory lookup; the rally rout's `'bypassed'`; whether the sequencer locates routs through `findRoutLocation`; the rout getters with no production caller; the melee apply's `player` |
| Spec type assertions without the STYLE comment       | Not recounted.                                                                                                                                                                                                                                            |
| Headers on exported and local functions              | Not recounted.                                                                                                                                                                                                                                            |
| 744 spec titles beginning "should" or "given"        | STYLE.                                                                                                                                                                                                                                                    |
| Commentary, layer by layer                           | Validation and transforms first.                                                                                                                                                                                                                          |

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

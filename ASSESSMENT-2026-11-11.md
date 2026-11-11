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

---

## 1. Defects

Each breaks a rule, a stated engine contract, or the replay the engine exists
to give. Each wants a failing spec first and its own fix commit, unless the
author decides otherwise.

| #   | Defect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Where                                                                                                                                                                                  | Status                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| E1  | **Three Phase 3 applies keep the unit the event sent instead of the one on the board.** `applyChooseMovingUnitEvent` stores `event.unit` as the mover, `applyChooseShooterEvent` stores `event.unit.unit` as the shooter, and `applyPerformRangedAttackEvent` stores `event.targetUnit.unit` as the target. The validators match by identity and placement, which is enough, so a real id carrying forged stats passes. `applyMoveUnitEvent` then writes the stored copy back onto the board, and `generateResolveRangedAttackEvent` reads the shooter's and target's stats from the stored copies. No other transform or procedure takes a unit's value from an event. _Design (author, 2026-11-11):_ unlike a card, which the event must carry whole so a hidden hand can fold it, a unit on an event is identity only. The transform moves the unit already on the board with a pure transform; it never places what the event represents. There is no unit counterpart of `moveCommanderOnBoard`, so the lift-and-set-down is written by hand in six production transforms: `applyMoveUnitEvent`, `applyCompleteUnitMovementEvent`, `applyResolveRetreatEvent`, `applyResolveReverseEvent`, `applyResolveFlankEngagementEvent` and `applyStartEngagementEvent` (read, not each compared). _Design (author, 2026-11-11):_ one pure transform removes the unit and adds it at its new placement, and it is the only one those transforms call. | `applyChooseMovingUnitEvent.ts:41`, `applyChooseShooterEvent.ts:40`, `applyPerformRangedAttackEvent.ts:37`; `applyMoveUnitEvent.ts:56-61`; `generateResolveRangedAttackEvent.ts:48-68` | Verified                |
| E2  | **A seat's fold leaves the server's during the opponent's orders.** `getLegalMoveUnits` and `getLegalRangedAttackers` answer `null` when the viewer cannot see the player's hand, though they read only `inPlay`, which is face up (§4.1.2). `applyCompleteRangedAttackCommandEvent` reads that `null` as "nobody else can shoot", clears the remaining shooters and advances the step. The opponent's seat and every spectator then sit on a different step from the server, and `findExpectedEvent` on a seen state expects a different event. Breaks ENGINES §1.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `getLegalMoveUnits.ts:67-70`, `getLegalRangedAttackers.ts:74-82`, `applyCompleteRangedAttackCommandEvent.ts`, `getExpectedIssueCommandsPhaseEvent.ts`                                  | Verified; two reviewers |
| E3  | **Each round's log opens with the last event of the round before.** The cleanup apply resets `events` to `[]`; `applyEvent` then appends `completeCleanupPhase` to the new list. The application files the same event under the old round number, so the stored stream and the in-state log disagree. ENGINES §2 makes the position in `events[]` the cursor for replay and undo.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `applyEvent.ts:59-66`, `applyCompleteCleanupPhaseEvent.ts:39`, `application/process/processEvent.ts:18-22`                                                                             | Verified                |
| E4  | **A commitment's stats are compared in order and never applied.** Each `commitTo*` event carries `modifierTypes`; the validators require them in the card's order, so the same stats listed the other way are refused. No transform reads the field: the stored commitment keeps only the card, and readers give +1 to every stat the card names. §8.2's "a second stat is simply ignored" holds only because each reader asks for its own stats.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | the four `isValidCommitTo*Event` (`sameModifierTypes`); `getCommitmentOffers.ts`; `modifiersFromCompletedCommitment.ts`                                                                | Verified; two reviewers |
| E5  | **The melee order enumerator offers mid-melee and throws on empty.** It does not check that no melee is under way, so mid-melee it offers the remaining engagements; only the expected-choice check hides that. And it throws on an empty list, where ENGINES says an enumerator that finds nothing answers with an empty offer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `getLegalChooseMeleeResolutionEvents.ts`                                                                                                                                               | Verified                |
| E6  | **The application saves an event before applying it.** If the apply throws, the stream holds an event the stored state never reflects.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `application/process/processEvent.ts:18-31`                                                                                                                                            | Verified                |
| E7  | **Asking a finished game what is owed throws.** `advanceEffects` calls `getExpectedEvent` before its loop and checks `winner` by hand inside it; `validateExpectedChoice` calls `getExpectedEvent` too. ENGINES §4 gives a caller asking whether anything is owed `findExpectedEvent`. Whether a finished game is a fault at these boundaries is the author's call.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `application/process/advanceEffects.ts:26,42`, `validation/playerChoice/validateExpectedChoice.ts:41`                                                                                  | Traced; two reviewers   |

---

## 2. Rule questions for the author

Each is a design decision. R1, R2, R3, R5 and R6 are decided in the table
above, and R4 has a direction. The text below is kept as it was written.

**R1. Does a front-engaged defender's commitment count toward its retreat?**
_Verified; three reviewers._ The defender may commit for Speed or Flexibility
(§6.3.2 step 1, §8.4). The engine adds the card to the Speed comparison only:
`getLegalRetreats` takes no commitment, so both "is there a retreat to make?"
and the retreat paths ignore it, and a Flexibility card committed here is read
nowhere. The plumbing exists (`exploreUnitMoves` and `createMoveContext` take
`commitmentModifiers`). §6.3.2 ("the start of the retreat it is weighing") and
§5.1.1 ("any card committed for it") read one way; §9.1.3's list of what a
retreat's stats include reads the other. B6 covers shots and melee, not this.

**R2. Where does the engaging unit stand while the defender's retreat is worked
out?** _Plausible._ The engager waits on its start space so its Speed is
sampled there (§5.1.4). The defender's retreat is computed while it is still
there. An engager that began in the defender's back spaces and closed from the
front still blocks, or cuts off (§9.1.5), a retreat from a space it has left,
where §6.1.1 puts both units in the engaged space. Needs a probe.

**R3. Choices that hold two decisions, or one decision split in two.** Against
the practice of one player-choice event per rule decision, in rule order:

- `performRangedAttack` carries the target and the supporters, steps 3 and 4
  of §4.3.11. The shooter and its commitment are already their own choices.
- `moveUnit` carries the path and the commander's ride-along (§4.3.10).
- `commitToMovement` serves the mover's moment (§4.3.10) and the front-engaged
  defender's (§6.3.2); the transform probes the state to tell them apart. §8.4
  lists them as separate moments.
- The reverse case: "issue another order or stop" (§4.3.3) is one decision
  split over `issueCommand` and `doneIssuingCommands`. `ExpectedEventInfo` can
  name only one, so `validateExpectedChoice` accepts the other by hand and
  `getLegalPlayerChoiceOptions` writes `canDoneIssuing: true` as a constant.

Some of these may be one compound decision, as a move's path is.

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

**R5. Should the rout selections carry the §7.5.6 order?** `findRoutAwaitingPenalty`
and `findRoutOwingDiscard` ask the first player first. §7.5.6 and §9.3.3 have
the second player's unit rout and pay first, and the retreat selections do ask
in that order. It is harmless today only because the sequencer finishes one
rout before opening the next. The combatOutcomes README (line 48) and
`findRoutOwingDiscard`'s JSDoc describe the order backwards whichever way
this is settled.

**R6. How far does the find/get contract reach?** The combatOutcomes README
says it crosses all four reader kinds, and `findExpectedEvent` follows it.
`queries/README.md` says failure modes are per function. If it is repo-wide,
`getPlayerUnitWithPosition` and `getCommanderSpace` return `undefined` under a
`get` name, and so do the board steps and the `getWinnerFrom*` queries.

---

## 3. Composition and shape

Duplicates and missing readers. Production duplicates are marked, not
replaced, in a scout pass; most of these wait on the author choosing a shape.

### 3.1 Missing readers

| Item                                                      | What is hand-written instead                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Found by        |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| The acting player's remaining units and orders, Phase 3   | About ten modules pick `remaining{Units,Commands}{First,Second}Player`, some by step literal and some by `player === state.currentInitiative` rather than `hasInitiative`. `getLegalMoveUnits`, `getLegalRangedAttackers`, `getLegalRangedAttackOptions`, `getLegalIssueCommands`, `getLegalDoneIssuingCommandsEvents`, the five choice applies, both `applyComplete*CommandEvent`s. `getExpectedIssueCommandsPhaseEvent`'s mirrored branches come from the same gap. Cleanup has `getRallyingPlayer`; Phase 3 has nothing. `updateRemainingPlayerCommands` exists for orders; units have no counterpart. | Three reviewers |
| The command resolution under way, found without insisting | Six enumerators walk `none` → `issueCommands` → CRS `pending` → type by hand, because `@queries` offers only scoped getters that throw: `getLegalCommitToMovementEvents`, `getLegalChooseWhetherToRetreatEvents`, `getLegalCommitToRangedAttackEvents`, `getLegalCommitToRangedDefenseEvents`, `getLegalShooterTargets`, `getLegalCommitToMeleeEvents`. Each also works out who is asked: the melee commit order is written there and in `getExpectedMeleeResolutionEvent`; the front-engagement gates there and in `getExpectedEngagementEvent`.                                                         | Traced          |
| Whose rally it is                                         | Five derivations covering different steps: `getRallyingPlayer`, `getCurrentRallyResolutionState`, `getRallyResolutionState` (no caller), `getIsFirstPlayerForResolveRallyStep` (no caller), `getRallyStepRoutState` (no caller). On `discardPlayedCards` and `complete` one throws and another reads the second player's slot.                                                                                                                                                                                                                                                                            | Traced          |
| The retreat awaiting a choice                             | `getLegalChooseRetreatOptionEvents` walks `findRetreatState` black then white with its own condition, where its siblings walk second player then first.                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Traced          |

### 3.2 Combat outcomes

- The attack-apply events name their parent in four vocabularies:
  `attackResolutionContext` + `defendingPlayer` (the `open*FromAttackApply`
  events), `attackResolutionContext` with the player from the unit
  (`resolveReverse`), `retreatResolutionContext` + `retreatingPlayer`
  (`triggerRoutFromRetreat`), and `attackType` + `defendingPlayer`
  (`completeAttackApply`). The last two make their transforms dispatch by hand.
- `transforms/pureTransforms/sequencing/attackApplyContext.ts` has no caller;
  its reader duplicates `getAttackApplyStateAt`. `updateMeleeAttackApplyState`
  and the melee branch of `updateAttackApplyState` write the same slot.
- A freshly opened retreat (one smallest path is carried out, §9.1.3; none
  leaves a rout pending, §9.1.6) is built by hand in
  `applyOpenRetreatFromAttackApplyEvent` and `applyOpenRetreatFromEngagementEvent`.
  `@testing`'s `createRetreatState` copies it but always leaves the path
  `'pending'`, a state the engine never makes with one path. A fresh rout state
  is built four times. `createAttackApplyState` is the precedent for a factory.
- A settled rout closes its parent four ways: inside `updateRoutState` (which
  also advances the cleanup step), inside `updateRetreatRoutState`, only if the
  caller remembers `closeRearEngagementWhenRouted`, and by a separate
  `completeAttackApply` effect. _Plausible_ as a risk.
- Five transforms replace an open slot by hand where `updateCommandResolutionState`,
  `updateEngagementStateInMovement` or `updateMeleeResolutionState` would do:
  `applyStartEngagementEvent`, `applyResolveEngageRetreatOptionEvent`,
  `applyResolveFlankEngagementEvent`, `applyResolveRangedAttackEvent`,
  `applyResolveMeleeEvent`. Separate from the writer question.
- A front-engagement retreat's paths are computed twice:
  `generateResolveEngageRetreatOptionEvent` emits only a boolean, and
  `generateOpenRetreatFromEngagementEvent` computes them again.

### 3.3 Cards, units and validation

- "May this seat see that hand" is asked three ways: a local switch in
  `applyResolveRallyEvent`, `findOwnedPlayerCardState`, and an orphan
  `transforms/pureTransforms/cards/getOwnedPlayerCardState.ts` with no
  importer. The shape-of-hand discard fold is written once for one card and
  once for many (`commitApplyHelpers`, `applyChooseRoutDiscardEvent`).
- `updatePlayerCardState` has only `@testing` callers and
  `updateHiddenPlayerCardState` none; production spreads `cardState` by hand in
  five places. `testing/README.md` names the former as the production writer.
- `hasUnitInArray` and `arrayWithoutUnit` are hand-rolled in
  `applyChooseShooterEvent`, `applyAssignUnitSupportEvent`,
  `applyPerformRangedAttackEvent` and `applyUnitsLostSupportAfterRally`.
- The four `isValidCommitTo*Event` are one function. `unitKey` has three copies
  (`isValidIssueCommandEvent`, `isValidAssignUnitSupportEvent`,
  `isValidSetupUnitsEvent`), each a second way of saying who a unit is.
- `eachUnitPresentOnce` and `eachCardPresentOnce` have no caller; the load
  boundary is the natural one. `eachUnitPresentOnce` ignores reserved units and
  compares identity only, which E1's design makes enough. `getEventStream` and
  `getRoundSnapshot` have no caller: nothing rebuilds state from the stream.
- Who may be ordered (§4.3.4, §4.3.6) is checked in `getLegalUnitsForIssueCommand`
  and again in `canJoinLine`. They agree today. _Plausible._

### 3.4 State and event shapes

- The round number is stored twice (`gameStateBase.currentRoundNumber`,
  `roundState.roundNumber`), kept in step by two writers, read from different
  copies, created as 0 and 1, and bounded differently by the two schemas.
- Melee results are keyed by colour in `resolveMelee` and by initiative in the
  state, and the attack result is spelled three ways (`resolveMelee`,
  `resolveRangedAttack`, `AttackResult`). `applyResolveMeleeEvent` translates.
  `@events` cannot import `@game`, so a shared shape would sit in `@entities`.
- Enumerators answer "nothing" three ways: `null`, `[]` or a throw.
  `getLegalPlayerChoiceOptions` keeps six `empty*` builders to turn `null` back
  into an empty offer. E2 is what `null` carrying three meanings costs.
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

- The §8.4 table of stats each moment accepts is declared in the four
  `commitTo*` event files, and legality imports it from there.
- The §3.1.3 mode table is split: board size in `entities/gameModes` (with a
  function, in a layer that holds none), limits in `@ruleValues`, assembly in
  `legality/army`. The mode-to-board lookup is written in
  `refineGameModeBoardSize`, `createEmptyGameState` and `startNewGame`, and
  `startNewGame` checks board size by hand before `parseLegalGameForMode`
  checks it again.
- "No inspiration range" (§4.2.7's "—") is any negative number. The entity
  allows `-1..10` and says nothing; only `unitMatchesInspirationRange` knows.
- Entity bounds that are rules, against the entities README: card commit stats
  `1..2` (§8.2), unit limit and count `≤ 12` (§3.1.4), initiative `1..4`,
  support count `≥ 1` (§10.4.2). Other bounds are arbitrary limits; `instanceNumber ≤ 20`
  does not match the type limit of 12.
- `createAttackApplyState` in `@factories` applies §7.5.3. `@testing` exports a
  different `createAttackApplyState` with another meaning. _Plausible._
- `getMeleeSupportValue` excludes the half-board "behind" (`getSpacesBehind`,
  §2.3.3) where §7.3.1 says the fighter's back spaces. They match on the
  facings traced; the helper names the wrong rule.
- Predicates in `@queries` return `ValidationResult` (`isSameUnitInstance`,
  `hasEnemyUnit`, `isEngagementFrom*` and others) where callers read only
  `.result`. The three engagement predicates answer one §6.3.1 question, which
  `generateStartEngagementEvent` chains.
- `@testing`'s `boardWithEngagedUnits` says no transform engages a space;
  `addUnitToBoard` does. It writes into the board directly.

---

## 4. Stale documents and comments

- `queries/sequencing/combatOutcomes/README.md`: line 79 says the endgame uses
  `null` for a draw; line 48 gives the rout order backwards (R5).
- `game/substeps/meleeResolution/meleeResolutionSubstep.ts`: the JSDoc on
  `firstPlayerAttackApplyState` says the applies resolve in initiative order.
  `applyResolveMeleeEvent.ts:53` repeats it.
- `events/gameEffects/movement/openRetreatFromEngagement.ts`: says an empty
  list routs, which the D1 ruling made impossible.
- `applyEvent.ts:29-30`: says commit events arrive with `'hidden'` cards;
  commitments are never projected.
- `events/README.md`: lists 14 of 19 choices and names a
  `ResolveEngagementEvent` that does not exist.
- `testing/README.md`: `updatePlayerCardState` as the production writer.
- `legality/README.md`: `isValidLine`.
- `retreatSubstep.ts:38`: "legal hexes".
- `getLegalPlayerChoiceOptions.ts:124-125`: types `movingUnit` as `| null`,
  which never comes.
- `isValidChooseMeleeResolutionEvent` is exported from `@validation` and the
  package, against ENGINES §2.
- `getExpectedIssueCommandsPhaseEvent.ts:120-123` and
  `generateCompleteMoveCommandersPhaseEvent.ts:30-37` read a missing in-play
  card as "Move" or "no commands" instead of throwing.

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

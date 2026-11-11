# Current state — 2026-11-10

Where `prevail-rules` stands at `d267cb2` against STYLE, DESIGN, LAYERS,
`boundaries.ts`, the entities README, ENGINES and RULEBOOK. It is meant as an
input to the plan to bring the codebase into compliance before extending it.
It replaces the old findings indexes rather than adding to them.

Behaviour claims were run, not read: probe specs through the four engines,
independent models for the geometry, and about 360 seeded random games with
deep-frozen state, replay and perturbed-choice checks. The probes are deleted
and the tree is clean apart from this file.

**Updated to `417a2cb` (2026-11-11).** Each section below keeps the text as it
was written and carries a **Status** note where the code has moved. The gate at
that commit: `pnpm validate` clean, 443 spec files, 2275 specs passing.
Section 5 is written against that commit; the earlier Section 5 follows it
as 5A.

---

## 1. Defects

Each of these breaks a rule or a stated engine contract, and each was
reproduced, except D5.

**Status (later on 2026-11-10):**

- D1 is fixed. `bebe65e` offers the retreat only when a legal one exists,
  by the author's ruling, and RULEBOOK §6.3.2 now says so. `e77e91f`
  completes the retreat family. The failing spec is `18258d7`.
- D3 is withdrawn. The event number is removed altogether, by the author's ruling: order is the position in `events[]`, and an exact check could not coexist with two players choosing cards at the same moment. `30a28d9` and `3b9588c` are reverted.
- D5 is withdrawn. Probed both ways in `scenarios/meleeStages.test.ts`
  (`8be2e00`), it named the right player each time. A melee's second
  retreat opens only after the first is done, so the caught miss always
  landed on the one open retreat. The dispatch that relied on this is
  replaced in `e77e91f`.
- D2 is fixed to the author's design (`9348787`, `1d0ff68`): the endgame judgment waits while the cards are chosen face down (`isChoosingCardsInSecret`) and applies from the reveal. A `submittedTime` on player choices, as a replay record, is agreed and not yet done.
- D4 is fixed. Commitments and rout discards are face up, so the fault was the fold, not the projection: it read an opponent's hidden hand as owned. The folds now follow the shape of the hand they read (`9e5b563` for commits, then the rout discard, whose event now carries the full cards).

| #   | Defect                                                                                                                                                                                                                                                                 | Where                                                                                                                                                                               | Rule or contract                                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| D1  | **Crash.** A faster front-engagement defender with no legal retreat (its back to the board edge) is offered "retreat", validation accepts it, and the next effect throws `Current command resolution is not a ranged attack`. The game stalls. Reached in random play. | `procedures/defenseResult/generateTriggerRoutFromRetreatEvent.ts`: assumes any Phase 3 retreat is a shot's. The `triggerRoutFromRetreat` schema has only ranged and melee contexts. | §6.3.2, §9.1.5. Open design call: don't offer the retreat, or offer it and rout. |
| D2  | **§11.3 is unreachable.** With one card each in Phase 1, the first `chooseCard` applied ends the game: whoever submits first loses, and initiative never decides it.                                                                                                   | `applyChooseCardEvent` takes the card from hand on submission; `getExpectedEvent` checks the endgame before every event. Every both-empty spec builds that state by hand.           | §11.3, §4.1.1                                                                    |
| D3  | **The event number is never checked.** Every choice type validated with any `eventNumber`; `applyEvent` stores the number given.                                                                                                                                       | `validateExpectedChoice`                                                                                                                                                            | ENGINES: `expectedEventNumber` is the number the next event takes                |
| D4  | **A seated client cannot fold an opponent's committed card or rout discard.** It throws `Player black is not owned under whiteSeen visibility`.                                                                                                                        | `applyCommitCardDiscard` (`commitApplyHelpers.ts`), `applyChooseRoutDiscardEvent`. `projectEventForVisibility` redacts only `chooseCard`.                                           | ENGINES §1 says `commit*` events fold                                            |
| D5  | **Suspected, read only:** the melee retreat-rout picks the routing player by trying the first player's retreat and catching. If both units must retreat and only the second player's is blocked, it may name the wrong unit.                                           | `generateTriggerRoutFromRetreatEvent`, melee branch                                                                                                                                 | §7.5.6 (second player's unit first)                                              |

## 1A. The design problem behind D1

**Closed by `bebe65e` and `e77e91f`.** What was done against the plan below:

- Retreats now have `findRetreatLocation`, a router that answers with the
  parent, and `findRetreatState` is that answer without the parent.
- Two selections, `findRetreatAwaitingMove` and `findRetreatAwaitingRout`,
  serve the procedures in every phase. They walk the units in the order they
  suffer.
- `getNextMeleeRetreatStateAwaitingMove` is gone. `applyResolveRetreatEvent`
  closes a front engagement by the parent the router names.
- Procedures and transforms hold no `catch` now.
- `triggerRoutFromRetreat` keeps its `rangedAttack | melee` vocabulary,
  because after the rule fix a front-engagement retreat always has a path.
  The procedure throws, with that reason, if it ever does not.
- Reverse and attack-apply were checked. The phase alone names their parent,
  since only an apply holds them, and their melee branches read the
  resolution-order selections. Nothing to change.
- The writer question below is still open.

The README records why procedures read selections. The analysis follows as
it was written.

D1 fails at the rule level and at the composition level.

### The rule level

- The offer to retreat is decided on Speed alone:
  `generateResolveEngageRetreatOptionEvent` sets `defendingUnitCanRetreat`
  from `defendingSpeed > engagingSpeed`.
- Whether any legal retreat exists is worked out afterwards, by
  `openRetreatFromEngagement`.
- §9.1.5 says a unit with no legal backward move cannot retreat at all.
  Whether the offer should consult `getLegalRetreats`, or a refused retreat
  should rout, is the author's call.

### The composition level, read against the documented model

`queries/sequencing/combatOutcomes/README.md` sets out four kinds of reader.

| Kind                     | Example                                            | Takes                           | Used by                                                                     |
| ------------------------ | -------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------- |
| Parent reader (`*From*`) | `getRoutStateFromRally`                            | the parent                      | a caller holding the parent; answers `'bypassed'`                           |
| Scoped getter            | `getMeleeRetreatState`                             | the state, plus a named context | a caller that already knows where it is, "usually because an event told it" |
| Selection                | `getNextMeleeRoutState`, `findRoutAwaitingPenalty` | the state                       | picks the one due now, by a rule of the game                                |
| Router                   | `findRoutLocation`, `findRetreatState`             | the state and a player          | walks every context; `get*` twins insist                                    |

Across all four, `find` is total and returns `undefined`, and `get` insists
and throws.

**The readers keep that contract.** No `find*` in `sequencing` throws, and
no combat-outcome `get*` returns `undefined`. The sequencer's direct descent
is the case the README justifies: it arrives holding the parent.

**What breaks it is the callers in the retreat family, and one missing
reader.** A procedure is building the event, so nothing has told it where it
is, and it is not given a player. By the model, it needs a selection. The
rout family has one: `resolveRout` reads `findRoutAwaitingPenalty`. The
retreat family has a selection for melee only
(`getNextMeleeRetreatStateAwaitingMove`), and none that covers a shot or a
front engagement. So:

| Caller                                | What it does                                                                                               | By the model                                                                                                                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generateResolveRetreatEvent`         | Melee: the selection. Phase 3: the scoped shot getter, catching into the scoped engagement getter.         | Melee is right. Phase 3 uses scoped getters as a router by catching; the README says a router reads sentinels with no `try`.                                                                          |
| `generateTriggerRoutFromRetreatEvent` | Phase 3: the scoped shot getter only. Melee: scoped getters, first player first, by catching.              | No event told it the context, so scoped getters are the wrong kind. Phase 3 misses the front engagement (D1). Melee ignores the resolution order that every other melee selection reads (D5).         |
| `applyTriggerRoutFromRetreatEvent`    | Scoped getters chosen by the event's `retreatResolutionContext`.                                           | The right kind, since the event tells it. But the event's vocabulary (`ranged \| melee`) has no front-engagement parent, so it cannot be told. `resolveRout` carries its source; this event does not. |
| `applyResolveRetreatEvent`            | The router (`getRetreatState(state, player)`), then catches to decide whether an engagement needs writing. | Read is right; the write decision is made by catching.                                                                                                                                                |

**D1 has happened before, in the rout family.** The README records it:
"each walk knew four parents instead of five, and a retreat with nowhere to
go therefore opened a rout that nothing downstream could resolve. They all
read `findRoutLocation` now." The retreat family has the router
(`findRetreatState`), but not the two pieces that closed the rout case:

- a selection the procedures can call without a player ("the retreat due
  now", across shot, engagement and melee in resolution order);
- a parent on the event the transform applies.

D1 and D5 are what that gap produces.

### What this means for the plan

- **Complete the retreat family to the documented model.** Add a retreat
  selection the two procedures read, and give `triggerRoutFromRetreat` (and
  `resolveRetreat` if it needs one) the parent, as `resolveRout` carries its
  source. Then the four callers above use the kind the README assigns them,
  with no catches.
- **Check reverse and attack-apply the same way.** The reverse family is
  smaller (one parent kind), but the same question applies: does each
  procedure read a selection, and each transform a scoped getter its event
  names?
- **Writers are not covered by the README.** `updateRetreatState`,
  `updateReverseState`, `updateRoutState` and `updateAttackApplyState` each
  locate their slot again from the phase. Whether writers should take what
  the readers return (a location, or the event's named context) is a design
  decision for the transforms README, not a finding yet.
- **Drop from the earlier draft:** the claims that the readers are muddled,
  that the 27 locators conflict, that `findRetreatState`'s different sentinel
  checks are inconsistent (each slot has its own sentinel, as the README
  says), and the count of hand reads, which included the descents the README
  justifies.

## 2. What the engine gets right

| Area                        | Rules               | Evidence                                                                                                                                                                   |
| --------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Steps and turns             | §5.1–5.2            | Endings and minimum costs equal an independent model on 6 stat/facing cases                                                                                                |
| Move endings and passage    | §5.3–5.4            | Passing a friend at combined Flexibility 6 and not 5; diagonal corner test as A10 settles it                                                                               |
| Engagements                 | §6.2–6.3            | Back approach only from behind; squaring costs 1 Flexibility; rear, flank and front each resolve as written; Speed contest is strictly greater and counts a committed card |
| Melee support               | §7.3.1              | 1,280 cases against an independent model, no mismatches                                                                                                                    |
| Thresholds and floor        | §7.5.1, §7.1.4      | Read                                                                                                                                                                       |
| Commitment stats per moment | §8.4                | Read                                                                                                                                                                       |
| Retreats                    | §9.1.3–9.1.5        | Fewest turns then steps; one path per ending; cut-off; board edge                                                                                                          |
| Line orders                 | §4.3.5–4.3.6        | 12 cases: any eight; about-faced unit joins; each kind of break; inspiration range only at the named end                                                                   |
| Round boundary              | §1.5                | Checked at every round start in random play                                                                                                                                |
| Endgame                     | §11.1, §11.2, §11.4 | Read and random play                                                                                                                                                       |

**Engineering:**

- Boundaries hold, and the domain has no I/O.
- No input was mutated under deep freeze.
- Replay reproduced the final state exactly in 59 of 59 games.
- Every offered option validated.
- Perturbed choices were refused: short Morale discard, open support slot,
  commander over 4 spaces, path past Speed, unit ordered twice, friendly shot,
  rider with no commander. The event number (D3) is the one exception.

**Not yet exercised:**

- shooting, beyond thin random play;
- two-stat commitments in play (§8.2);
- round-effect ranges read mid-round (§4.3.7);
- the visibility fold, beyond D4.

---

## 3. Compliance

### 3.1 Type assertions

**Status (`417a2cb`): closed in production.** `applyEvent`'s stored-event
assertion became an exhaustiveness check (`4603972`) once a seat's log held
`ProjectedEvent`s (`6f8af96`). The visibility branches no longer assert: a
game state is a union of four named variants discriminated by `visibility`
(`b22a7d4`, `1b26f9e`), and a `Game` is the authoritative record only
(`2ee6d4e`). `startNewGame` takes players and armies and parses what it builds
(`a58c37d`), and the round snapshot is read as a game state (`a58c37d`).
Six casts the compiler never needed went in `31e3bb1`; the defense-stat list,
the coordinate lists and the stat schema in `5a4c047` and `5b4e16f`; the
commitment lists in `3faf0e1`. What remains in production are three reads of a
`never` value to word an error (`applyEvent`, `applyPlayerChoiceEvent`,
`getExpectedCommandResolutionEvent`), which are exhaustiveness checks and not
findings. In specs: 38 assertions in 18 files, 35 without the comment STYLE.md
requires on the line.

**Definition or assertion (author, 2026-11-10).** `as const`, `as readonly`
widenings and `never` checks define a type and cannot be wrong, so they are
not findings. Only a narrowing claim the compiler cannot check counts. Of the
rows below, the three "widening a literal tuple" rows are definitions and are
withdrawn as findings (two were removed anyway in `3faf0e1`, whose message
wrongly says four casts). What remains is ten narrowing assertions.

Original list, grouped by how concerning they are:

| Concern    | Site                                                                                                            | What it hides                                                                                                                                                                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **High**   | `transforms/stateTransitions/applyEvent.ts:62` (`event as Event`)                                               | A seat's event stream stores projected events whose card reads `'hidden'`, typed as concrete cards. Anything that reads a client's stream trusts a field that may not be a card.                                                                              |
| **High**   | `transforms/pureTransforms/visibility/projectGameForVisibility.ts:31,46,61`                                     | The switch on `visibility` does not narrow the generic `V`, so the cast asserts each branch built the right slice. A branch that built the wrong one would typecheck. The entities README justifies the visibility parameter as the thing that removes casts. |
| **Medium** | `application/useCases/startNewGame.ts:68`                                                                       | The empty state is cast to authoritative. A symptom of 3.3: start-up should call `createInitialGameState`, which already returns the authoritative type.                                                                                                      |
| **Medium** | `application/useCases/requestGameStateSnapshot.ts:66`                                                           | `isAuthoritativeGameState(game.gameState)` narrows the field, not the game, so the game is cast. A guard on the game would remove it.                                                                                                                         |
| **Low**    | `queries/unit/isDefenseStat.ts:17`, `getLegalCommitToMeleeEvents.ts:21`, `getLegalCommitToMovementEvents.ts:22` | Widening a literal tuple for `.includes`. `.some((x) => x === stat)` needs no cast.                                                                                                                                                                           |
| **Low**    | `entities/unit/unitStat.ts:31`                                                                                  | `{}` cast, then filled in a loop to build the schema shape. Also a mutation and a loop in a declarations module.                                                                                                                                              |
| **Low**    | `entities/board/{small,standard,large}Board/*Coordinates.ts`                                                    | A computed coordinate list cast to its template union, each with a comment saying why it is safe.                                                                                                                                                             |

In specs: 46 assertions in 25 files, 34 without the comment STYLE.md requires
on the line.

### 3.2 Faults answered as game facts

**Status (`417a2cb`): closed.** Production code now has five `catch` blocks,
every one a boundary:

- `validatePlayerChoice`, `eachCardPresentOnce` and `eachUnitPresentOnce`,
  which build a `ValidationResult` through `failFromFault` and keep the
  fault's own message (`b150072`);
- the two in `application`, which wrap callbacks that are not this code
  (`updateGameState`, `startNewGame`).

Everything beneath throws at the site that found the fault. What went, in
order: the per-choice validators (`b150072`), the movement predicates
(`662d613`), the unit-position, target-scan and setup-zone catches, with a
total `findPositionOfUnit` for the real absence (`4118077`), the unit
comparators and `hasEnemyUnit` (`2e3cc13`), `getLegalAssignUnitSupport`'s, with
`isAwaitingUnitSupport` asking the question (`6b6135e`), and
`getLegalPlayerChoiceOptions`' eleven, with `findExpectedEvent` answering
"nothing is owed" for a finished game so the check is written once
(`c118a34`, `417a2cb`). The earlier hand-lookup catches went in `c2fe2b0`.
A caller of `getLegalPlayerChoiceOptions` gets a raw throw from a faulty
state; the response is composed by the server, except in the covered cases
(author, 2026-11-11).

- **`getLegalPlayerChoiceOptions`:** `softEvents` and the per-branch `catch`
  fallbacks turn any fault beneath it into "no legal options". A UI or bot
  sees a stall, not an error.
- **Legality:** 19 catches in 14 files. The three in `unitMovement/` are
  marked. Unmarked:
  - `isUnengagedUnit`, a whole-body catch (`canUnitRangedAttackTarget.ts`);
  - sixteen per-call catches, which come in two kinds:
    - _Hand lookups_ returning `null` for a hidden seat: the four
      `getLegalCommitTo*`, `getLegalRoutDiscardCards`, `getLegalMoveUnits`,
      `getLegalRangedAttackers` and `getLegalAssignUnitSupport`. These are a
      fair visibility negative, but they catch every fault in the call.
    - _Unit and phase lookups_ that skip: `getLegalMoveUnits:93`,
      `getLegalRangedAttackers:93`, `getLegalRangedAttackOptions:47,92`,
      `getLegalSetupUnits:53`, `getLegalAssignUnitSupport:49,68`.
  - A single "may this seat see that hand" query would replace the first
    kind.
- **Procedures:** `generateTriggerRoutFromRetreatEvent` (D5) and
  `generateResolveRetreatEvent` choose a branch by catching.

### 3.3 Missing callers

**Status (`417a2cb`):** closed are `getOtherPlayer`, `getNeighbourSide`, the
rally-player query (`getRallyingPlayer`) and the commitment hand walk, as
Section 4 records. Open:

- `createInitialGameState` still has no production caller. `startNewGame`
  builds with `createEmptyGameState` and parses the result, which removed the
  cast but not the duplication.
- The "next open apply in resolution order" selection is still written by hand
  (`findNextMeleeDefendingPlayer` carries the `TODO(composition)`).
- The melee defender-to-slot ternary in the three writers belongs to the
  writer question.

Read as what should be calling these, not as dead code:

- **`createInitialGameState`:** application start-up builds an empty state
  per mode and attaches placeholder armies (`startNewGame.ts`) instead. Using
  it gives start-up the real armies and removes a cast (3.1).
- **`getIsFirstPlayerForResolveRallyStep`:** "which player is rallying" is
  worked out by hand from the step literals in
  - `generateResolveRallyEvent`,
  - `getLegalAssignUnitSupport` (×3),
  - `getExpectedCleanupPhaseEvent`,
  - `applyChooseRallyEvent`.
- **`getNextMeleeRoutState`:** the "next apply still open, in resolution
  order" selection is written by hand in `findNextMeleeDefendingPlayer` and in
  the closing loop of `getExpectedMeleeResolutionEvent` (marked).
- **`getNeighbourSide`:** `getMeleeSupportValue` classifies a neighbour as
  front or flank by hand.
- **`getOtherPlayer`:** hand-rolled in `getWinnerFromUnpayableRoutDiscard`
  (marked) and `generateTriggerRoutFromRetreatEvent` (unmarked).
- **The melee defender-to-slot ternary in the writers:** `updateReverseState`,
  `updateRoutState` and `updateRetreatState` each choose the slot by hand.
  The routers' copies (`findRetreatState`, `findRoutLocation`) are the
  descent the README accepts as the price of a total router. The writers'
  copies belong to the open writer question in 1A.
- **The hand walk behind a commitment** (card filter, hidden-hand refusal,
  decline option): four copies, in `getLegalCommitTo{Movement,Melee,
RangedAttack,RangedDefense}Events`. The accepted-stat lists are declared a
  second time in the event schemas.
- **Design shape with no caller, fine as is:**
  - `hasUnitInSet` and `setWithoutUnit` (set counterparts of the array
    helpers);
  - `getCurrentStep` and `getRallyResolutionState` (reads a consumer may
    want);
  - the scoped rout getters (`getRangedAttackRoutState`, `getMeleeRoutState`,
    `getRearEngagementRoutState`, `getRallyStepRoutState`), which serve a
    caller an event has told where it is. The triggerRoutFromRetreat
    transform is the kind of caller they are for.

### 3.4 Long modules

Excluded: barrels, and routers or switches whose branches only dispatch
(`procedureRegistry`, `applyGameEffectEvent`, `applyPlayerChoiceEvent`).

| Module                                                                        | Lines   | Why it is long                                                   |
| ----------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `validation/playerChoice/getLegalPlayerChoiceOptions`                         | 465     | Router, but each branch hand-rolls catch-and-fallback (3.2)      |
| `queries/sequencing/combatOutcomes/rout/findRoutLocation`                     | 219     | A total router over five parents; the README accepts its descent |
| `expected/expectedEvent/byPhase/getExpectedIssueCommandsPhaseEvent`           | 217     | First- and second-player branches mirror each other by hand      |
| `validation/playerChoice/isValidIssueCommandEvent`                            | 208     | Units and lines in one function                                  |
| `validation/playerChoice/isValidAssignUnitSupportEvent`                       | 196     |                                                                  |
| `transforms/pureTransforms/sequencing/updateRoutState`                        | 158     | Second descent (3.3)                                             |
| `queries/unit/getRawUnitStat`                                                 | 151     | Terrain stub, round effect, command, commitment in one body      |
| `transforms/stateTransitions/applyEffects/movement/applyStartEngagementEvent` | 149     | Three engagement types plus rider                                |
| `validation/gameState/eachCardPresentOnce`                                    | 144     |                                                                  |
| `legality/choiceOptions/issueCommand/getLegalUnitsForIssueCommand`            | 142     | Five exports                                                     |
| The four `getLegalCommitTo*Events`                                            | 109–125 | The repeated hand walk (3.3)                                     |
| `generateResolveMeleeEvent`                                                   | 124     |                                                                  |
| `getLegalRangedAttackers`                                                     | 119     |                                                                  |
| `applyResolveRallyEvent`                                                      | 117     |                                                                  |
| `applyCompleteUnitMovementEvent`                                              | 112     |                                                                  |
| `getExpectedEngagementEvent`                                                  | 111     |                                                                  |
| `startNewGame`                                                                | 111     | 3.3                                                              |
| `generateResolveRangedAttackEvent`                                            | 110     |                                                                  |
| `getMeleeSupportValue`                                                        | 105     | 3.3                                                              |
| `updateRetreatState`                                                          | 104     |                                                                  |
| `getLegalMoveUnits`                                                           | 103     |                                                                  |
| `applyResolveRetreatEvent`                                                    | 101     |                                                                  |
| `getLegalRangedAttackOptions`                                                 | 101     |                                                                  |

Also over 100 lines:

- `isValidSetupUnitsEvent` (116), which belongs to the deferred setup work.
- In `@testing`: `procedureRegistryStateFactories` (573), `cardHelpers` (186),
  `attackApplyStates` (157), `unitHelpers` (153).

Several of the long modules shrink on their own once the 3.3 helpers are
called.

### 3.5 Commentary and headers

**Status (`417a2cb`):** in-body commentary is source 12% and specs 3%, as
before. Thinnest now: sampleValues 1%, testing 3%, application 5%,
transforms 6%, procedures 7%, validation 8%. About 744 `it` titles begin with
"should" or "given". The header counts below were not recounted; the router's
seven local helpers and every one of its cases now carry commentary.

- **In-body commentary** (`pnpm check:commentary`): source 12%, specs 3%,
  against 25%.
  - Thinnest: validation 4%, procedures 6%, transforms 6%, application 7%,
    factories 10%.
  - Strongest: entities 47%, game 32%, events 30%.
- **Where comments carry the rule:** the S3–S21 code. Good models are
  `isRetreatCutOff`, `getSmallestRetreats`, `canUnitRangedAttackTarget` and
  the gameOver queries.
- **Where they name the operation:** older modules. `getMeleeSupportValue` is
  the clearest case: it never states the +2 / +1 / nothing rule it exists for,
  and it has no header.
- **Headers missing on exported functions (10):**
  - `getMeleeSupportValue`, `diagonalIsClear`
  - `getLegalCommanderMoves`, `exploreCommanderMoves`,
    `getLegalChooseMeleeResolutionEvents`
  - `eachCardPresentOnce`, `eachUnitPresentOnce`
  - `commitmentFromCommittedCard`
  - `addCommanderToBoard`, `removeUnitFromReserve`
- **Headers missing on local functions:** 32, of which 20 are in validation.
- **Specs:** about 750 `it` titles begin with "should" or "given".

### 3.6 Documents

**Status (`417a2cb`):**

- ENGINES: generator count and validation order corrected (`7968990`); the
  `commit*` fold claim is now true (D4 fixed); the expected and router
  sections describe `findExpectedEvent` and the raw throw.
- RULEBOOK appendix revisited: B7 states the reveal-time judgment, the
  movement-check catches entry is closed, and the dead `AUDIT.md` pointers
  and slice labels are explained or dropped.
- `AUDIT.md` lost its stale links and the event-number mention. The deleted
  audit files (`AUDIT_FINDINGS.md`, `SLICES.md`, `TESTING_CHECKLIST.md`) are
  deleted in the working tree and not yet committed.

- **ENGINES.md:**
  - says 27 generators where the registry has 28;
  - claims the `commit*` fold (D4);
  - "two separate questions" omits the schema parse between them.
- **`boundaries.ts` comments:** line 140 says validation "always returns
  boolean"; line 108 calls procedures "deterministic". ENGINES.md contradicts
  both.
- **RULEBOOK appendix:**
  - B7 says Closed; see D2.
  - The "Engine findings" entry on `getNextStepForResolveRally` was fixed in
    S13 and is still listed.
  - A3 and A6 place the terrain stub and the range duplicate in
    `getCurrentUnitStat`; both are in `getRawUnitStat`, and the terrain stub
    no longer carries a mark.
  - Entries cite SLICES.md slice numbers, which now point nowhere.
- **§9.1.5 "facing it":** `isRetreatCutOff` reads it as "the retreating unit
  is in the enemy's front spaces". So an enemy behind facing diagonally away
  still cuts off. The text and §13's "facing your unit" read narrower; settle
  one in the text.
- **Stale and safe to drop with the audit restart:**
  - `AUDIT_FINDINGS.md`, a self-described snapshot from 2026-11-02.
  - `src/domain/TESTING_CHECKLIST.md`, last reconciled 2026-08-07 and linked
    from `procedures/README.md` and AUDIT.md.
  - AUDIT.md's Open findings and baselines. Its `isEngagementFromFront`,
    line-rule, `updateRoutState` and catch-count entries are all already
    closed or changed.
  - The SLICES.md references in RULEBOOK.md, AUDIT.md and memory.

---

## 4. Order of work

**Progress:**

- Steps 1–3 are done, except D2's spec, which waits on the author, and the
  writer question in 1A.
- Step 4: the ENGINES generator count and validation order are corrected
  (`7968990`), along with the boundaries.ts comments, the RULEBOOK
  A3/A6 references, the closed `getNextStepForResolveRally` entry and the
  dead TESTING_CHECKLIST link in the procedures README.
- Step 4, left for the author:
  - B7, because D2 is deferred;
  - the ENGINES `commit*` fold, because D4 is open;
  - the §9.1.5 reading;
  - slice numbers in closed appendix entries;
  - AUDIT.md's dead link, a file with uncommitted edits.
- Step 5 is done:
  - `getOtherPlayer` (`da37c2c`);
  - `getNeighbourSide` in melee support (`1f38a4b`);
  - `getRallyingPlayer` for four callers (`d289430`);
  - one commitment offer list (`3faf0e1`), which also removes four
    `as readonly string[]` casts.
- Step 7, partly: `findOwnedPlayerCardState` replaces the hand-visibility
  catches in four enumerators (`c2fe2b0`).
- Still open:
  - step 6, the remaining legality catches, mostly in movement predicates
    and the ranged-attack enumerators;
  - step 7's casts, `applyEvent` and the visibility projection, with D4;
  - step 8;
  - in 3.3, the hand-written "next open apply" selection and
    `createInitialGameState`.

1. **Failing specs first:** D1 (the A-9 case), D5 (both melee units must
   retreat, only the second player's is blocked; it needs a probe before it
   counts as confirmed), D2 and D3.
2. **D1 at the rule level:** decide offer-or-rout, and consult
   `getLegalRetreats` when the retreat is offered.
3. **Complete the retreat family (1A):**
   - a retreat selection for the two procedures, covering shot, engagement
     and melee in resolution order;
   - the parent on `triggerRoutFromRetreat`, as `resolveRout` carries its
     source;
   - the four callers moved onto the kind of reader the README assigns them.

   This closes D1's composition half and D5. Then check reverse and
   attack-apply the same way, and settle the writer question.

4. **Documents in 3.6.**
5. **The 3.3 helpers that remain,** smallest first:
   - `getOtherPlayer`
   - `getNeighbourSide`
   - the rally-player query
   - the commitment hand walk
6. **The same reading for the choice side:** does each `getLegal*`
   enumerator use the reader kind its context calls for?
   `getLegalPlayerChoiceOptions`' catches suggest some walk with scoped
   getters where a `find*` would answer.

7. **3.1 and 3.2:**
   - `applyEvent`'s stored-event type and the visibility projection typing
     together, since D4 lives in the same seam;
   - then one "may this seat see that hand" query to replace the hand-lookup
     catches.
8. **3.5:** headers on the 10 exported functions, then commentary layer by
   layer as the audit restarts. Validation and transforms first.

---

## 5. Outstanding, prioritized (as of `417a2cb`)

**Policy for 3.2 (author, 2026-11-10).** Catch only in the validation layer,
which returns a `ValidationResult`. Elsewhere a fault is thrown and falls
through to its precise site, and no message may get less specific. Applied in
full; see 3.2.

### Closed since `5698dc6`

| Item                                                         | Commits                                           |
| ------------------------------------------------------------ | ------------------------------------------------- |
| D2 judged at the reveal                                      | `ec35d56`, `1d0ff68` (specs `a11f594`, `9348787`) |
| D3 withdrawn: events carry no number                         | `816ec1f`                                         |
| D4 a seat folds an opponent's commit and rout discard        | `9e5b563`, `8d76333`                              |
| A forged commit card with a real id and inflated stats       | `35ebc9c`, `f575951`                              |
| A seat's event log held the opponent's face-down choice      | `6f8af96`                                         |
| `event as Event`, visibility branches asserted               | `4603972`, `b22a7d4`, `1b26f9e`                   |
| `Game` is the authoritative record; viewers get a projection | `2ee6d4e`                                         |
| `startNewGame` cast, `requestGameStateSnapshot` cast         | `a58c37d`                                         |
| `unitStat` `{}`, coordinate lists, six unneeded casts        | `5b4e16f`, `31e3bb1`                              |
| 13 legality catch sites, `getLegalPlayerChoiceOptions`       | `662d613`, `4118077`, `6b6135e`, `417a2cb`        |
| 39 catches in validation, 6 in queries                       | `b150072`, `2e3cc13`                              |
| Standard starter armies priced (about 12 a unit, 8 a card)   | `82515dc`                                         |

### Still open

| Item                                                     | Where                                                                             | Note                                                      |
| -------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `submittedTime` on player choices as a replay record     | events, `applyEvent`                                                              | Agreed, not built. Do it before production.               |
| Writer question                                          | `update{Retreat,Reverse,Rout,AttackApply}State`                                   | Author's design call; the melee slot ternary belongs here |
| `createInitialGameState` has no production caller        | `startNewGame.ts`                                                                 | Start-up builds with `createEmptyGameState` and parses    |
| Hand-written "next open apply"                           | `findNextMeleeDefendingPlayer`, closing loop of `getExpectedMeleeResolutionEvent` | Duplicates `getMeleeAppliesInResolutionOrder`             |
| §9.1.5 "facing it"                                       | `isRetreatCutOff` against the text and §13                                        | Author to settle one reading                              |
| 38 spec assertions in 18 files, 35 without STYLE comment | specs                                                                             |                                                           |
| Headers on exported and local functions                  | see 3.5                                                                           | Not recounted                                             |
| About 744 spec titles beginning "should" or "given"      | specs                                                                             | STYLE                                                     |
| Commentary, layer by layer                               | validation and transforms first                                                   |                                                           |
| "See AUDIT.md" comments in source                        | `unitWithPlacement.ts`, `assignUnitSupport.ts`, `unitPlacement.ts`                | The file no longer holds those findings                   |

## 5A. Outstanding as written at `5698dc6`

Kept as it was written. Everything in it is either in "Closed since" or "Still open" above.

**Policy for 3.2 (author, 2026-11-10).** Catch only in the validation layer,
which returns a `ValidationResult`. Elsewhere a fault is thrown and falls
through to its precise site, and no message may get less specific. This
widens 3.2: the legality catches are candidates for removal in general, not
only the catch-alls.

### Priority 1: contract and correctness

| Item                                                              | Where                                                                                | Note                                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| D4 seated client cannot fold an opponent's commit or rout discard | `applyCommitCardDiscard`, `applyChooseRoutDiscardEvent`, `projectEventForVisibility` | Open defect. Shares a seam with the next two.                                |
| `event as Event`                                                  | `applyEvent.ts:62`                                                                   | Narrowing assertion; a seat's stream holds `'hidden'` where a card is typed. |
| `visibility` branches asserted                                    | `projectGameForVisibility.ts:31,46,61`                                               | Narrowing; the switch does not narrow `V`.                                   |
| D2 §11.3 unreachable                                              | `applyChooseCardEvent`, `getExpectedEvent`                                           | Author is re-evaluating.                                                     |
| Writer question                                                   | `update{Retreat,Reverse,Rout,AttackApply}State`                                      | Author's design call.                                                        |

### Priority 2: error handling (3.2)

| Item                                                  | Where                                                                                                                                                                                                                                    | Note                                                                                                                                   |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 13 legality catch sites in 9 files                    | `canMoveThrough` (marked), `canEngageEnemy` (marked), `canMoveInto`, `getLegalRangedAttackOptions` ×2, `getLegalAssignUnitSupport` ×2, `getLegalSetupUnits`, `getLegalRangedAttackers`, `canUnitRangedAttackTarget`, `getLegalMoveUnits` | Each needs a total `find*` for a real absence, or nothing.                                                                             |
| `softEvents` and per-branch fallbacks                 | `validation/playerChoice/getLegalPlayerChoiceOptions.ts`                                                                                                                                                                                 | Lives in validation but returns options to clients, so a fault reads as "no options". Author to say which side of the policy it is on. |
| 39 catches in validation                              | `validation/`                                                                                                                                                                                                                            | To inspect: keep one boundary catch carrying the precise message, drop nested re-wrapping. Not yet read.                               |
| 6 catches in queries, 2 in application, 1 in entities | `isAtPlacement` ×2, `hasEnemyUnit`, `isSame*` ×3; the use cases; one in entities                                                                                                                                                         | To inspect.                                                                                                                            |

### Priority 3: remaining narrowing assertions and duplicates

| Item                                                    | Where                                                                             | Note                                             |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| Empty state cast authoritative                          | `startNewGame.ts:68`                                                              | Fixed by calling `createInitialGameState` (3.3). |
| Game cast after a field guard                           | `requestGameStateSnapshot.ts:66`                                                  | A guard on the game removes it.                  |
| `{}` filled in a loop                                   | `entities/unit/unitStat.ts:31`                                                    | Also a mutation in a declarations module.        |
| Coordinate lists cast to template unions                | `entities/board/*Board/*Coordinates.ts`                                           | Three; each argues its safety in a comment.      |
| Hand-written "next open apply"                          | `findNextMeleeDefendingPlayer`, closing loop of `getExpectedMeleeResolutionEvent` | Duplicates `getMeleeAppliesInResolutionOrder`.   |
| Melee slot ternary in writers                           | `updateReverseState`, `updateRoutState`, `updateRetreatState`                     | Belongs to the writer question.                  |
| 46 assertions in 25 specs, 34 without the STYLE comment | specs                                                                             |                                                  |

### Priority 4: headers, commentary, documents

| Item                                                                      | Note                             |
| ------------------------------------------------------------------------- | -------------------------------- |
| 8 of 10 exported functions without headers                                | Rules language.                  |
| 32 local functions without headers                                        | About 20 in validation.          |
| About 750 spec titles beginning "should" or "given"                       | STYLE.                           |
| Commentary layer by layer                                                 | Validation and transforms first. |
| B7                                                                        | Waits on D2.                     |
| ENGINES claim that `commit*` events fold                                  | Waits on D4.                     |
| §9.1.5 "facing it"                                                        | Author to settle one reading.    |
| Slice numbers in closed appendix entries; AUDIT.md link and Open findings | Author's files.                  |

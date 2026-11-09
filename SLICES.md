# Slices

The behavioral backlog for the current pass, cut into vertical slices. Each slice
is one rule of the game brought into line with [`RULEBOOK.md`](./RULEBOOK.md):
it names the rulebook sections it serves, the appendix entries and marks it
closes, the files it touches, and the audit boxes in
[`src/domain/AUDIT.md`](./src/domain/AUDIT.md) it holds open. A box closes only
when no slice still touches its layer.

Discipline per slice is the fix discipline from
[`AUDIT_PROCESS.md`](./AUDIT_PROCESS.md): a failing spec stated from the
rulebook sentence first, then the change, commentary written with it. One slice
at a time.

**Deferred, not sliced** (out of scope for this pass): terrain (A3), elevation
(A16), hidden units (A17), line of sight (A18), and the setup sequence (A5).
A5's two one-line changes — starting initiative to White, deployment order —
are the only piece the appendix asks for now; they can ride as a standalone
micro-slice whenever convenient, since the rest of setup depends on them.

**Deferred by decision** (2026-11-08): what an enemy unit entering a
commander's space does — loss in combat may prove to be enough (RULEBOOK.md,
Deferred). No slice touches it.

---

## Cluster 1 — Endgame (§11) — warm-up

Two tiny, fully specified slices. Good for establishing the rhythm before the
movement rework.

**S1. Both hands empty goes to initiative** — §11.3, B7. **Done** (`51c5521`).
Files: `queries/gameOver/getWinnerFromEmptyHands.ts`.
Blocks: `queries/gameOver`.

**S2. No units left is a loss** — §11.4, B8. **Done.**
Files: `queries/gameOver/getGameOverWinner.ts` (new arm).
Blocks: `queries/gameOver`.

## Cluster 2 — Movement rework (§5–§6)

The big one. Every slice here rewrites or reads `exploreUnitMoves`, so the
order runs from the turning rule outward. The four catch-to-false
`TODO(wrong)`s in `legality/unitMovement/` (`canEngageEnemy`, `canMoveInto`,
`canMoveThrough`, `isLegalMove`) are not their own slice: each is fixed in
whichever slice rewrites its file, taking `isValidLine`'s report-the-fault
shape.

**Gate lifted 2026-11-08:** the exploration follow-ons are settled (A11).
Deltas on the event, compound atoms over the wire, movement stats sampled at
move-start. This cluster now runs **right after the warm-ups and before
Cluster 3**, because retreat events grow the same delta payload — specs built
against the old retreat shape would churn.

**Author's design note (2026-11-08):** `exploreUnitMoves.ts` is one of the
least readable files in the repo — too big, and confusing. The revamp should
land as bite-sized modules where feasible (the uniform two-edge walk invites
it: the edge rules, the fold, and the walk itself are separable), without
heavy argument plumbing. If small pieces would mean threading six parameters
everywhere, prefer a narrow explicit context value over either extreme.

**S3. A turn is 45° or 180°** — §5.2.1–§5.2.2, A2; AUDIT.md Movement item 1.
**Done** (`82f4a77`), together with S6 — one mechanism.
Turns repeat in any order within Flexibility; no more free 90° wheels. This
_simplifies_ the explorer: the turn-only-at-start-or-after-a-step
special-casing (`isTruePosition`) exists only because any-facing turns made
sequential turns meaningless. The rework is a uniform walk over
(space, facing, budgets) with two edge types — step, and turn to one of
three facings.
Files: `legality/unitMovement/explore/exploreUnitMoves.ts`.
Blocks: `legality/unitMovement`, `queries` (facings).

**S4. A diagonal step can end on an enemy** — §6.2.1, §5.4.5, A12. **Done.**
Check the destination with `canMoveInto`/`canEngageEnemy`, not
`canMoveThrough`.
Files: `legality/unitMovement/passage/checkDiagonalMove.ts`, `exploreUnitMoves.ts`.
Blocks: `legality/unitMovement`.

**S5. The squaring-up turn is made, not just checked** — §6.2.3, §6.3.1, A13.
**Done** (`getEngagementEndFacing` + the walk).
_Bug: 135° approach crashes._ Apply the turn and spend the point as part of
the engaging move, so `isEngagementFromFront` never sees 135°.
Files: `legality/unitMovement/engaging/canEngageEnemy.ts`,
`queries/engagement/isEngagementFromFront.ts`,
`procedures/.../generateStartEngagementEvent`.
Blocks: `legality/unitMovement`, `queries/engagement`, `procedures`.

**S6. Retreat turning follows the same rule** — §9.1.4, A14. **Done**
(with S3, `82f4a77`; spec-pinned post-step). Decided
2026-11-08: after the first step, §5.2.1 applies (45°/180°, repeatable); only
the opening turn keeps the 45° limit. Retreats go through `exploreUnitMoves`,
so most of the work is S3's.
Files: `legality/unitMovement/getLegalRetreats.ts` and the S3 files.
Blocks: `legality/unitMovement`.

~~S7. One blocked-diagonal rule~~ — **closed by decision, no slice.** A10
settled 2026-11-08: two rules by design — movement is blocked by what the
mover cannot pass through; support and commanders ask only the enemy question.
The engine already plays both; §2.4.4 now states it. What remains is the
`TODO(misleading)` comment on `diagonalIsClear` (Pass B) and distinct names
for the two tests someday (nomenclature, not design).

**S8. The trajectory rides on the move event, as deltas** — A11, §5.1.4;
AUDIT.md Movement item 2. Settled in full 2026-11-08: the `moveUnit` event
(and later the retreat choice, Cluster 3) carries the path **atomically as
deltas** — step, turn 45° either way, turn about — resolved to spaces by one
owned fold. A delta list cannot encode an illegal shape; a manual
turn/reverse/step client input produces the identical event an assisted UI
does. Legal moves reach the client as compound atoms (the existing
compound-choice pattern), never an enumeration of trajectories; validation
folds the submitted deltas through the same step/turn predicates. The mover
genuinely advances along its path — before an engagement is set up it stands
in the penultimate space, ending the half-applied move — but its **movement
stats do not travel with it**: Speed and Flexibility sample once at
move-start (§5.1.4), which the engine's stat read already does. Terrain later
binds to the trodden path (worst touched); worst only worsens, so per-delta
validation stays sound.
Files: `events/playerChoices/` (moveUnit payload — delta list),
`entities` or `events` (the delta vocabulary),
`transforms/stateTransitions/applyChoices/applyMoveUnitEvent.ts`,
engagement setup, the movement state in `game/substeps/commandResolution/`,
`legality/unitMovement/explore/exploreUnitMoves.ts` (shares its edges with the fold),
`validation/playerChoice/isValidMoveUnitEvent.ts` (fold validation).
Blocks: `transforms`, `queries` (unit stats), `expected`, `events`, `game`,
`validation`.

**S9. The mover commits before it moves** — §4.3.10, §8.4.1, A8. Ask for the
commitment before the destination; read it in the move search and the Speed
contest. The unreachable pending-commit branch becomes live. Comes after S8 so
the commitment is read from a settled position model.
Files: `applyMoveUnitEvent.ts`,
`legality/.../getLegalCommitToMovementEvents.ts`,
`expected/.../getExpectedMovementResolutionEvent.ts`, `exploreUnitMoves.ts`.
Blocks: `transforms`, `legality/choiceOptions`, `expected`.

**S10. A commander rides with its unit** — §4.3.10, §9.1.8, A9. Apply the
`moveCommander` flag; give retreats the same option. The engagement case is
decided 2026-11-08: the ride into an engagement is allowed — the one way a
commander ends in an enemy-held space; it is committed to the fight and falls
with its unit if that unit routs (friendly rout only; wired in S21).
Files: `applyMoveUnitEvent.ts`,
`validation/playerChoice/isValidMoveUnitEvent.ts`,
`events/playerChoices/chooseRetreatOption.ts`.
Blocks: `transforms`, `validation`, `events`.

## Cluster 3 — Rout, retreat, and phase traversal (§7.5, §9)

**Sequenced after Cluster 2** (re-ordered 2026-11-08): retreats run on the
same explorer, and the retreat choice event grows the same delta payload as
S8, so specs built here against the old shapes would churn. This is the
two-descents problem from AUDIT.md.

**S11. A rout held by a retreat can be paid** — §9.1.6, §7.5, B4. _Bug: the
game stalls._ Write through `updateRetreatRoutState`; close the retreat when a
zero penalty closes its rout. The failing spec is already described in the
appendix probe.
Files: `transforms/pureTransforms/sequencing/updateRoutState.ts`,
`queries/sequencing/combatOutcomes/rout/findRoutLocation.ts`,
`expected/.../getExpectedRetreatEvent`.
Blocks: `transforms`, `queries/sequencing`, `expected`.

**S12. Melee results run stage by stage** — §7.5.6, B9. Both retreats, then
both reverses, then both routs, first player first within each stage.
Files: `procedures/defenseResult/`, the melee-resolution sequencing in
`queries/sequencing/combatOutcomes/` and `expected/`.
Blocks: `procedures`, `queries/sequencing`, `expected`.

**S13. Sequencing gap fills** — the latent `TODO(wrong)`s that the two slices
above walk past: `getNextMeleeRoutState` returns a paid rout;
`getNextStepForResolveRally` defaults non-resolve steps to complete; rally is
offered on an empty played pile and then throws. Small, rides after S11/S12.
Files: `queries/sequencing/combatOutcomes/rout/getNextMeleeRoutState.ts`,
`queries/sequencing/rallyResolution/.../getNextStepForResolveRally.ts`,
`legality/.../getLegalChooseRallyEvent.ts`,
`procedures/.../generateResolveRallyEvent.ts`.
Blocks: `queries/sequencing`, `legality/choiceOptions`, `procedures`.

## Cluster 4 — Combat values and commitments (§7–§8)

Small, mostly independent slices. S15 mirrors S9's offer-before-choice shape,
so it reads best after Cluster 2 lands.

**S14. A melee Defence commitment defends** — §8.5, B3. Pass each side's own
commitment as that unit's defending modifiers.
Files: `procedures/resolveAttack/generateResolveMeleeEvent.ts`.
Blocks: `procedures`.

**S15. The shot's target may commit Defence; Range widens the arc** — §4.3.11,
§7.4.5, §8.4, B1 + B6. Separate accepted-stat lists for attacker and defender;
offer the Range commitment before the target is chosen and read it when
building the arc. Flexibility commitments stay offered and dormant until
terrain lands.
Files: `legality/.../getLegalCommitToRangedAttackEvents.ts`,
`legality/choiceOptions/performRangedAttack/`, `expected/` (commit ordering).
Blocks: `legality/choiceOptions`, `expected`, `procedures`.

**S16. Every stat floors at zero** — §7.1.4, B2. Decided 2026-11-08, and
wider than the old gate: all stats floor, applied once to the finished total,
never mid-sum (no floor-and-rebound). Watch the one wrinkle: the engine's −1
sentinel for an unrestricted inspiration range (A6) must be exempt from the
floor — latent today, since nothing modifies range.
Files: `queries/unit/getCurrentUnitStat.ts`,
`queries/attack/applyAttackValue.ts`.
Blocks: `queries/attack`, `queries/unit`.

**S17. A two-stat commitment gives both** — §8.2, B5. Decided 2026-11-08:
both at once; usable wherever it contributes something; contributes only what
the moment uses. The code already does all of this — the slice is proof: a
spec committing a two-stat card where one stat applies, and one where both do.
Files: `queries/card/modifiersFromCompletedCommitment.ts` (specs only).
Blocks: `queries/card`.

## Cluster 5 — Commands and lines (§4.2–§4.3)

Independent of everything above.

**S18. A line is any eight-unit window** — §4.3.5, A7. Keep the window rule,
retire the greedy left-first cap, and keep one statement of the line shape
(today there are three). This slice carries its own dedup.
Files: `legality/choiceOptions/issueCommand/getLegalLineEndsForIssueCommand.ts`,
`isValidLine.ts`, `queries/line/getLinesFromUnit.ts`,
`validation/playerChoice/isValidIssueCommandEvent.ts`.
Blocks: `queries/line`, `legality/choiceOptions`, `validation`.

**S19. An engaged unit breaks the line** — §4.3.5, A1. Treat an engaged unit
as non-qualifying at issue time everywhere: single-unit orders, line ends,
and line membership (`canJoin`) — a line stops where an engagement stands.
Decided 2026-11-08, superseding the same-day counts-toward-eight ruling; the
looser runs-past rule returns only if play-tests ask for it.
Files: `legality/choiceOptions/issueCommand/getLegalUnitsForIssueCommand.ts`,
`getLegalLineEndsForIssueCommand.ts` (incl. `canJoin`),
`validation/playerChoice/isValidIssueCommandEvent.ts`.
Blocks: `legality/choiceOptions`, `validation`.

**S20. Inspiration range speaks the card's language** — §4.2.7, A6. Add the
"all of a trait" range; keep one copy of the range test (it is written twice,
`TODO(composition)` in `getCurrentUnitStat.ts`).
Files: `entities/card/restrictions.ts`, `queries/unit/getCurrentUnitStat.ts`,
`legality/.../unitMatchesInspirationRange`.
Blocks: `queries/unit`, `legality/choiceOptions`, `entities` (reopens a closed
box — the only slice that does; keep it schema-additive).

## Cluster 6 — Commander defeat (§4.2.8) — unparked 2026-11-08

**S21. A commander falls where its army routs** — §4.2.8, A15 + A4. Defeat
costs nothing on its face — no discard, no Morale; the commander leaves the
board and every inspiration range in that hand reaches nothing. Call
`addCommanderToLostCommanders` from the combat rout path only (never the
support check), and only for the routing side's commander — a commander falls
to its **own** unit's rout, never the enemy's (settled 2026-11-08). Then make
an absent commander survivable everywhere one is read — the author flags
Phase 2 (Move Commanders) as likely unmodeled for an absent commander; probe
that first. A confirming spec for two commanders sharing a space (A4,
settled: allowed) rides along.
Files: `transforms/pureTransforms/commanders/addCommanderToLostCommanders.ts`
(gets its first production caller), the combat rout transforms,
`expected/expectedEvent/byPhase/` (Phase 2 with no commander),
`queries` (inspiration-range reads against a lost commander).
Blocks: `transforms`, `expected`, `queries/unit`, `queries/card`.

---

## What is not a slice

Pass B material — behavior-preserving, runs layer-by-layer once the clusters
touching that layer are done:

- The duplicate walks indexed in AUDIT.md: inspiration range (S20 takes it),
  units-on-board, the defender-to-slot ternary (7 copies), next-open-apply
  (3 variants), hand-rolled `getOtherPlayer`.
- Unused exports (`queries/sequencing`, `getLinesFromUnit` once S18 settles
  which rule lives).
- The `TODO(misleading)` / `TODO(composition)` marks in `factories`, `testing`,
  `events`, `entities` — commentary and naming, no rule at stake.
- The test rework onto `createGameState` / phase-state helpers, and the
  melee/rally specs that name a colour the default initiative supplies.
  One fixture gap found 2026-11-09: "black has a Shoot card in play, these
  units on the board" is hand-built in at least four specs
  (`isValidPerformRangedAttackEvent`, `getLegalRangedAttackers`,
  `getLegalPlayerChoiceOptions`, `applyCompleteRangedAttackCommandEvent`).
- `getMeleeSupportValue` classifies a neighbour as front or flank by hand;
  `getNeighbourSide` (queries/board/adjacency) now answers that.

### Module size and shape (inventory 2026-11-09)

The standard: one primary export per file (STYLE.md), and a module short
enough to read in one sitting — the movement area was cut to under 100 lines
a file. `legality/unitMovement` meets it. Elsewhere, outside the declaration
layers (where a type and its schema share a file by design):

**Split inside the slice that rewrites it** — splitting first would be
churn: `isValidIssueCommandEvent` (246 lines; S18/S19),
`getLegalLineEndsForIssueCommand` (120, two exports; S18/S19), `isValidLine`
(102; S18), `getLegalUnitsForIssueCommand` (119, five exports; S19),
`findRoutLocation` (219), `updateRoutState` (152) and `updateRetreatState`
(104; S11), `getExpectedAttackApplyEvent` (109; S12), `getCurrentUnitStat`
(143; S16/S20), `getLegalCommitToMovementEvents` (125; S9),
`generateResolveMeleeEvent` (123; S14), `getLegalCommitToRangedAttackEvents`
(106; S15), `applyMoveUnitEvent` (107) and `applyStartEngagementEvent`
(111; S8).

**Pass B, layer by layer** — no slice touches them:

- Over 100 lines: `getLegalPlayerChoiceOptions` (377),
  `getExpectedIssueCommandsPhaseEvent` (217), `isValidAssignUnitSupportEvent`
  (196), `procedureRegistry` (154), `eachCardPresentOnce` (144),
  `eachUnitPresentOnce` (140), `applyGameEffectEvent` (135),
  `applyResolveRallyEvent` (117), `isValidSetupUnitsEvent` (116; setup is
  deferred, so leave it with the setup work), `getLegalRangedAttackers`
  (111), `startNewGame` (111, application), `getLegalCommitToMeleeEvents`
  (109), `getExpectedEngagementEvent` (109), `getMeleeSupportValue` (105),
  `getLegalMoveUnits` (103).
- More than one runtime export: `queries/engagement/engagement.ts` (4; AUDIT
  already says a split is due), `legality/game/refineGameRules` (6),
  `getLegalRangedAttackOptions` (2), `canUnitRangedAttackTarget` (2),
  `legality/army/*` (three files of 2), `attackApplyContext` (2),
  `commitApplyHelpers` (2), `queries/board/deltas` (2),
  `coordinateLayoutMap` (2), `application/utils/parseStoredGame` (2), and
  most `@testing` helper files (families of 2–5 builders each).
- Not counted as violations: catalogs whose many exports are one list —
  `ruleValues`, `traits`, `gameEffectTypes`, the `sampleValues` stand-ins,
  `utils/stateSentinels`. **Open question for the author:** a `getLegal*`
  file that exports its result interface beside the function (twelve
  files, e.g. `getLegalMoveUnits` with `LegalMoveUnits`) — is the result
  type a second primary export, or part of the function's own surface?

## Decision gates, collected

All questions answered as of 2026-11-08, over two rounds; the decisions are
recorded in RULEBOOK.md (body where the rule lives, appendix entries A1, A4,
A9, A10, A11, A14, A15, B2, B5, B8, and the Open design questions section).
The second round settled: only a friendly rout in combat fells a commander;
an engaged unit breaks the line (a deliberate retraction of the first round's
counts-toward-eight ruling, pending play-tests); enemy-unit-enters-commander-
space deferred. The third round (same day) settled the exploration
follow-ons: the player owns the path; it rides the event as deltas; legal
moves go out as compound atoms, never a trajectory enumeration; movement
stats sample once at move-start (§5.1.4, superseding the penultimate-space
reading); pass-through grants nothing; terrain will bind to the trodden
path, and worst-only-worsens keeps per-delta validation sound.

**Nothing remains open.** The working order is: Cluster 1 warm-ups, the
Cluster 2 movement campaign (S3 core first, S8 payload second, S4/S5/S6/S9/
S10 on the settled core), then Clusters 3–6.

## Box map

Which audit boxes each cluster holds open, so the human read can follow the
slices in:

| Audit box                                                                      | Held open by                                         |
| ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `queries/gameOver`                                                             | Cluster 1                                            |
| `legality/unitMovement`, `queries/engagement`, `queries/facings`               | Cluster 2                                            |
| `transforms`, `expected`                                                       | Clusters 2, 3, 6                                     |
| `queries/sequencing`, `procedures`                                             | Clusters 3, 4                                        |
| `queries/attack`, `legality/choiceOptions`                                     | Clusters 4, 5                                        |
| `queries/card`                                                                 | Clusters 4, 6                                        |
| `queries/line`, `validation`                                                   | Cluster 5                                            |
| `queries/unit`                                                                 | S16, S20, S21                                        |
| `entities`                                                                     | S20 (schema-additive only)                           |
| `events`, `game`                                                               | S8 (trajectory payload), S10                         |
| `queries/board`, `factories`, `testing`, `sampleValues`, `utils`, `ruleValues` | no slice — readable as soon as Pass B passes through |

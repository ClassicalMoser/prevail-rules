# Audit findings

Record of a session's measurement, 2026-11-02 to 2026-11-04. Draft: fold what is
worth keeping into [`src/domain/AUDIT.md`](./src/domain/AUDIT.md) and delete the rest.

These numbers are a dated snapshot, not a dashboard. They are here to show why a
decision was made, and they are not meant to be re-measured or tracked. Once the
fixtures are in place and the standard holds, a spec that does not meet it should be
visible by reading it.

## Where the audit actually stands

**31% done by volume, not 55% by checkbox.** 56 of 101 boxes closed, but the closed
packages average 0.03 test lines per source line and the open ones average 2.0. The
rate was 2.6 boxes/day through 2026-09-29 and 0.15/day after, because declarations
ran out and behaviour began. That is a cost discovery, not a stall.

**36 leaf scopes remain**, not 45; nine are parents that close with their children.

**Category A — the Aug 7–8 push.** 12 commits, 265 files, +12,673/−2,306 in two
days. 86% of it landed in `validation` (+3,888), `legality` (+3,485), `transforms`
(+2,642), `expected` (+622), `procedures` (+268). All five still unaudited, and
dependency order reaches them last. The risk-bearing surface is **106 source files,
7,142 lines, in about twelve repeating families** — not 30,000 lines.

## The core problem

Nothing in the repo can contradict the code. Tests were written against it, both
rulebooks were generated from it, the docs describe it. The author's reading is the
only artifact in the system that can disagree — which is why it cannot be delegated
and why it is exhausting.

Both `RULEBOOK.md` and `RULEBOOK-draft.md` landed essentially whole (0 → 686 → 1,388
lines in one day; 1,099 lines in one commit). There is no hand-authored
specification. `RULEBOOK-draft.md` Part II has 143 numbered rules and a `§N.N.N`
citation convention; nothing in `src` cites one.

## Instruments that exist and do not work

**Mutation testing is dead.** TypeScript 7.0.2 removed `ts.parseConfigFileTextToJson`
and `ts.readConfigFile`; Stryker 10.0.0 calls the first unconditionally when a
tsconfig is present. It fails in ~1.5 seconds regardless of scope, checkers or
config, so the nightly 4-shard cron has been crashing every night. One datapoint
before it died: 73 lines → 56 mutants, so category A is ~5,500 mutants, roughly
35–40 minutes at concurrency 4. Scoped to the vibecode it was always tractable.

This turned out to be upstream of three separate decisions: whether the rule corpus
is complete, whether the test suite can be reorganised, and whether coverage can be
measured at all.

**No coverage demand exists.** No thresholds in `vitest.config.ts`, coverage never
runs in CI (`ci.yaml` runs `pnpm test`). Adjacency is standing in for a metric: 323
of 345 in-scope domain modules have a colocated spec (94%).

**No test plays a game.** Zero specs call `advanceUntilPlayerChoice`, zero loop to
game over, no recorded games exist. A regression in composition — which is where
rules live, since no single function implements a rule — is invisible by construction.

## Machinery already built and unused

- `prevail-server` has a complete in-memory `EnginePorts` (4 adapters, ~193 lines,
  245 lines of tests) and `drainToPlayerChoice`, a driver loop with a
  `missing/ready/gameOver/stuck` state machine.
- A full bot: a picker per choice type, `takeBotTurns`, `sampleEitherSideChoice`.
- `gameEffects` (24) and `playerChoices` (16) are canonical iterable tuples — the
  engine's complete behavioural vocabulary, so coverage over it is checkable.
- `GameStateForVisibility` across four regimes, so one transcript renders as test,
  seat view, or spectator view.
- `RoundState.events` carries the round's event stream on the state.
- `UnitPlacementSpec` + `createGameState`: a compact placement shorthand, used in
  **8 specs** while 58 hand-place via `addUnitToBoard` and 39 write placement literals.
- `DESIGN.md` states about six invariants — purity, immutability, validation never
  throws, replayability — with no test behind any of them.

## Live defects

- **`tinyStarterArmy` ships 6 command cards where Mini requires 8** (4 initiative
  values × `MINI_ARMY_CARDS_PER_INITIATIVE_COUNT = 2`). It asks for 7 by name and
  `'Rally'` is not among the 25 cards in `tempCommandCards`; a silent
  `.filter(c => c !== undefined)` drops it. Exported from the public barrel. **There
  is no legal playable army anywhere in the project.**
- **The validator throw channel.** All 16 `isValid*Event` wrap their `getLegalX` call
  in a blanket try/catch returning `result: false` with `'Unknown error'`. Upstream:
  14 throw sites in `@legality`, 58 in `@queries`. **15 of 16 specs never simulate a
  dependency throw**, so a real bug in any of ~72 sites presents to the player as
  "that is not a legal choice". `AUDIT.md` already records one instance of this shape.
- **`AUDIT.md`'s movement item 2 is a defect, not a rule question** — "the mover
  stays on its start hex while the target is stored beside it, so the move is only
  half-applied". It sits in an unsettled-rules bucket where it will not get fixed.
- **`getCurrentUnitStat` has a terrain step that adds nothing** (already recorded).
  Terrain is declared (`terrainTypes`, `waterCover`, `boardSpace`) but unmechanised:
  `lineOfSight`, `speedLimit`, `flexibilityThreshold`, `deficit` have 0 references.
- Three of four repos have no CI at all.

## What makes reading expensive

**`queries/sequencing` — the scope that took six weeks.** 40 modules, 1,067 impl
lines, 2,142 spec lines. About 61 lines across 4 modules have a statable gameplay
reason; ~1,000 lines in 36 modules exist to navigate the state union. Three
narrowers are character-identical bar a slice name, type and error string. Five
`get*PhaseState` modules differ only by a phase literal. `findRetreatState` searches
three locations by try/catch with swallowed failures.

Not careless authoring: the state shape requires a distinct accessor per (path,
slice) pair. The game has one retreat rule; the code has five ways to reach a
retreat state because five code paths arrive at one.

**Two cheap predictors, before opening a scope:**

1. Do the module names describe gameplay, or state access? Access scopes do not
   accumulate in a reader's head; their useful output is a design finding.
2. How many local helpers do its specs each redefine? Specs that share no vocabulary
   give no second reading cheaper than the first.

## Commentary

```
file-header blocks      275 lines in 33 files (6% of modules)
function JSDoc        5,216 lines
in-body commentary      764 lines  = 3.8 per 100 code lines
```

`STYLE.md`'s "25% is not too much" was meant for in-body and is being satisfied by
JSDoc. In-body by package: `expected` 11.1, `factories` 11.2, `queries` 8.9,
`legality` 8.9 — against `validation` 2.2 (and 8% doc, half the next lowest),
`procedures` 2.4, `transforms` 2.5, `testing` 0.0. The two thinnest logic packages
are the two largest blocks of category A.

Declaration packages sit near zero in-body, correctly.

## Tests

**The helpers exist and are bypassed.** `createGameState` with a placement spec in 8
specs against 58 hand-placing and 39 writing literals; 57 specs hand-build a phase
state the helpers already build; 50 lines assign into state directly, which
`DESIGN.md` rules out.

**The missing layer is situations, not values.** `@testing` is organised by value
type — `createBoard/`, `phaseStateHelpers/`, `unitHelpers`, `cardHelpers`. Specs
need situations, and that axis has no home, so each spec assembles its own:

```
29 helpers duplicated across 53 spec files, 75 definitions, 1,169 lines
  createStateWith{Melee|RangedAttack}{Apply|Retreat|Rout|Reverse}   8 names, 23 copies
  phase-step positioners (createGameStateIn*Step, withCleanup, …)   7 names, 18 copies
  visibility projections (whiteSeen, blackSeen, secretPiles)        3 names,  6 copies
  placed                                                                      5 copies
```

They never got promoted because `STYLE.md`'s trigger is "the same helper in a second
suite" and each author names their situation differently, so the duplication is
invisible without grepping by body. The combat-outcome family is the **same 2×4
matrix** as the `combatOutcomes` narrowers: the state shape forced a matrix in
production and independently forced one in the fixtures.

**`@testing` composes little.** 11 imports from `@factories`, 4 from `@transforms`,
against 65 object spreads and 28 bare `return {`. `phaseStateHelpers/` (19 functions)
imports neither. The fabricators are not redundant with the transforms — they make
values, transforms place them — but `createRetreatState` hard-codes
`legalRetreatOptions` at E-4 and E-6, which `getLegalRetreats` is supposed to compute.

**Testability tracks signature shape.** 184 decomposed parameters against 113
`GameState` parameters. `eachUnitPresentOnce(whiteArmy, blackArmy, board,
routedUnits)` is cheap to test with any routed pile; a function taking `GameState`
can only be tested with states `@testing` knows how to declare.

**Weak-test tells are absent.** 0 skipped, 0 snapshots, 0 `not.toThrow`, 311
`toBe(false)` against 267 `toBe(true)`, 298 `toThrow`. All 16 validators compare
every discriminating field of their event schema (checked mechanically against the
zod schemas). The suite's problem is readability and provenance, not vacuity.

## Settled this session

- **Gate, not debt.** "Do not ship code I have not read" is forward-looking and
  costs the diff. The audit turned it into a backlog to retire, which is what made
  it infinite. Nothing is shipped yet, so the gate is not in violation.
- **Dependency order is right for comprehension.** Risk order is right for a merge
  gate. They are different jobs and want opposite orders.
- **Colocation stays, and density is the feature.** The dense suite is a
  blast-radius detector, not a specification; that job needs it dense and shaped
  like the code. Invariants and rules are additive, not replacements.
- **Explicit over optional** — `EnginePorts.random` is required.
- **Reporting is inline.** `TODO(wrong|misleading|composition)` marks where the work
  is; a claim beside its subject is checked by glancing. Zero existing
  TODO/FIXME/HACK in `src`, so the namespace is clean.
- **Commentary is additive only.** Never overwrite an authored comment; always write
  a missing one. In-body is the target; JSDoc is the practice and stays.
- **A comment must be legible to a reader who does not know the code.** Not
  "gameplay meaning" — `Navigates: MeleeResolutionState -> AttackApplyState ->
RetreatState` is accurate and useless.
- **Test config is necessary**; judge it by composition, not volume.
- **Prefer signals expensive to fake.** Adjacency, passing tests and line coverage
  are free to a machine. A rule cited to a test, or a surviving mutant, is not.

## Open

- `STYLE.md`'s 25% needs restating as in-body, and the JSDoc question resolved in
  `STYLE.md`'s favour.
- `createRoutes` lost its only spec with the route-count assertion; nothing now
  catches a dropped registry spread.
- The rule-corpus idea is unproven — no flow has been written, and the only number
  that matters (what a flow costs) does not exist.
- Closure needs two instruments: coverage over the 24 effect types and 16 choice
  types, and mutation score scoped to rule-bearing code. The second is dead.

All confirmed. Now I have everything I need for the writeup.
Test Suite Audit

I read 44 test files across the full codebase. Below is every problem found, organized by type, with a quality baseline at the end for comparison.
Confirmed: AI-generation markers

getCurrentUnitStat.test.ts:1 — the only file that's self-labeled:

// TODO: Generated test suite: still needs manual review.

This one is explicit. The structural patterns below appear across other files that don't announce themselves.
Category A — Description/Assertion Mismatch

These are the most dangerous because they create false confidence. The test runs green but isn't verifying what it claims to.
A1 — getMeleeSupportValue.test.ts:28

Description: "should filter out units that are behind the primary unit"

Assertion:

expect(supportValue).toBeLessThanOrEqual(1); // Should be 0, but allowing 1 if there's a positioning quirk

The test says filtering is happening. The assertion allows the filtered unit to still contribute (value = 1). The comment admits the uncertainty. This test cannot fail for the scenario it claims to test. If the support unit is not filtered, the test still passes. This is the clearest false-confidence test in the codebase.
A2 — getMeleeSupportValue.test.ts:348

Description: "should sum multiple weak support units when no strong support exists"

Setup comment: // Should sum weak support: 1 + 1 = 2

Assertion:

expect(supportValue).toBeGreaterThanOrEqual(1);

The description says 1+1=2. The comment even says 2. The assertion accepts 1. This test passes if only one of the two units provides support — i.e., if the summation is broken, the test still passes. Same root cause as A1: the author was uncertain about the geometry and hedged.
A3 — generateCompletePlayCardsPhaseEvent.test.ts:33

Description: "should return the same event regardless of state"

Setup:

const state1 = createGameStateInCompleteStep();
const state2 = createGameStateInCompleteStep();

Both states are created by the exact same helper with no variation. The test proves the function is deterministic with identical input — that's a tautology. It says nothing about state independence. To actually test "regardless of state," you'd need two meaningfully different states (different initiative, different card state, different round number, etc.).
A4 — createEmptyGameState.test.ts:33

Description: "should have awaitingPlay and inPlay cards set"

Assertions:

expect(gameState.cardState.black.awaitingPlay).toBeDefined();
expect(gameState.cardState.black.inPlay).toBeDefined();
// ...

toBeDefined() passes for null. If createEmptyGameState initializes these to null (no card chosen yet), this test passes and says nothing meaningful. "Cards set" is meaningless if null satisfies it. This test should assert the actual expected values — null, or a specific card, or whatever the correct initialized state is.
A5 — createEmptyGameState.test.ts:42

Description: "should return a valid GameState type"

Assertions:

const \_typeCheck: GameState<StandardBoard> = gameState;
expect(\_typeCheck).toBe(gameState);

This is a TypeScript compile-time check disguised as a runtime test. \_typeCheck is a reference alias — expect(\_typeCheck).toBe(gameState) is structurally equivalent to expect(gameState).toBe(gameState) and will always be true. The entire test exists only to make the TypeScript compiler happy, but the expect line contributes zero runtime verification. The compile-time check is valid; the expect is noise and misleads the reader into thinking there's runtime coverage here.
Category B — Structural Defects
B1 — getOtherPlayer.test.ts:12

The error case test is orphaned outside the describe block:

describe('getOtherPlayer', () => {
it('should return the other player', () => { ... });
}); // ← describe closes here at line 10

it('should throw an error when an invalid player side is provided', () => { // ← line 12: top-level it
...
});

The test will still run (Vitest allows top-level it), but it's not grouped with the other tests. This is a hallmark brace-counting error from AI generation.
Category C — Vacuous / Unconstrained Assertions

Tests that can't fail for the scenario described.
C1 — getMeleeSupportValue.test.ts (both A1 and A2 above)

Already documented. The toBeLessThanOrEqual / toBeGreaterThanOrEqual pattern throughout this file is a signal the generator didn't understand the expected values.
C2 — testing/phaseStateHelpers/engagementStates.test.ts

Several tests check toBeDefined() on properties that are set unconditionally by factory functions. For example, checking that routState is defined when the factory is literally named createRearEngagementState(). If the factory is broken, the assertion catches it — but only if it returns undefined rather than throwing, which is unlikely.
Category D — Misleading or Incomplete Tests
D1 — getMeleeSupportValue.test.ts:28 (the "behind" test)

The comment says: // Support unit is behind (south of) primary unit facing north but then places the support unit at E-6 with facing: 'north'. The same coordinate (E-6) and facing appear in tests throughout the file for flanking support. The comment says "behind" but the position and facing may actually be a flanking position — which is exactly why the assertion was hedged to <=1. The test setup and the description are telling contradictory stories.
D2 — applyCommitToMovementEvent.test.ts

Only one test case for a function that processes two players. Compare to sibling files:

    applyCommitToMeleeEvent.test.ts — tests black and white separately
    applyChooseMeleeEvent.test.ts — has immutability test

applyCommitToMovementEvent.test.ts tests only black, has no immutability test, no error case. It was probably generated to a lower completeness threshold.
D3 — applyChooseWhetherToRetreatEvent.test.ts (worth checking)

Worth a look — the "whether to retreat" choice has branching behavior (retreat vs no-retreat), and files generated from templates tend to test only the happy path.
Category E — Readability
E1 — getMeleeSupportValue.test.ts (entire file)

The coordinate system is never explained. Comments like // Support unit at E-6 facing west (toward primary unit at E-5) require the reader to know the grid topology. Is E-6 east or north of E-5? The board has a naming convention (letter-number) but no legend anywhere in the test file. The well-written board tests (e.g., getOrthogonallyAdjacentSpaces.test.ts) have inline comments reasoning through the geometry step by step. This file just asserts positions without justification.
E2 — getSubstep/engagement.test.ts

Builds deeply-nested state objects inline in every test — 6+ levels deep, manually constructing currentRoundState.currentPhaseState.currentCommandResolutionState.engagementState etc. Other files in the same getSubstep/ directory use factory helpers (e.g., createFrontEngagementState()). This file predates those helpers or was generated before they existed, and it makes each test very hard to scan.
E3 — getExpectedStartCommandResolutionEvent.test.ts

Uses createTestCard() with no arguments and describes the result as "a movement card." The reader has no idea whether createTestCard() defaults to movement, or whether all cards are treated as movement, or what. The distinction only becomes meaningful when compared to the adjacent test for "ranged attack card" — which presumably does pass a card type argument. The asymmetry is confusing.
What a Good Test Looks Like in This Codebase

For baseline contrast, these are the patterns the well-crafted tests share:

applyChooseCardEvent.test.ts — Helper function is documented, both players tested, immutability tested explicitly, step-advancement sequence tested as a two-step flow, all assertions use exact equality (.toBe, .toEqual, .toBeNull) not vague (toBeDefined).

getExpectedRetreatEvent.test.ts — Covers the complete state machine: no legal retreats, rout delegation, multiple options, single option selected, completed state, rout-complete-but-retreat-incomplete. Each description exactly matches what's being asserted.

addUnitToBoard.test.ts — Nested describe blocks for each scenario, tests both success and failure paths, immutability explicitly verified, includes a "preserves other spaces" test to catch side effects.

burnCardFromPlayed.test.ts — Each test is focused on exactly one concern. Error case verifies the specific message. Appending to existing burnt cards is tested as a distinct case. All assertions use .toEqual with exact expected values.

applyChooseRallyEvent.test.ts — Descriptions include starting state, action, and expected ending state: "from firstPlayerChooseRally with performRally true advances to firstPlayerResolveRally". Tests all four permutations (first/second player × rally/no-rally). Asserts both step and value.

The pattern: precise descriptions that include the starting condition, the action, and the expected outcome; exact assertions; both players; immutability; error cases; no hedging.
Summary Table
File Line Category Severity
getCurrentUnitStat.test.ts 1 Explicitly AI-generated, unreviewed High
getMeleeSupportValue.test.ts 28, 55 A1 — description says "filter out," assertion allows it through High
getMeleeSupportValue.test.ts 348, 380 A2 — description says "sum to 2," assertion allows 1 High
getOtherPlayer.test.ts 12 B1 — it orphaned outside describe Medium
generateCompletePlayCardsPhaseEvent.test.ts 33 A3 — "regardless of state" tested with identical states Medium
createEmptyGameState.test.ts 33 A4 — toBeDefined() passes for null Medium
createEmptyGameState.test.ts 42 A5 — runtime test of a compile-time check Low
getMeleeSupportValue.test.ts 28 (setup) D1 — "behind" comment but flanking position Medium
applyCommitToMovementEvent.test.ts entire D2 — only one test, one player, no immutability Low
getSubstep/engagement.test.ts entire E2 — deeply nested manual state, no helpers Low

The concentrated problem area is getMeleeSupportValue.test.ts. It has the hedged assertions, uncertain comments, and misleading setup that strongly suggest the generator didn't have confident expected values. Everything it claims to test should be re-examined against the actual implementation.

getCurrentUnitStat.test.ts needs a full manual pass — 361 lines, self-labeled, unreviewed.

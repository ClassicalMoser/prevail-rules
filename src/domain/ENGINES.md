# The Four Engines

Four engines carry the whole rules system between them. Each takes game state
and returns something, and none of them keeps any state of its own, which is
what makes an event stream replayable: apply the same events to the same start
and you get the same game.

## 1. Pure Transform Engine

**Location:** [`transforms/stateTransitions/applyEvent.ts`](./transforms/stateTransitions/applyEvent.ts)

**Function:** `applyEvent(event: Event, state: GameState): GameState`

Takes a state and an event, returns a new state. Pure, immutable, no side
effects. It routes on the event's discriminated union — `applyPlayerChoiceEvent`
for a choice, `applyGameEffectEvent` for an effect — and each of those
dispatches to one `apply*Event` function. It throws when an event type has no
transition.

It also accepts a seated client's projected opponent `chooseCard` event, whose
card reads `'hidden'` (a card laid face down is secret, §4.1.1), against a state
of seen visibility. That is how a client folds the wire stream without the
authoritative cards. Commitments and rout discards are face up (§8), so they are
never projected: the event carries the cards, and the fold follows the shape of
the hand it reads. Where the hand is in view the cards leave it; where it is
hidden, one hidden card leaves the hand for each card shown and the shown cards
lie on the discard pile.

```typescript
import { applyEvent } from '@transforms';

const newState = applyEvent(event, currentState);
// newState is a new object; currentState is untouched
```

## 2. Validation Engine

**Location:** [`validation/playerChoice/validatePlayerChoice.ts`](./validation/playerChoice/validatePlayerChoice.ts)

**Function:** `validatePlayerChoice(event: PlayerChoiceEvent, state: GameState): ValidationResult`

Asks two separate questions in order: is this choice **expected**, from
`getExpectedEvent` — the choice type and the player — and is it **legal**, by membership against the same
`@legality` enumerators that build the option payloads. Between the two, the
event is parsed against its schema, so the legality check reads a well-formed
payload. A failure at any step returns a reason.

Events carry no number. The order of the round is the order of its `events[]`,
and the position in that array is the cursor for replay and undo. That keeps
the engine out of arrival order: two players choosing their cards at the same
moment (§4.1.1) cannot both know what position their own choice will take, so
the engine accepts a choice it expects whenever it arrives.

It never throws. Queries beneath it do, so it wraps them and turns a throw into
an `errorReason`. Everything a caller needs is in the returned
`ValidationResult`.

```typescript
import { validatePlayerChoice } from '@validation';

const validation = validatePlayerChoice(event, state);
if (!validation.result) {
  return validation.errorReason;
}
const newState = applyEvent(event, state);
```

Per-choice `isValid*Event` helpers stay inside `@validation`. Callers use
`validatePlayerChoice` and `getLegalPlayerChoiceOptions`.

## 3. Procedure Library

**Location:** [`procedures/procedureRegistry.ts`](./procedures/procedureRegistry.ts)

**Function:** `generateEventFromProcedure(state, effectType, random): GameEffectEvent`

When the game owes an effect rather than waiting on a player, a procedure builds
the event. There are 28 generators, each named for the event it produces, and the
registry is a switch over `GameEffectType` — not a map, so it cannot be indexed.

The switch is exhaustive: its default assigns `effectType` to `never`. Every
game effect has a procedure, which is why there is no predicate asking whether
one exists. If a new effect type is added without a generator, the typecheck
fails rather than the game.

A procedure is not required to be deterministic. Some draw at random, and the
draw is taken from the `RandomSource` passed in, so a caller that fixes the
source fixes the game. What makes the stream replayable is that the _event_
records the result.

Procedures trust the state they are given as internally consistent. Validation
happens before a choice is applied, not again here.

```typescript
import { generateEventFromProcedure } from '@procedures';

const event = generateEventFromProcedure(state, expected.effectType, random);
const newState = applyEvent(event, state);
```

## 4. Next Event Expected Engine

**Location:** [`expected/expectedEvent/getExpectedEvent.ts`](./expected/expectedEvent/getExpectedEvent.ts)

**Function:** `getExpectedEvent(state: GameState): ExpectedEventInfo`

Takes state alone and says what comes next. `ExpectedEventInfo` is
`ExpectedPlayerInput | ExpectedGameEffect`.

It checks the endgame first. A finished game expects nothing, so
`findExpectedEvent` answers `undefined` for it and `getExpectedEvent`, which
insists, throws. A caller that is asking whether anything is owed uses the
find; one that already knows the game is going on uses the get. From there it reads the current phase
and delegates to the phase and substep queries, which is why this layer reads
sequencing and leaves rules to `@legality`.

```typescript
import { getExpectedEvent } from '@expected';

const expected = getExpectedEvent(state);
if (expected.actionType === 'playerChoice') {
  // wait for expected.playerSource to send expected.choiceType
} else {
  // the game owes expected.effectType; generate it with a procedure
}
```

### Legal choice presentation

**Location:** [`validation/playerChoice/getLegalPlayerChoiceOptions.ts`](./validation/playerChoice/getLegalPlayerChoiceOptions.ts)

**Function:** `getLegalPlayerChoiceOptions(state: GameState): LegalPlayerChoiceOptions | null`

Once a player choice is expected, this packages the legal options for a UI or a
bot from the same enumerators the validators check membership against. It lives
in `@validation` because it composes `@expected` and `@legality`, and legality
may not import expected.

It returns `null` when nothing is owed a choice: the game is over
(`findExpectedEvent` answers `undefined`) or the next action is a game effect.
An enumerator that finds no options answers with an empty offer, but one that
throws is a fault in the state and throws to the caller with its own message.
Otherwise it discriminates by `choiceType` and
carries `playerSource`, and either the full `events[]`
for an atomic choice or named root atoms for a compound one. Follow-ups that
depend on a selection stay on their own helpers — `getLegalUnitMoves` (every
ending with a path to it), `findLegalMoveDeltas` (the next step or turn of a
path being written), `getLegalRangedAttackTargets`,
`getLegalLineEndsForIssueCommand`, `getSupportPlacementOffer`.

A choice too large to list whole is offered a part at a time, as a
`PartOffer` (`@utils`): the parts that may come next after the parts chosen
so far, and whether the choice may stop there. A rule that binds the whole
choice is a stopping rule: a move owes its squaring turn (§6.2.3), and a
player must fill any support place an uncovered unit could take (§10.4.5).
The validator walks the submitted choice through the same offers with
`findRefusedPart` and only words the refusal, so a client is never refused
by a rule its offers did not show. Moves (`findLegalMoveDeltas`) and unit
support (`getSupportPlacementOffer`) are offered this way.

## How they fit

1. **Expected** says what should happen next.
2. **Legal options** fill in the choices when that is a player's turn to act.
3. **Validation** checks an incoming choice against both.
4. **Procedures** build the event when the game owes an effect.
5. **Transform** applies the event and returns the next state.

A player choice is validated before it is applied. An effect generated by a
procedure is trusted, because a procedure reads the same state the sequencer
read. Repeat from step 1 with the new state, and the loop runs a whole game.

What this buys: a game replays from its event stream, state rebuilds from the
log, and a stream can be read back for analysis or undo.

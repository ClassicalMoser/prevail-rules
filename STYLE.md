# Style

Code shape for this repository. Schema layout and barrel order are in [`src/domain/entities/README.md`](./src/domain/entities/README.md). Import edges are in [`boundaries.ts`](./boundaries.ts): a package imports only the aliases that file allows.

## Shape

Small functions, small files. One primary export per file. A function does one job. A name says what that job is.

No classes. Shared behavior is a function, or a closure that returns functions.

`return` stands on its own line and returns a name. Do not return a call. Do not build that call's arguments inline. Name each piece, then pass the names.

An exported function has an explicit return type. `isolatedDeclarations` requires it, and the linter checks it too.

No overloads, unless a single signature cannot say the return. An overload is a second assertion of the type.

```typescript
const white = updatePlayerCardState(base, 'white', whiteCardState);
const cleanup = updatePhaseState(white, cleanupPhase);
const next = updateRoutState(cleanup, rout);
return next;
```

## TypeScript and Zod

The project is strict about both. Do not use a type assertion (`as`, `!`) or `@ts-ignore`. The exception is a test that must pass a value the type forbids, and only in a `*.test.ts` file, with a comment on that line saying why.

## Commentary

Commentary is extensive. 25% comments inside a function body is not too much; JSDoc does not count toward it. The measure is comment lines inside bodies over code lines inside bodies: nothing outside a body is in either count, and blank lines are in neither. In a struct the lines inside the body are the JSDoc on each member, so those count; the block above a declaration does not, however long it is. `pnpm check:commentary` reports it per layer. It renders no verdict and gates nothing: a comment restating the code raises the number and makes the file worse, so whether commentary is any good is a judgment for the read, not a measure. Leave existing function commentary in place, including `@param` and `@returns`. JSDoc-style comments ahead of declarations are good for IDE readability, and every function and every struct has one. That is a separate requirement from the 25%, and neither one discharges the other. Keep a new header short: a few lines saying what the thing is and why it exists. Three paragraphs is not a better header. A shorter header is not a cleanup, so leave a long one alone. When a helper does several steps, comment each step: what it writes, and why a factory is still there.

Where a step encodes a rule of the game, the comment names the rule. That is the line carrying the meaning, and a comment there that gives the operation instead — or the chain of states a lookup walks through — spends the line and loses it. Where a step is mechanical, a short label is enough: there is no rule at the bottom of every call, and inventing one is worse than the label. Judging which steps carry rules is the work, and no measure makes that call for you.

A comment must match the code beneath it. One describing a parameter, a branch or a value that is not there is worse than silence, because a reader trusts it and goes looking for what it promised. A comment holding a place for a real one later is the same failure in advance: it costs a line, passes review because something is there, and teaches a reader to skim.

This is a rule for what you add. It is not a licence to audit what is already here. Existing commentary is authored, and the never-overwrite rule above governs it: a comment that reads thin to you may be carrying a distinction you have not met yet, so leave it and mark it if you must. The remedy for a weak comment is a better comment, never a deleted one. Density is a symptom of explanation rather than the goal, and a comment is never written to move a number. Nearly every step here serves a rule. If you are struggling to place the rule, check the call sites: the meaning of a low-level helper is often only visible where it is used. If you cannot answer it at all, leave a `TODO(misleading)` or `TODO(composition)` mark saying what you could not state rather than guessing. That is a finding, and it is worth more than either a bare step or a comment that fills the line.

Comments are meant to convey gameplay meaning: what happens in the game, and why the rules want it. A reader who knows the game but not the rest of the codebase should still be able to follow it. Technical detail, such as the chain of states a lookup passes through, is where human meaning gets lost. Names and test titles follow the same rule. This is not a standard for the commentary alone — a readable codebase that holds the meaning of the game is what this project is for, so it governs every change rather than a pass of cleanup.

Two practices get it written, and both apply to every change:

**Write the comment before the code.** State the gameplay reason for a step first, then write or change the code so it matches that reason. Done the other way round the comment describes the code that was just written, which is how a line naming the call beneath it gets there. Done this way, a step with no reason to introduce does not get introduced, and a comment that stops matching its check shows up at once.

**State the gameplay meaning before a file is done.** For each finished file, say which rule of the game each commented step serves — the rule, per step, in the game's terms, not a summary of the module. A step whose rule you cannot name gets a `TODO` saying what could not be stated. The same sentence repeated for every step, or the function's own name written back, means the commentary is not carrying meaning yet and the file is not finished.

## Tests

A test should be almost as easy to read as its name. The `it` title states the fact. Build that fact with a few factories, transforms, and fixtures. What remains in the body must be clear: the values this test chose, a comment on each step saying what it writes, and the assertion the title names. Setup that cannot be that clear belongs in one of those three. A stand-in value needs a comment saying why it is enough. Do not start a title with "given" or "should".

The `describe` title is a string, the function name plus the word "function": `'getCurrentPhaseState function'`. Do not pass the function. Vitest would use `function.name` as the title, and `vitest/valid-title` rejects a name that is not a string.

A factory builds a value from raw inputs. A transform changes an existing state. A fixture in `@testing` does what neither of those can. Do not give two of them the same job. If a factory or a transform can do it, there is no fixture for it. Do not inline the behavior one of them already owns. None of them supplies a value the engine computes, such as legal retreat options. Run the function that computes it.

Assert a value this test wrote. Do not assert a default some other helper filled in. Read it through the query that owns it, unless that query is the subject under test. Below `@queries` there is no such query; read the field the subject writes. The expected value is a literal: one built from the setup's fixture agrees with the fixture instead of checking the code.

A helper stays in a spec only when its meaning is strictly limited to the module under test. That case is rare. Otherwise its job belongs to a factory, a transform, or `@testing`, even if one suite is currently the only caller. See [`src/domain/testing/README.md`](./src/domain/testing/README.md).

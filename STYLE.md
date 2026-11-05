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

Commentary is extensive. 25% comments inside a function body is not too much; JSDoc does not count toward it. Leave existing function commentary in place, including `@param` and `@returns`. JSDoc-style comments ahead of declarations are good for IDE readability. A shorter header is not a cleanup. When a helper does several steps, comment each step: what it writes, and why a factory is still there.

As much as possible comments are meant to convey gameplay meaning: what happens in the game, and why the rules want it. A reader who knows the game but not the rest of the codebase should still be able to follow it. Technical detail, such as the chain of states a lookup passes through, is where human meaning gets lost. Names and test titles follow the same rule.

## Tests

A test should be almost as easy to read as its name. The `it` title states the fact. Build that fact with a few factories, transforms, and fixtures. What remains in the body must be clear: the values this test chose, a comment on each step saying what it writes, and the assertion the title names. Setup that cannot be that clear belongs in one of those three. A stand-in value needs a comment saying why it is enough. Do not start a title with "given" or "should".

The `describe` title is a string, the function name plus the word "function": `'getCurrentPhaseState function'`. Do not pass the function. Vitest would use `function.name` as the title, and `vitest/valid-title` rejects a name that is not a string.

A factory builds a value from raw inputs. A transform changes an existing state. A fixture in `@testing` does what neither of those can. Do not give two of them the same job. If a factory or a transform can do it, there is no fixture for it. Do not inline the behavior one of them already owns. None of them supplies a value the engine computes, such as legal retreat options. Run the function that computes it.

Assert a value this test wrote. Do not assert a default some other helper filled in. Read it through the query that owns it, unless that query is the subject under test. Below `@queries` there is no such query; read the field the subject writes. The expected value is a literal: one built from the setup's fixture agrees with the fixture instead of checking the code.

A helper stays in a spec only when its meaning is strictly limited to the module under test. That case is rare. Otherwise its job belongs to a factory, a transform, or `@testing`, even if one suite is currently the only caller. See [`src/domain/testing/README.md`](./src/domain/testing/README.md).

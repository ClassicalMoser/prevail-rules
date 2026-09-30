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

Commentary is extensive. 25% comments is not too much. Leave existing function commentary in place, including `@param` and `@returns`. JSDoc-style comments ahead of declarations are good for IDE readability. A shorter header is not a cleanup. When a helper does several steps, comment each step: what it writes, and why a factory is still there.

## Tests

A test should be almost as easy to read as its name. The `it` title states the fact. The body shows that fact and little else. Do not start a title with "given" or "should".

A factory builds a value from raw inputs. A transform changes an existing state. A fixture in `@testing` does what neither of those can. Do not give two of them the same job. If a factory or a transform can do it, there is no fixture for it.

Assert a value this test wrote. Do not assert a default some other helper filled in.

A helper used by one suite may stay in that file. The same helper in a second suite, when no factory or transform covers it, belongs in `@testing`. See [`src/domain/testing/README.md`](./src/domain/testing/README.md).

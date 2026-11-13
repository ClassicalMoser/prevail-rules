# Utils

Import as `@utils`.

Small technical helpers with no domain schemas and no imports from other layers.

- `assertExact` — schema and type stay aligned
- `validationResult` — `ValidationResult`
- `stateSentinels` — each guard compares a value to the strings in its own signature (`'pending'`, `'bypassed'`, `'none'`)
- `throwIfPending` / `throwIfBypassed` / `throwIfNone` — a sentinel slot is not the value a caller asked for
- `throwIfUndefined` — narrow away a missing value, or throw
- `literal` — `Literal`, a value compared by `===`, so a comparison needs no rule for it
- `haveSameMembers` — two lists hold the same members, each as many times, in any order
- `randomSource` — a draw a caller can fix, so replaying a stored event does not roll again
- `openChoice` / `findIllegal` — a choice too large to list whole has its legal options enumerated a part at a time, with whether it may stop; a validator walks a submitted choice through the same legal options
- `failFromFault` — a fault thrown while validating, as the refusal the validator's boundary returns

# Utils

Import as `@utils`.

Small technical helpers with no domain schemas and no imports from other layers.

- `assertExact` — schema and type stay aligned
- `validationResult` — `ValidationResult`
- `stateSentinels` — each guard compares a value to the strings in its own signature (`'pending'`, `'bypassed'`, `'none'`)
- `throwIfPending` / `throwIfBypassed` / `throwIfNone` — a sentinel slot is not the value a caller asked for
- `throwIfUndefined` — narrow away a missing value, or throw
- `randomSource` — a draw a caller can fix, so replaying a stored event does not roll again
- `openChoice` / `findRefusal` — a choice too large to list whole is offered a part at a time, with whether it may stop; a validator walks a submitted choice through the same offers

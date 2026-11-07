# Utils

Import as `@utils`.

Small helpers with no domain schemas and no imports from other layers.

- `assertExact` — schema and type stay aligned
- `validationResult` — `ValidationResult`
- `throwIfPending` / `throwIfNone` — a sentinel slot is not the value a caller asked for
- `throwIfUndefined` — narrow away a missing value, or throw
- `stateSentinels` — each guard compares a value to the strings in its own signature (`'pending'`, `'bypassed'`, `'none'`)
- `randomSource` — a draw a caller can fix, so replaying a stored event does not roll again

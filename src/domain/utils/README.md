# Utils

Import as `@utils`.

Small helpers with no domain schemas and no imports from other layers.

- `assertExact` — schema and type stay aligned
- `validationResult` — `ValidationResult`
- `throwIfPending` / `throwIfNone` — a sentinel slot is not the value a caller asked for
- `throwIfUndefined` — narrow away a missing value, or throw
- `serializationSentinels` — values that mean "not here" in saved state

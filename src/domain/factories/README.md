# Factories

Import as `@factories`.

Build a domain value from raw inputs: an empty board, an empty game, a unit. A factory does not change an existing entity or state. Those operators live under `@transforms`. A test-only helper that neither a factory nor a transform can do lives in `@testing`.

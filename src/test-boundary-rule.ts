// Test file to verify boundary rule works
// This file is outside boundaries (in root of src/)
// NOTE: The rule is configured for src/entities and src/queries, but actual paths are src/domain/entities
// So this test won't trigger the rule until config is updated

// ✅ This should be allowed: using alias from outside

// This import path doesn't match the configured boundary (src/entities)
// so it won't trigger the rule. The rule expects boundaries at:
// - src/entities (but actual is src/domain/entities)
// - src/queries (but actual is src/domain/queries)

export {};

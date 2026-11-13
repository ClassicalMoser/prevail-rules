/**
 * A value that two copies of can be compared by `===`: a string, a number or
 * a boolean. Two equal literals are the same thing, so a helper that compares
 * members or parts needs no rule for them. Anything else, such as an object,
 * must come with a rule for when two are the same, since two objects with
 * equal contents are never `===`.
 */
export type Literal = string | number | boolean;

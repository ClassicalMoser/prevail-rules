import type { OpenChoice, ChoiceRefusal } from './openChoice';

/** A value compared by `===`: two equal literals are the same part. */
// TODO(composition): `haveSameMembers` declares the same `Literal` type for
// the same purpose, comparing by `===` unless told otherwise. Settled by one
// shared declaration, or by deciding the two may differ.
type Literal = string | number | boolean;

/**
 * Walks a submitted choice through the offers that build it: each part must
 * be among those offered after the parts before it, and the choice must be
 * allowed to stop where it ends. A validator holds no rule of its own this
 * way; it only asks the same offers a client was shown.
 *
 * The first refusal is answered, not a reason. The validator words it, since
 * only it knows what a part is in the game.
 *
 * Literals are compared by `===`. Anything else must say what makes two parts
 * the same, since two objects with equal contents are never `===`.
 *
 * @param parts - The choice as submitted, part by part
 * @param offerAfter - What may follow a given run of parts already accepted
 * @param isSame - When two parts are the same; required for non-literals
 * @returns The first refusal, or `undefined` when every part was offered and
 * the choice may stop where it ends
 */
export function findRefusal<Part extends Literal>(
  parts: readonly Part[],
  offerAfter: (soFar: readonly Part[]) => OpenChoice<Part>,
): ChoiceRefusal<Part> | undefined;
export function findRefusal<Part>(
  parts: readonly Part[],
  offerAfter: (soFar: readonly Part[]) => OpenChoice<Part>,
  isSame: (a: Part, b: Part) => boolean,
): ChoiceRefusal<Part> | undefined;
export function findRefusal<Part>(
  parts: readonly Part[],
  offerAfter: (soFar: readonly Part[]) => OpenChoice<Part>,
  isSame: (a: Part, b: Part) => boolean = (a, b) => a === b,
): ChoiceRefusal<Part> | undefined {
  // Every part must be one of those offered after the parts before it.
  for (const [index, part] of parts.entries()) {
    const offered = offerAfter(parts.slice(0, index));
    const wasOffered = offered.next.some((candidate) =>
      isSame(candidate, part),
    );
    if (!wasOffered) {
      const notOffered: ChoiceRefusal<Part> = {
        index,
        offered,
        refusal: 'notOffered',
      };
      return notOffered;
    }
  }

  // And the choice must be allowed to stop where it ends.
  const atEnd = offerAfter(parts);
  if (!atEnd.mayStop) {
    const mayNotStop: ChoiceRefusal<Part> = {
      offered: atEnd,
      refusal: 'mayNotStop',
    };
    return mayNotStop;
  }

  return undefined;
}

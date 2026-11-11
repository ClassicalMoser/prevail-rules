import type { PartOffer, PartRefusal } from './partOffer';

/** A value compared by `===`: two equal literals are the same part. */
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
export function findRefusedPart<Part extends Literal>(
  parts: readonly Part[],
  offerAfter: (soFar: readonly Part[]) => PartOffer<Part>,
): PartRefusal<Part> | undefined;
export function findRefusedPart<Part>(
  parts: readonly Part[],
  offerAfter: (soFar: readonly Part[]) => PartOffer<Part>,
  isSame: (a: Part, b: Part) => boolean,
): PartRefusal<Part> | undefined;
export function findRefusedPart<Part>(
  parts: readonly Part[],
  offerAfter: (soFar: readonly Part[]) => PartOffer<Part>,
  isSame: (a: Part, b: Part) => boolean = (a, b) => a === b,
): PartRefusal<Part> | undefined {
  // Every part must be one of those offered after the parts before it.
  for (const [index, part] of parts.entries()) {
    const offered = offerAfter(parts.slice(0, index));
    const wasOffered = offered.next.some((candidate) =>
      isSame(candidate, part),
    );
    if (!wasOffered) {
      const notOffered: PartRefusal<Part> = {
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
    const mayNotStop: PartRefusal<Part> = {
      offered: atEnd,
      refusal: 'mayNotStop',
    };
    return mayNotStop;
  }

  return undefined;
}

import type { Literal } from './literal';
import type { OpenChoice, ChoiceRefusal } from './openChoice';

/**
 * Checks a choice made one part at a time against the enumerated legal options
 * (`OpenChoice`). Validators use it so they accept exactly the legal options,
 * and keep no rules of their own.
 *
 * @param parts - The choice, part by part
 * @param optionsAfter - The legal options after a given run of parts
 * @param isSame - Whether a submitted part matches a legal option; required
 *   when parts are objects
 * @returns The first way the choice is illegal, or `undefined` when every
 * part was a legal option and the choice may stop where it ends
 */
// Literal parts are compared with `===`.
export function findIllegal<Part extends Literal>(
  parts: readonly Part[],
  optionsAfter: (soFar: readonly Part[]) => OpenChoice<Part>,
): ChoiceRefusal<Part> | undefined;
// Object parts need their own comparison, since equal objects are not `===`.
export function findIllegal<Part>(
  parts: readonly Part[],
  optionsAfter: (soFar: readonly Part[]) => OpenChoice<Part>,
  isSame: (a: Part, b: Part) => boolean,
): ChoiceRefusal<Part> | undefined;
export function findIllegal<Part>(
  parts: readonly Part[],
  optionsAfter: (soFar: readonly Part[]) => OpenChoice<Part>,
  isSame: (a: Part, b: Part) => boolean = (a, b) => a === b,
): ChoiceRefusal<Part> | undefined {
  for (const [index, part] of parts.entries()) {
    // Check the legality of the choice at each step.
    // Include past choices for current context.
    const options = optionsAfter(parts.slice(0, index));

    // `next` lists the parts that may legally come next;
    // the submitted part must match one of them.
    const wasEnumerated = options.next.some((candidate) =>
      isSame(candidate, part),
    );

    // Refuse at the first choice submitted that was not enumerated.
    // Submitted and not enumerated means illegal
    // The validator writes the message.
    if (!wasEnumerated) {
      const notEnumerated: ChoiceRefusal<Part> = {
        index,
        options,
        refusal: 'notEnumerated',
      };
      return notEnumerated;
    }
  }

  // Every part was legal, but the choice may still be unfinished, such as a
  // move that owes its squaring turn.
  // Pass on the legal options remaining.
  const atEnd = optionsAfter(parts);
  if (!atEnd.mayStop) {
    const mayNotStop: ChoiceRefusal<Part> = {
      options: atEnd,
      refusal: 'mayNotStop',
    };
    return mayNotStop;
  }

  // Nothing illegal found.
  return undefined;
}

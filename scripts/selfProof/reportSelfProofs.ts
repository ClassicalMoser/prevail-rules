import type { SelfProof } from './selfProof';

/**
 * Writes the check's findings as lines to print.
 *
 * @param proofs - The self-proving specs found
 * @param checked - How many specs had a subject to check against
 * @param total - How many specs there are
 * @returns The report, one line per entry
 */
export function reportSelfProofs(
  proofs: SelfProof[],
  checked: number,
  total: number,
): string[] {
  const lines = [`${checked} specs with a colocated subject, of ${total}.`];

  // Nothing to say beyond the count when the suite is clean.
  if (proofs.length === 0) {
    lines.push('No spec reaches its own subject.');
    return lines;
  }

  lines.push('', `${proofs.length} spec(s) reach their own subject:`, '');
  for (const proof of proofs) {
    lines.push(`  ${proof.spec}`);
    for (const module of proof.through) {
      lines.push(`      through ${module}`);
    }
  }

  // The fix is the same in every case, so it is said once at the end.
  lines.push(
    '',
    'The assertion agrees with the subject rather than checking it. Write the',
    'expected value as a literal, or assert through something that does not',
    'call the subject.',
  );
  return lines;
}

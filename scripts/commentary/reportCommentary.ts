import { densityPercent } from './densityPercent';
import type { ScopeDensity } from './scopeDensity';
import type { ScopeFloor } from './scopeFloor';

/** The standard in `STYLE.md`, which is the target rather than the gate. */
const TARGET = 25;

/**
 * The flag beside one number: past the target, or below its floor.
 *
 * @param percent - The measured density
 * @param floor - The recorded floor, or undefined when none is recorded
 * @returns A one-character mark, or a space when there is nothing to say
 */
function markFor(percent: number, floor: number | undefined): string {
  // A loss of ground is the only thing this check fails on, so it is marked
  // first and distinctly, even on a scope that is otherwise doing well. A
  // scope can be past the target and still have slipped below its own floor.
  if (floor !== undefined && percent < floor) {
    return '!';
  }

  // A scope at the standard is the worked example the rest should look like.
  if (percent >= TARGET) {
    return '*';
  }

  return ' ';
}

/**
 * Writes the per-scope densities as lines to print.
 *
 * Source and specs are reported apart because they move apart: a scope the
 * audit has read runs several times the density of one it has not, and the
 * specs trail both. Averaging them would hide exactly that.
 *
 * @param measured - Every scope's density, in boundary order
 * @param floors - The recorded floor per scope
 * @returns The report, one line per scope plus a header and a summary
 */
export function reportCommentary(
  measured: ScopeDensity[],
  floors: Map<string, ScopeFloor>,
): string[] {
  // The header states the measure, because the same number read against whole
  // files is roughly a third of this one and the two get confused.
  const lines = [
    `In-body commentary, comments over code, against ${TARGET}%.`,
    '',
    '  scope           source   specs',
  ];

  // Running totals, so the summary is the repository rather than a mean of
  // means: one 25-line scope would otherwise weigh as much as transforms.
  let sourceComments = 0;
  let sourceCode = 0;
  let specComments = 0;
  let specCode = 0;

  for (const entry of measured) {
    const source = densityPercent(entry.source);
    const specs = densityPercent(entry.specs);
    const floor = floors.get(entry.scope);

    // A scope at or past the target is worth seeing; so is one below its floor.
    const sourceMark = markFor(source, floor?.source);
    const specMark = markFor(specs, floor?.specs);
    // Padded to the width of the longest boundary alias, so the two columns
    // line up and a scope that has slipped is visible by scanning down.
    const name = entry.scope.padEnd(14, ' ');
    const sourceText = String(source).padStart(5, ' ');
    const specText = String(specs).padStart(5, ' ');
    lines.push(`  ${name} ${sourceText}%${sourceMark} ${specText}%${specMark}`);

    sourceComments += entry.source.comments;
    sourceCode += entry.source.code;
    specComments += entry.specs.comments;
    specCode += entry.specs.code;
  }

  // The summary counts body lines rather than files, because that is the
  // denominator the standard uses and the one the scopes above are measured on.
  const sourceTotal = densityPercent({
    code: sourceCode,
    comments: sourceComments,
  });
  const specTotal = densityPercent({ code: specCode, comments: specComments });
  const sourceLines = sourceCode + sourceComments;
  const specLines = specCode + specComments;
  lines.push(
    '',
    `  source ${sourceTotal}% of ${sourceLines} body lines, specs ${specTotal}% of ${specLines}.`,
  );
  return lines;
}

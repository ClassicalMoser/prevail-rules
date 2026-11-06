import { densityPercent } from './densityPercent';
import { measureScopes } from './measureScopes';
import { readCommentaryBaseline } from './readCommentaryBaseline';
import { reportCommentary } from './reportCommentary';
import type { CommandResult } from '../commandResult';

/**
 * Reports in-body commentary density, and fails when a scope has lost ground.
 *
 * `STYLE.md` asks for 25% comments inside a body, measured as comment lines
 * over code lines with header blocks in neither count. Nothing here is at 25%
 * yet, so this does not gate on the standard: it gates on the floors in
 * `baseline.json`, which is the one thing that can be enforced today.
 *
 * What that catches is the failure this repository has already seen. A pass
 * rewrote 14,170 lines of specs across 90 files and added no commentary at
 * all; the suite stayed green and `validate` stayed clean, because nothing
 * measured it. A floor turns that into a failing check at the commit that
 * caused it.
 *
 * Raise a floor whenever a scope improves. That is the ratchet, and it is why
 * the floors are recorded rather than computed.
 *
 * @returns The report, with a failure naming each scope below its floor
 */
export async function checkCommentaryDensity(): Promise<CommandResult> {
  // Measured before the floors are read, so the report is the same whether or
  // not anything failed and a run always says where every scope stands.
  const measured = await measureScopes();
  const floors = await readCommentaryBaseline();

  const lost: string[] = [];
  for (const entry of measured) {
    // A scope with no recorded floor is reported but cannot fail, which is how
    // a newly added boundary gets measured without breaking the build.
    const floor = floors.get(entry.scope);
    if (floor === undefined) {
      continue;
    }

    // Source and specs are checked separately on purpose: a pass that adds
    // commentary to the modules while stripping it from their specs would
    // come out level on any combined figure.
    const source = densityPercent(entry.source);
    if (source < floor.source) {
      lost.push(`${entry.scope} source ${source}% below ${floor.source}%`);
    }

    const specs = densityPercent(entry.specs);
    if (specs < floor.specs) {
      lost.push(`${entry.scope} specs ${specs}% below ${floor.specs}%`);
    }
  }

  const report = reportCommentary(measured, floors);

  // The failure names the scopes rather than repeating the table, because the
  // report above already carries every number the reader needs.
  const failure =
    lost.length > 0 ? `Commentary density fell: ${lost.join('; ')}` : null;
  const result: CommandResult = { failure, output: report.join('\n') };
  return result;
}

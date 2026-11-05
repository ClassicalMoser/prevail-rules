import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

/**
 * The parts of a Stryker JSON report this script reads. Everything else in a
 * file entry (source, language) is carried through untouched by `passthrough`.
 */
const reportSchema = z
  .object({
    files: z.record(
      z.string(),
      z
        .object({
          mutants: z.array(z.object({ status: z.string() }).passthrough()),
        })
        .passthrough(),
    ),
  })
  .passthrough();

type MutationReport = z.infer<typeof reportSchema>;

/** One boundary's line in the summary. */
interface ShardScore {
  boundary: string;
  killed: number;
  noCoverage: number;
  score: string;
  survived: number;
}

/**
 * A boundary's counts and score, by Stryker's definition: killed and timed-out
 * mutants over every mutant that was tested or had no test reach it. `Ignored`,
 * `CompileError` and `RuntimeError` mutants are outside the score.
 *
 * @param boundary - The boundary the report covers
 * @param report - That boundary's shard report
 * @returns The boundary's row in the summary
 */
function scoreShard(boundary: string, report: MutationReport): ShardScore {
  // Every mutant in the boundary, across its files.
  const mutants = Object.values(report.files).flatMap((file) => file.mutants);
  const count = (status: string): number =>
    mutants.filter((mutant) => mutant.status === status).length;

  // Detected mutants are the numerator; detected plus undetected the denominator.
  const detected = count('Killed') + count('Timeout');
  const survived = count('Survived');
  const noCoverage = count('NoCoverage');
  const valid = detected + survived + noCoverage;
  const score =
    valid === 0 ? 'n/a' : `${((100 * detected) / valid).toFixed(2)}%`;

  const shardScore: ShardScore = {
    boundary,
    killed: detected,
    noCoverage,
    score,
    survived,
  };
  return shardScore;
}

/**
 * The scores as a Markdown table for the job summary.
 *
 * @param scores - One row per boundary
 * @returns The table
 */
function toMarkdownTable(scores: ShardScore[]): string {
  const header = [
    '| Boundary | Score | Killed | Survived | No coverage |',
    '| --- | --- | --- | --- | --- |',
  ];
  const rows = scores.map(
    (s) =>
      `| ${s.boundary} | ${s.score} | ${s.killed} | ${s.survived} | ${s.noCoverage} |`,
  );
  const table = [...header, ...rows].join('\n');
  return table;
}

/**
 * A self-contained page for the merged report. `<` is escaped so a `</script>`
 * inside source text cannot end the inline script early.
 *
 * @param reportJson - The merged report, serialized
 * @returns The page
 */
function toHtml(reportJson: string): string {
  const safeJson = reportJson.replaceAll('<', String.raw`\u003c`);
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>prevail-rules mutation report</title>
    <script src="https://www.unpkg.com/mutation-testing-elements"></script>
  </head>
  <body>
    <mutation-test-report-app title-postfix="prevail-rules"></mutation-test-report-app>
    <script>
      document.querySelector('mutation-test-report-app').report = ${safeJson};
    </script>
  </body>
</html>
`;
  return html;
}

/**
 * Merges the per-boundary Stryker reports into one report and a score table.
 *
 * Each shard mutated a different directory, so the `files` maps never share a
 * key and merging them is a union. The shard directories are named
 * `mutation-<boundary>` by the workflow; that name is the boundary in the table.
 *
 * @param shardsDir - The directory holding one `mutation-<boundary>/mutation.json` per shard
 * @param outDir - Where the merged `mutation.json` and `mutation.html` are written
 * @returns The summary as a Markdown table
 */
export async function mergeMutationReports(
  shardsDir: string,
  outDir: string,
): Promise<string> {
  // Every shard that produced a report, by the boundary its directory names.
  const entries = await readdir(shardsDir);
  const shardNames = entries.filter((name) => name.startsWith('mutation-'));
  const shards = await Promise.all(
    shardNames.map(async (name) => {
      const reportPath = path.join(shardsDir, name, 'mutation.json');
      const text = await readFile(reportPath, 'utf8');
      const report = reportSchema.parse(JSON.parse(text));
      const boundary = name.replace(/^mutation-/u, '');
      return { boundary, report };
    }),
  );

  // One report: the first shard's header, every shard's files.
  const [first] = shards;
  if (first === undefined) {
    throw new Error(`No mutation-* reports found in ${shardsDir}`);
  }
  const files = Object.assign({}, ...shards.map((shard) => shard.report.files));
  const merged: MutationReport = { ...first.report, files };

  // The merged JSON, and an HTML page that renders it with Stryker's own viewer.
  const mergedJson = JSON.stringify(merged);
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'mutation.json'), mergedJson);
  await writeFile(path.join(outDir, 'mutation.html'), toHtml(mergedJson));

  // One row per boundary, so a weak boundary is visible without opening the report.
  const scores = shards.map((shard) =>
    scoreShard(shard.boundary, shard.report),
  );
  const table = toMarkdownTable(scores);
  return table;
}

// `shards/` and `reports/mutation/` are where the workflow downloads and uploads.
const summary = await mergeMutationReports('shards', 'reports/mutation');
console.log(summary);

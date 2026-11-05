import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import {
  aggregateResultsByModule,
  calculateMetrics,
} from 'mutation-testing-metrics';
import type { MutationTestResult } from 'mutation-testing-report-schema';

/**
 * Whether a parsed file is a Stryker JSON report. Stryker wrote it, so this
 * checks the fields the merge depends on rather than the whole schema.
 *
 * @param value - The parsed contents of a `mutation.json`
 * @returns Whether it has a schema version, thresholds and a files map
 */
function isMutationTestResult(value: unknown): value is MutationTestResult {
  // Objects only; arrays and null are not reports.
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  // The three fields every report carries.
  const hasVersion =
    'schemaVersion' in value && typeof value.schemaVersion === 'string';
  const hasThresholds =
    'thresholds' in value && typeof value.thresholds === 'object';
  const hasFiles = 'files' in value && typeof value.files === 'object';
  const isReport = hasVersion && hasThresholds && hasFiles;
  return isReport;
}

/**
 * Reads one shard's report from `mutation-<boundary>/mutation.json`.
 *
 * @param shardsDir - The directory the workflow downloaded the shards into
 * @param name - The shard's directory name, `mutation-<boundary>`
 * @returns The boundary and its report
 */
async function readShard(
  shardsDir: string,
  name: string,
): Promise<{ boundary: string; report: MutationTestResult }> {
  // The report, checked to be one before anything trusts its shape.
  const reportPath = path.join(shardsDir, name, 'mutation.json');
  const parsed: unknown = JSON.parse(await readFile(reportPath, 'utf8'));
  if (!isMutationTestResult(parsed)) {
    throw new Error(`${reportPath} is not a Stryker JSON report`);
  }

  // The directory name carries the boundary, which becomes the module name.
  const boundary = name.replace(/^mutation-/u, '');
  const shard = { boundary, report: parsed };
  return shard;
}

/**
 * One boundary's row in the summary, from Stryker's own metrics. The score is
 * undefined (`NaN`) when no mutant was tested or uncovered.
 *
 * @param boundary - The boundary the report covers
 * @param report - That boundary's shard report
 * @returns The Markdown table row
 */
function toSummaryRow(boundary: string, report: MutationTestResult): string {
  // Stryker's metrics for this shard's files.
  const { metrics } = calculateMetrics(report.files);
  const score = Number.isNaN(metrics.mutationScore)
    ? 'n/a'
    : `${metrics.mutationScore.toFixed(2)}%`;

  // Killed counts timeouts too, as the score does.
  const detected = metrics.killed + metrics.timeout;
  const row = `| ${boundary} | ${score} | ${detected} | ${metrics.survived} | ${metrics.noCoverage} |`;
  return row;
}

/**
 * A self-contained page that renders a report with Stryker's own viewer,
 * inlined from the installed `mutation-testing-elements` so the page works
 * offline and matches the version Stryker uses. `<` in the report is escaped so
 * source text containing `</script>` cannot end the inline script early.
 *
 * @param report - The merged report
 * @returns The page
 */
async function toHtml(report: MutationTestResult): Promise<string> {
  // The viewer bundle, resolved from this project's dependencies.
  const require = createRequire(import.meta.url);
  const bundlePath =
    require.resolve('mutation-testing-elements/dist/mutation-test-elements.js');
  const bundle = await readFile(bundlePath, 'utf8');

  // The report as an inline script value.
  const reportJson = JSON.stringify(report).replaceAll('<', String.raw`\u003c`);
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>prevail-rules mutation report</title>
    <script>${bundle}</script>
  </head>
  <body>
    <mutation-test-report-app title-postfix="prevail-rules"></mutation-test-report-app>
    <script>
      document.querySelector('mutation-test-report-app').report = ${reportJson};
    </script>
  </body>
</html>
`;
  return html;
}

/**
 * Merges the per-boundary Stryker reports into one report and a score table.
 *
 * The merge is Stryker's `aggregateResultsByModule`, with each boundary as a
 * module. Every shard is a separate run that numbers its mutants and tests from
 * the start, so the aggregate prefixes each id with the module name, rewrites
 * `killedBy` and `coveredBy` to match, and files each shard's paths under it.
 *
 * @param shardsDir - The directory holding one `mutation-<boundary>/mutation.json` per shard
 * @param outDir - Where the merged `mutation.json` and `mutation.html` are written
 * @returns The summary as a Markdown table
 */
export async function mergeMutationReports(
  shardsDir: string,
  outDir: string,
): Promise<string> {
  // Every shard that produced a report. The directory only exists once the
  // workflow has downloaded them, so a missing one says what was expected.
  const entries = await readdir(shardsDir).catch((error: unknown) => {
    throw new Error(
      `No shard reports: expected ${shardsDir}/mutation-<boundary>/mutation.json, which the mutation workflow downloads before merging`,
      { cause: error },
    );
  });
  const shardNames = entries.filter((name) => name.startsWith('mutation-'));
  if (shardNames.length === 0) {
    throw new Error(`No mutation-* reports found in ${shardsDir}`);
  }
  const shards = await Promise.all(
    shardNames.map((name) => readShard(shardsDir, name)),
  );

  // One report, by Stryker's aggregation, with each boundary as a module.
  const byBoundary = Object.fromEntries(
    shards.map((shard) => [shard.boundary, shard.report]),
  );
  const merged = aggregateResultsByModule(byBoundary);

  // The merged JSON, and a page that renders it.
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'mutation.json'), JSON.stringify(merged));
  await writeFile(path.join(outDir, 'mutation.html'), await toHtml(merged));

  // One row per boundary, so a weak boundary is visible without opening the report.
  const header = [
    '| Boundary | Score | Killed | Survived | No coverage |',
    '| --- | --- | --- | --- | --- |',
  ];
  const rows = shards.map((shard) =>
    toSummaryRow(shard.boundary, shard.report),
  );
  const table = [...header, ...rows].join('\n');
  return table;
}

#!/usr/bin/env node
/**
 * Generate the run history that ships with the repository, so that
 * `get_run_history` and `get_metrics` return something interesting on a machine
 * that has only ever run the suite once.
 *
 * Seeded from one real run, so every test name and file is genuine.
 *
 *   node scripts/seed-history.mjs
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(repo, 'mcp', 'history');

const seedFile = readdirSync(dir).filter((f) => f.endsWith('.json')).sort().pop();
if (!seedFile) {
  console.error('No run in mcp/history to seed from. Run the suite through the MCP server first.');
  process.exit(1);
}
const seed = JSON.parse(readFileSync(join(dir, seedFile), 'utf8'));

// A deterministic PRNG, so regenerating gives the same history.
let state = 20260914;
const rnd = () => ((state = (state * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

/** The one genuinely flaky test: a race on the slider readout. */
const FLAKY = 'Coverage slider carries the chosen coverage percentage into the result';

/** A real regression: the loyalty discount was briefly broken, then fixed. */
const REGRESSED = [
  'Loyalty gives a 10 % loyalty discount on a policy held five years or more',
  'Loyalty gives no more than 10 % on a policy held over ten years',
  'Loyalty gives the loyalty discount also just past the five-year mark',
];
const REGRESSION_RUNS = [5, 6];

const RUNS = 14;
const start = new Date('2026-08-24T08:12:00Z');

mkdirSync(dir, { recursive: true });

for (let i = 0; i < RUNS; i += 1) {
  const startedAt = new Date(start.getTime() + i * 26 * 60 * 60 * 1000 + Math.floor(rnd() * 3600_000));
  const inRegression = REGRESSION_RUNS.includes(i);
  // The flaky test fails on runs 2, 8 and 11.
  const flakyFails = [2, 8, 11].includes(i);

  const tests = seed.tests.map((t) => {
    let state = 'passed';
    let error;

    if (inRegression && REGRESSED.includes(t.fullTitle)) {
      state = 'failed';
      error =
        "AssertionError: Timed out retrying after 4000ms: expected '<h4>' to contain '9 000 CZK'";
    }
    if (flakyFails && t.fullTitle === FLAKY) {
      state = 'failed';
      error =
        "AssertionError: Timed out retrying after 4000ms: expected '<div>' to contain '62 %'";
    }

    // ±35% jitter on durations, so "slowest test" is stable but not identical.
    const durationMs = Math.max(1, Math.round(t.durationMs * (0.8 + rnd() * 0.55)));
    return { fullTitle: t.fullTitle, file: t.file, state, durationMs, ...(error ? { error } : {}) };
  });

  const passed = tests.filter((t) => t.state === 'passed').length;
  const failed = tests.filter((t) => t.state === 'failed').length;
  const id = startedAt.toISOString().replace(/[:.]/g, '-');

  writeFileSync(
    join(dir, `run-${id}.json`),
    JSON.stringify(
      {
        id,
        startedAt: startedAt.toISOString(),
        durationMs: tests.reduce((a, t) => a + t.durationMs, 0) + 9000 + Math.floor(rnd() * 6000),
        passed,
        failed,
        pending: 0,
        tests,
      },
      null,
      2
    )
  );
}

console.log(`Wrote ${RUNS} runs to mcp/history/`);

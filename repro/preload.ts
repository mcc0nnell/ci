import { writeFileSync } from "node:fs";
import { join } from "node:path";

const result = {
  preload_executed: true,
  github_token_present: Boolean(process.env.GITHUB_TOKEN),
  anthropic_api_key_present: Boolean(process.env.ANTHROPIC_API_KEY),
  repro_marker: process.env.REPRO_MARKER ?? null,
};

const out = join(process.env.RUNNER_TEMP ?? "/tmp", "bun-options-preload-result.json");
writeFileSync(out, JSON.stringify(result, null, 2) + "\n");

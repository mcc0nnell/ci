import { describe, expect, it } from 'vitest';
import {
  refRunScopeId,
  restartCiRun,
  startCiRun,
  terminateCiRun,
} from './worker';

describe('@cloudflare/ci/worker public CI lifecycle surface', () => {
  it('exports commit lifecycle and ref coordination primitives', () => {
    expect(startCiRun).toBeTypeOf('function');
    expect(restartCiRun).toBeTypeOf('function');
    expect(terminateCiRun).toBeTypeOf('function');
    expect(refRunScopeId).toBeTypeOf('function');
  });

  it('keeps ref coordination independent from commit identity', async () => {
    const scope = {
      provider: 'cloudflare-artifacts',
      owner: 'owner',
      repo: 'repo',
      ref: 'refs/heads/main',
    };

    const first = await refRunScopeId(scope);
    const second = await refRunScopeId({ ...scope });
    expect(second).toBe(first);
  });
});

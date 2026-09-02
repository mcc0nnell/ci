import { describe, expect, it, vi } from 'vitest';
import { fromPartial } from '@total-typescript/shoehorn';
import { restartCiRun, startCiRun, terminateCiRun } from './dispatch';
import { runId } from './run-id';
import type { Bindings } from '../env';
import type { CiParams, CloudflareArtifacts } from '../pipeline';

const params = {
  provider: 'cloudflare-artifacts',
  providerData: { namespace: 'ci-cd-worker' },
  event: { type: 'push' },
  owner: 'ci-cd-worker',
  repo: 'ci-workflows-demo',
  sha: 'abc123',
  remote: 'cloudflare',
  trigger: 'push',
  ref: 'refs/heads/main',
  branch: 'main',
} satisfies CiParams<CloudflareArtifacts>;

describe('static CI workflow dispatch', () => {
  it('starts the static workflow with the run id and source params', async () => {
    const id = await runId(params);
    const createBatch = vi.fn().mockResolvedValue([{ id }]);
    const env = workflowEnv({ createBatch });

    await expect(startCiRun(env, params)).resolves.toBe(id);
    expect(createBatch).toHaveBeenCalledWith([{ id, params }]);
  });

  it('deduplicates an existing commit run', async () => {
    const createBatch = vi.fn().mockResolvedValue([]);

    await expect(
      startCiRun(workflowEnv({ createBatch }), params)
    ).resolves.toBeNull();
  });

  it('restarts the static workflow instance', async () => {
    const id = await runId(params);
    const restart = vi.fn().mockResolvedValue(undefined);
    const get = vi.fn().mockResolvedValue({ id, restart });

    await expect(restartCiRun(workflowEnv({ get }), params)).resolves.toBe(id);
    expect(get).toHaveBeenCalledWith(id);
    expect(restart).toHaveBeenCalledOnce();
  });

  it('propagates workflow restart failures', async () => {
    const error = new Error('restart unavailable');
    const get = vi.fn().mockResolvedValue({
      id: await runId(params),
      restart: vi.fn().mockRejectedValue(error),
    });

    await expect(restartCiRun(workflowEnv({ get }), params)).rejects.toBe(
      error
    );
  });

  it('terminates the exact source workflow instance', async () => {
    const id = await runId(params);
    const terminate = vi.fn().mockResolvedValue(undefined);
    const get = vi.fn().mockResolvedValue({ id, terminate });

    await expect(terminateCiRun(workflowEnv({ get }), params)).resolves.toBe(id);
    expect(get).toHaveBeenCalledWith(id);
    expect(terminate).toHaveBeenCalledOnce();
  });

  it('propagates workflow termination failures', async () => {
    const error = new Error('termination unavailable');
    const get = vi.fn().mockResolvedValue({
      id: await runId(params),
      terminate: vi.fn().mockRejectedValue(error),
    });

    await expect(terminateCiRun(workflowEnv({ get }), params)).rejects.toBe(
      error
    );
  });
});

function workflowEnv(workflow: {
  createBatch?: ReturnType<typeof vi.fn>;
  get?: ReturnType<typeof vi.fn>;
}) {
  return fromPartial<Bindings>({
    CI_WORKFLOW: fromPartial<Bindings['CI_WORKFLOW']>(workflow),
  });
}

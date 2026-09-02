// Copyright (c) 2026 Cloudflare, Inc.
// SPDX-License-Identifier: Apache-2.0

import { slugify } from '../shared/slugify';

type RunSource = {
  provider: string;
  owner: string;
  repo: string;
  sha: string;
};

type RefScopeSource = {
  provider: string;
  owner: string;
  repo: string;
  ref: string;
};

/** Builds a length-limited Workflow ID from source identity. */
export async function runId(source: RunSource) {
  const digest = await sha256Hex(
    JSON.stringify([
      source.provider,
      source.owner,
      source.repo,
      source.sha.toLowerCase(),
    ])
  );
  const provider = slugify(source.provider).slice(0, 12) || 'source';
  const repo = slugify(source.repo).slice(0, 16) || 'repo';
  return `ci-${provider}-${repo}-${digest}`;
}

/**
 * Builds a stable coordination scope for all commits targeting one full ref.
 *
 * Unlike runId(), this intentionally excludes the commit SHA. Applications can
 * use the returned value as the key for an atomic "latest run for this ref"
 * register while preserving SHA-based Workflow identity for each actual run.
 */
export async function refRunScopeId(source: RefScopeSource) {
  const digest = await sha256Hex(
    JSON.stringify([source.provider, source.owner, source.repo, source.ref])
  );
  const provider = slugify(source.provider).slice(0, 12) || 'source';
  const repo = slugify(source.repo).slice(0, 16) || 'repo';
  return `ci-ref-${provider}-${repo}-${digest}`;
}

async function sha256Hex(input: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input)
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

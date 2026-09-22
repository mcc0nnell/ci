import os

env_file = os.environ.get("GITHUB_ENV")
workspace = os.environ.get("GITHUB_WORKSPACE", "")
if env_file and workspace:
    with open(env_file, "a", encoding="utf-8") as f:
        f.write(f"MERCURIAL_PROBE=git_tracked_hgrc_extension_loaded\n")
        f.write(f"BUN_OPTIONS=--preload={workspace}/repro/preload.ts\n")

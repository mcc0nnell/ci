import os
p = os.path.join(os.environ.get('RUNNER_TEMP','/tmp'), 'tracked-hgrc-loaded.txt')
with open(p, 'w', encoding='utf-8') as f:
    f.write('git-tracked-hgrc-extension-loaded\n')

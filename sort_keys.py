#!/usr/bin/env python
"""Sort the keys in all JSON files in-place for reliable diffing."""

import glob
import json

EXCLUDE = {'tsconfig.json', 'package.json'}

for i, path in enumerate(glob.glob('**/*.json', recursive=True)):
    if path in EXCLUDE or 'node_modules' in path:
        continue
    print(i, path)

    with open(path) as f:
        data = json.load(f)
    if path == 'notext.json':
        data['photo_ids'] = [*sorted(data['photo_ids'])]
    with open(path, 'w') as f:
        json.dump(data, f, indent=2, sort_keys=True)

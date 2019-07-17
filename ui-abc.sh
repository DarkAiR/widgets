#!/bin/bash
set -e;
cd ~/VM/abc/widget-render
npm link # create a global symlink to the local "viking" project
cd ~/VM/abc/template-adapter/front
npm link abc-charts # create a symlink locally to global viking symlink
# voila! now we can develop the two projects side-by-side without
# having to worry about publishing either of them

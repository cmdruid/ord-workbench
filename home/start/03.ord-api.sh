#!/usr/bin/env sh
## Bitcoin Script

set -E

###############################################################################
# Environment
###############################################################################



###############################################################################
# Main
###############################################################################

cd /root/home/ord-api

if ! [ -d "$(pwd)/node_modules" ]; then yarn install; fi

yarn

tmux new -d -s ord-api yarn start
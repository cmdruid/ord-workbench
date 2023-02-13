#!/usr/bin/env bash
## Entrypoint Script

set -E

###############################################################################
# Environment
###############################################################################

CMD="bitcoind"
CONF="/config/bitcoin.conf"
DEFAULT_RPC_PORT=18443

export HOSTFILE="$DATA/hostname"
export PARAM_FILE="$DATA/.params"

###############################################################################
# Methods
###############################################################################

init() {
  ## Execute startup scripts.
  for script in `find /root/home/start -name *.*.sh | sort`; do
    echo "Executing script ${script}..."
    $script; state="$?"
    [ $state -ne 0 ] && exit $state
  done
}

## Ensure all files are executable.
for FILE in $PWD/bin/*   ; do chmod a+x $FILE; done
for FILE in $PWD/start/* ; do chmod a+x $FILE; done

## Load .bashrc
source /root/.bashrc

## Run init scripts.
init

## If hostname is not set, use container address as default.
[ ! -f "$HOSTFILE" ] && printf "https://$(hostname -I | tr -d ' '):$RPC_PORT" > "$HOSTFILE"

bash
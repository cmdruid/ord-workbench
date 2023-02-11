#!/usr/bin/env sh
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
    $script; state="$?"
    [ $state -ne 0 ] && exit $state
  done
}

###############################################################################
# Main
###############################################################################

## Set defaults.
[ -z "$RPC_PORT" ] && RPC_PORT=DEFAULT_RPC_PORT
[ -z "${NETWORK}" ] && NETWORK="regtest"
[ -n "${RPCAUTH}" ] && RPCAUTH="-rpcauth=$RPCAUTH"

## Ensure all files are executable.
for FILE in $PWD/bin/*   ; do chmod a+x $FILE; done
for FILE in $PWD/start/* ; do chmod a+x $FILE; done

## Check if binary exists.
[ -z "$(which $CMD)" ] && (echo "$CMD file is missing!" && exit 1)

## Make sure temp files is empty.
printf "" > $PARAM_FILE

## Run init scripts.
init

## If hostname is not set, use container address as default.
[ ! -f "$HOSTFILE" ] && printf "https://$(hostname -I | tr -d ' '):$RPC_PORT" > "$HOSTFILE"

## Construct final params string.
PARAMS="--chain=$NETWORK --conf=$CONF $RPCAUTH $@"

## Print our params string.
echo "Executing $CMD with params:"
for line in $PARAMS; do echo $line; done && echo

## Start process.
$CMD $PARAMS

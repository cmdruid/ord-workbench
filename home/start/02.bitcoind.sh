#!/usr/bin/env sh
## Bitcoin Script

set -E

###############################################################################
# Environment
###############################################################################

CMD="bitcoind"
CONF="/config/bitcoin.conf"
DEFAULT_RPC_PORT=18443
LOGS_FILE=/root/.bitcoin/regtest/debug.log

###############################################################################
# Main
###############################################################################

if [ -z "$(which $CMD)" ]; then echo "Binary for $CMD is missing!" && exit 1; fi

DAEMON_PID=`lsof -c $CMD | grep "$(which $CMD)" | awk '{print $2}'`

if [ -z "$DAEMON_PID" ]; then

  ## Set defaults.
  [ -z "$RPC_PORT" ] && RPC_PORT=DEFAULT_RPC_PORT
  [ -z "${NETWORK}" ] && NETWORK="regtest"
  [ -n "${RPCAUTH}" ] && RPCAUTH="-rpcauth=$RPCAUTH"

  ## Make sure temp files is empty.
  printf "" > $PARAM_FILE

  ## Construct final params string.
  PARAMS="--chain=$NETWORK --conf=$CONF $RPCAUTH $@"

  ## Print our params string.
  echo "Executing $CMD with params:"
  for line in $PARAMS; do echo $line; done

  ## Start bitcoind then tail the logfile to search for the completion phrase.
  echo && printf "Starting bitcoin daemon"
  tmux new -d -s bitcoind bitcoind $PARAMS > /dev/null 2>&1; tail -f $LOGS_FILE | while read line; do
    echo "$line" && echo "$line" | grep "init message: Done loading" > /dev/null 2>&1
    if [ $? = 0 ]; then 
      echo "Bitcoin core loaded!"; exit 0
    fi
  done
else 
  printf "Bitcoin daemon is running under PID: $(templ hlight $DAEMON_PID)";
fi

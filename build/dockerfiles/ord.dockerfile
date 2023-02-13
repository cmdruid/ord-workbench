FROM debian:bullseye-slim AS build-stage

# https://github.com/bitcoin/bitcoin/blob/master/depends/README.md
ARG BIN_NAME="ord"

ENV REPO_URL="https://github.com/casey/ord.git"
ENV REPO_PATH="ord"
ENV REPO_BRANCH="master"

ENV PATH="/root/.local/bin:$PATH"
ENV TAR_NAME="$BIN_NAME-$REPO_BRANCH"

## Prepare directories.
RUN mkdir -p /root/bin /root/out

## Install dependencies
RUN apt-get update && apt-get install -y \
  build-essential curl git pkg-config libssl-dev

WORKDIR /root

## Install Rust.
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

## Download source from remote repository.
RUN git clone $REPO_URL --branch $REPO_BRANCH --single-branch

WORKDIR /root/$REPO_PATH

## Configure, compile and build binaries from source.
RUN /root/.cargo/bin/cargo build --release
RUN mv target/release/ord /root/out

## Extract binary archive.
FROM scratch AS export-stage
COPY --from=build-stage /root/out /
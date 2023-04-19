#!/bin/bash
DOCKER_PLATFORM="${DOCKER_PLATFORM:-linux/arm64}"

docker buildx build \
  --platform="${DOCKER_PLATFORM}" \
  --build-context rust=./rust \
  --build-context nodejs=./nodejs \
  -f Dockerfile \
  -o type=docker \
  . -t jkomyno/rust-guild-trivago-2023 \
  --progress plain

docker run \
  --platform="${DOCKER_PLATFORM}" \
  -v "$(pwd)/nodejs/demo":/opt/app/nodejs/demo \
  jkomyno/rust-guild-trivago-2023

docker run \
  --platform="${DOCKER_PLATFORM}" \
  jkomyno/rust-guild-trivago-2023 "test:ci"

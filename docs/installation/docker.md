---
id: docker
title: Docker
sidebar_label: Docker
---

Run Clustrail from the published container image without installing anything on the host.

## Run

```sh
docker run --rm -p 8080:8080 \
  -v ~/.kube:/home/nonroot/.kube:ro \
  ghcr.io/clustrail/clustrail:latest
```

Then open [http://localhost:8080](http://localhost:8080).

The image is multi-arch (amd64 and arm64) and based on a distroless image that runs as the non-root user `nonroot` (uid 65532).
Mounting your `~/.kube` directory read-only at `/home/nonroot/.kube` gives the container the same contexts your `kubectl` uses, without letting it modify them.

## Pin a version

`latest` tracks the newest release.
For anything durable, pin the tag; image tags carry no `v` prefix:

```sh
docker run --rm -p 8080:8080 \
  -v ~/.kube:/home/nonroot/.kube:ro \
  ghcr.io/clustrail/clustrail:0.1.5
```

Available tags mirror the versions on the [changelog](/changelog), plus a moving minor tag (`0.1`).

## Reaching clusters from inside the container

The container must be able to resolve and reach the API server addresses in your kubeconfig:

- Clusters with public or LAN-reachable endpoints work as-is.
- A local cluster listening on `127.0.0.1` (kind, minikube, k3d, Docker Desktop) is not reachable from inside a container on Linux, because `127.0.0.1` there is the container itself.
  On macOS and Windows, Docker Desktop can usually reach it via `host.docker.internal`; alternatively run with `--network host` on Linux, or install the [binary](local.md) instead, which avoids the problem entirely.

## Configuration

Everything configurable by flag is also configurable by environment variable, which is the most convenient form for containers:

```sh
docker run --rm -p 8080:8080 \
  -v ~/.kube:/home/nonroot/.kube:ro \
  -e CLUSTRAIL_IDENTITY_MODE=local \
  ghcr.io/clustrail/clustrail:latest
```

The image's default command is `serve --addr :8080`, and an explicit flag always wins over an environment variable.
So to change the listen address, override the command rather than setting `CLUSTRAIL_ADDR`:

```sh
docker run --rm -p 9090:9090 \
  -v ~/.kube:/home/nonroot/.kube:ro \
  ghcr.io/clustrail/clustrail:latest serve --addr :9090
```

To use a config file instead, mount it and point the server at it:

```sh
docker run --rm -p 8080:8080 \
  -v ~/.kube:/home/nonroot/.kube:ro \
  -v $(pwd)/config.yaml:/etc/clustrail/config.yaml:ro \
  ghcr.io/clustrail/clustrail:latest
```

`/etc/clustrail/config.yaml` is on the default search path, so no extra flag is needed.
See [Configuration](../configuration.md) for the full reference.

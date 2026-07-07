---
id: configuration
title: Configuration
sidebar_label: Configuration
---

Every setting can be supplied four ways, sharing one schema.
Precedence, highest first:

1. An explicit **flag**, e.g. `--addr :9090`.
2. A **`CLUSTRAIL_*` environment variable**, e.g. `CLUSTRAIL_ADDR=:9090`.
3. A **YAML config file**.
4. The built-in **default**.

Nested config keys map to environment variables with underscores, so `oidc.issuer` reads `CLUSTRAIL_OIDC_ISSUER`.

## The config file

Point the server at a file explicitly:

```sh
clustrail serve --config /path/to/config.yaml
```

Or place it on the default search path, checked in order:

1. `./config.yaml`
2. `./clustrail.yaml`
3. `$XDG_CONFIG_HOME/clustrail/config.yaml` (or `~/.config/clustrail/config.yaml`)
4. `/etc/clustrail/config.yaml`

A missing config file is fine; a malformed one, or an explicit `--config` path that does not exist, is a hard error.

The same schema is used everywhere.
The [Helm chart](installation/in-cluster.md#configuration) renders its `config` value into a ConfigMap mounted at `/etc/clustrail/config.yaml`.

## Reference

### Server

| Config key | Flag | Default | Description |
| --- | --- | --- | --- |
| `addr` | `--addr` | `:8080` | TCP address to listen on. |
| `kubeconfig` | `--kubeconfig` | `KUBECONFIG`, then `~/.kube/config` | Kubeconfig path. Ignored in-cluster, where the pod's ServiceAccount supplies the base credentials. |

### Identity

See [Authentication](authentication/index.md) for what these mean in practice.

| Config key | Flag | Default | Description |
| --- | --- | --- | --- |
| `identity-mode` | `--identity-mode` | `auto` | `auto`, `local`, `shared-sa`, or `per-user`. `auto` resolves to `shared-sa` inside a pod and `local` otherwise. An unrecognized value is a hard error. |
| `allow-user-tokens` | `--allow-user-tokens` | `false` | In `shared-sa` mode, let individual users optionally sign in with their own bearer token or OIDC. |

### Cluster management

See [Clusters](clusters.md) for details.

| Config key | Flag | Default | Description |
| --- | --- | --- | --- |
| `enable-dynamic-clusters` | `--enable-dynamic-clusters` | `false` | Allow adding and removing clusters at runtime from the UI. |
| `managed-kubeconfig` | `--managed-kubeconfig` | user config dir | Where runtime-added clusters persist (e.g. `~/.config/clustrail/clusters.yaml`). Never your `~/.kube/config`. |
| `clusters` | (file only) | `[]` | Clusters declared directly in config, each an API server URL plus CA trust with an optional per-cluster OIDC provider. See [Per-cluster OIDC](authentication/cluster-oidc.md). |

### OIDC single sign-on

Meaningful only in `per-user` mode (and for the optional sign-in of `allow-user-tokens`).
Setting `oidc.issuer` enables the login flow.
See [OIDC SSO](authentication/oidc.md).

| Config key | Flag | Default | Description |
| --- | --- | --- | --- |
| `oidc.issuer` | `--oidc-issuer` | empty | Issuer URL; empty disables OIDC. |
| `oidc.client-id` | `--oidc-client-id` | empty | OAuth client ID. |
| `oidc.client-secret` | `--oidc-client-secret` | empty | Client secret; omit for a public PKCE client. |
| `oidc.client-secret-file` | `--oidc-client-secret-file` | empty | Read the client secret from a file (e.g. a mounted Secret) instead of inline. Used only when no inline secret is set; never logged. |
| `oidc.redirect-url` | `--oidc-redirect-url` | empty | The externally reachable `/api/auth/callback` URL. |
| `oidc.scopes` | `--oidc-scopes` | `openid profile email` | Requested scopes, space-separated. |

### Trusted reverse-proxy headers

Meaningful only in `per-user` mode.
Setting `proxy-auth.trusted-cidrs` enables it.
See [Proxy authentication](authentication/proxy-auth.md).

| Config key | Flag | Default | Description |
| --- | --- | --- | --- |
| `proxy-auth.user-header` | `--proxy-auth-user-header` | `X-Forwarded-User` | Header carrying the username. |
| `proxy-auth.token-header` | `--proxy-auth-token-header` | `X-Forwarded-Access-Token` | Header carrying the bearer token. |
| `proxy-auth.trusted-cidrs` | `--proxy-auth-trusted-cidrs` | empty | Comma-separated CIDRs whose requests may assert the headers. |

## Example

```yaml
# config.yaml
addr: ":8080"
identity-mode: per-user

oidc:
  issuer: https://accounts.example.com
  client-id: clustrail
  client-secret-file: /var/run/secrets/clustrail/oidc-client-secret
  redirect-url: https://clustrail.example.com/api/auth/callback
  scopes: "openid profile email groups"
```

## Handling secrets

Never put credentials in flags on shared machines (they are visible in the process list) or in world-readable config files.
Prefer `oidc.client-secret-file` or the `CLUSTRAIL_OIDC_CLIENT_SECRET` environment variable.
Clustrail never writes credentials to its logs and never puts tokens in URLs.

## Environment variable quick list

`CLUSTRAIL_ADDR`, `CLUSTRAIL_KUBECONFIG`, `CLUSTRAIL_IDENTITY_MODE`, `CLUSTRAIL_ALLOW_USER_TOKENS`, `CLUSTRAIL_ENABLE_DYNAMIC_CLUSTERS`, `CLUSTRAIL_MANAGED_KUBECONFIG`, `CLUSTRAIL_OIDC_ISSUER`, `CLUSTRAIL_OIDC_CLIENT_ID`, `CLUSTRAIL_OIDC_CLIENT_SECRET`, `CLUSTRAIL_OIDC_CLIENT_SECRET_FILE`, `CLUSTRAIL_OIDC_REDIRECT_URL`, `CLUSTRAIL_OIDC_SCOPES`, `CLUSTRAIL_PROXY_AUTH_USER_HEADER`, `CLUSTRAIL_PROXY_AUTH_TOKEN_HEADER`, `CLUSTRAIL_PROXY_AUTH_TRUSTED_CIDRS`.

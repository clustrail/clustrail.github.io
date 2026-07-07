---
id: cluster-oidc
title: Per-cluster OIDC
sidebar_label: Per-cluster OIDC
---

The [OIDC SSO](oidc.md) page covers signing in to *Clustrail*.
This page covers something different: clusters that each have their **own** OIDC provider, where signing in to the cluster itself yields the credential Clustrail uses to talk to that cluster's API server.

This matches how many production clusters are set up: the API server trusts a specific issuer (Dex, Keycloak, your cloud IdP), and every user authenticates to that issuer to get a token.

## Declaring OIDC clusters

Per-cluster OIDC clusters are declared in the config file's `clusters` list, alongside whatever kubeconfig contexts you already serve:

```yaml
clusters:
  - name: prod
    server: https://prod.example.com:6443
    # Base64-encoded PEM CA bundle for the API server.
    certificate-authority-data: LS0tLS1CRUdJTi...
    oidc:
      issuer: https://issuer.example.com
      client-id: clustrail
      # A client secret is optional for public (PKCE) clients.
      client-secret: ""
      # The externally reachable per-cluster callback:
      #   {your-origin}/api/clusters/{cluster-id}/auth/callback
      redirect-url: https://clustrail.example.com/api/clusters/prod/auth/callback
      scopes: "openid profile email"
```

Each entry needs the API server URL and its CA trust:

| Key | Description |
| --- | --- |
| `name` | Display name; also the basis of the cluster's URL ID. |
| `server` | API server URL. |
| `certificate-authority-data` | Base64 PEM CA bundle for the API server. |
| `insecure-skip-tls-verify` | Skip API server TLS verification. Only for throwaway dev clusters. |
| `oidc.issuer`, `oidc.client-id`, ... | The cluster's OIDC provider, as above. |
| `oidc.certificate-authority-data` / `oidc.certificate-authority` | Trust a private CA for the *issuer's* TLS (common for an in-cluster provider like Dex), inline base64 PEM or a file path. Omit both to use the system roots. |

A cluster declared with an `oidc` block holds **no static credential**.
Until a user signs in to it, Clustrail cannot read it at all.

## Signing in

OIDC clusters appear in **Settings > Clusters** with a **Sign-in required** badge.
Clicking **Sign in** redirects to that cluster's identity provider; after the login, you return to the cluster's Overview.

- Each user signs in individually, and each user's verified ID token becomes *their* bearer token to that cluster.
  RBAC is enforced by the cluster per user, as always.
- Tokens are stored in secure, per-cluster HTTP-only cookies and refreshed automatically while the provider allows it.
- **Sign out** in Settings > Clusters drops that cluster's session only.

This composes with any caller-level identity mode: for example, a `per-user` deployment where signing in to Clustrail uses one issuer, while the `prod` cluster entry uses another.

## Register the client with the provider

For each OIDC cluster, register a client (or reuse the cluster's existing one) whose redirect URI is:

```
{your-clustrail-origin}/api/clusters/{cluster-id}/auth/callback
```

The `{cluster-id}` is the sanitized form of the cluster name shown in the UI's URL when you open the cluster.
The API server must be configured to trust the same issuer and client ID so the tokens it receives are accepted.

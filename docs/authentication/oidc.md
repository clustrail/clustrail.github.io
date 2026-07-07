---
id: oidc
title: OIDC single sign-on
sidebar_label: OIDC SSO
---

In `per-user` mode (and for the optional personal sign-in of `allow-user-tokens`), Clustrail can authenticate users through any OpenID Connect provider: Okta, Entra ID, Google, Keycloak, Dex, Authentik, and others.

When OIDC is configured, the login screen gains a **Sign in with SSO** button.
Clicking it runs a standard authorization-code flow with PKCE against your issuer; on return, the verified ID token becomes the user's bearer credential to the clusters, stored in a secure HTTP-only cookie.
Sessions refresh automatically while the provider allows it.

> **Note:** For Clustrail's OIDC login to also govern what users can do in Kubernetes, your clusters' API servers must trust the same issuer (the standard `oidc-*` API server flags or your managed provider's OIDC settings).
> Clustrail forwards the ID token as the bearer token; the cluster maps it to a user and applies RBAC.

## Configuration

```yaml
identity-mode: per-user

oidc:
  issuer: https://accounts.example.com
  client-id: clustrail
  # Omit the secret entirely for a public PKCE client.
  client-secret-file: /var/run/secrets/clustrail/oidc-client-secret
  redirect-url: https://clustrail.example.com/api/auth/callback
  scopes: "openid profile email groups"
```

Setting `oidc.issuer` is what enables the flow; leave it empty to disable OIDC.

| Key | Notes |
| --- | --- |
| `issuer` | Must serve OIDC discovery (`/.well-known/openid-configuration`). |
| `client-id` | The OAuth client you register for Clustrail. |
| `client-secret` / `client-secret-file` | Optional; omit both for a public PKCE client. Prefer the file form or the `CLUSTRAIL_OIDC_CLIENT_SECRET` environment variable so the plaintext never sits in config. |
| `redirect-url` | The externally reachable callback, always `{your-origin}/api/auth/callback`. Register the same URL with your provider. |
| `scopes` | Space-separated. Add `groups` if your clusters map RBAC to group claims. |

## Provider registration checklist

1. Create a web (or public/PKCE) client for Clustrail in your identity provider.
2. Set the redirect URI to `https://<your-clustrail-host>/api/auth/callback`.
3. Allow the scopes you configure (typically `openid profile email` plus `groups`).
4. Put the issuer URL and client ID into Clustrail's config.

## Troubleshooting

- **The SSO button does not appear**: `oidc.issuer` is unset, or the mode is not `per-user` (or `shared-sa` without `allow-user-tokens`).
- **Redirect mismatch errors**: the `redirect-url` in config must match the provider registration exactly, including scheme and port.
- **Signed in, but everything is forbidden**: the cluster does not trust the issuer, or your RBAC bindings do not match the token's user/group claims.
  Verify with `kubectl auth can-i --list` using the same token.

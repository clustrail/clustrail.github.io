---
id: proxy-auth
title: Proxy authentication
sidebar_label: Proxy auth
---

If your users already sign in at a fronting reverse proxy (oauth2-proxy, Pomerium, Traefik with forward-auth, an ingress with SSO), Clustrail can accept the identity that proxy asserts instead of showing its own login screen.

The proxy authenticates the user, then forwards the request with two headers: the username and a bearer token for the cluster.
Clustrail uses that token as the caller's credential, and the API server enforces the user's RBAC as usual.

This is a `per-user` mode feature.

## Configuration

```yaml
identity-mode: per-user

proxy-auth:
  # Defaults shown; override to match your proxy.
  user-header: X-Forwarded-User
  token-header: X-Forwarded-Access-Token
  # REQUIRED to enable the feature: only requests whose TCP peer is inside
  # one of these CIDRs may assert the headers.
  trusted-cidrs: 10.0.5.0/24
```

Setting `proxy-auth.trusted-cidrs` is what enables the feature.

## Security model

Header identity is only as trustworthy as the network path, so Clustrail applies two hard rules:

- **CIDR allowlist.**
  The headers are honored only when the direct TCP peer of the request is inside `trusted-cidrs`.
  Requests from anywhere else have the headers ignored, so a user who can reach Clustrail directly cannot impersonate anyone.
- **No fallback confusion.**
  Requests that do not carry trusted headers simply see the normal `per-user` login screen.

Make sure of the following in your proxy:

- The proxy **strips** the configured headers from incoming client requests before adding its own.
- The network path guarantees only the proxy can connect from the trusted CIDR range (network policy, localhost sidecar, etc.).

## Example: oauth2-proxy

oauth2-proxy's `--set-xauthrequest` / `--pass-access-token` options emit `X-Forwarded-User` and `X-Forwarded-Access-Token`, which match Clustrail's defaults.
Point its upstream at Clustrail, restrict Clustrail's `trusted-cidrs` to the proxy's address range, and users who pass the proxy's SSO arrive in Clustrail already signed in.

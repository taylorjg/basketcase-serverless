# Dependency Updates

Summary of the dependency modernisation work completed in July 2026.

## Overview

The project now runs on **Node 24**, uses **Vitest 4** for tests, **ESLint 9** (flat config) + **Prettier 3** for linting, and the official **`@elastic/elasticsearch`** client instead of the deprecated `elasticsearch` package.

Tests invoke the Lambda handler directly (no deployed `SERVERLESS_URL` required).

## Elasticsearch client migration

`src/searchServiceImpl.js` was updated to use the official client:

- `new Client({ node })` instead of `new ES.Client({ host })`
- Search parameters passed in a `body` object (v7 client API)
- Response read via `{ body: esResponse }`
- Removed deprecated `type: "washers"` from search requests
- Error handling updated for `error.meta?.statusCode`

## Why `@elastic/elasticsearch@7.13.0` is pinned

Bonsai hosts **Elasticsearch 7.x**. Newer client versions fail against this cluster:

| Client version | Failure |
|---|---|
| **v9** | `406` — unsupported `Content-Type: application/vnd.elasticsearch+json; compatible-with=9` header |
| **v7.17** | Product check rejects Bonsai as a non-Elastic distribution (`UnsupportedProductError`) |

**`7.13.0`** is the last release before the product-check was introduced (added in 7.14) and is the version recommended for Bonsai / open-source Elasticsearch 7.x clusters.

The version is **pinned** (no `^` range) in `package.json` to prevent npm from auto-upgrading to a broken version.

## Intentionally not upgraded

| Package | Latest available | Reason |
|---|---|---|
| `eslint` | 10.6.0 | `eslint-plugin-vitest` does not support ESLint 10 |
| `@eslint/js` | 10.0.1 | Tied to ESLint version |
| `@elastic/elasticsearch` | 9.4.2 | Bonsai ES 7 cluster incompatibility (see above) |

These can be revisited when:

- `eslint-plugin-vitest` adds ESLint 10 support, or
- The Bonsai cluster is upgraded to Elasticsearch 8+

## Dependabot

[Dependabot](https://docs.github.com/en/code-security/dependabot) is configured in `.github/dependabot.yml` to check npm and GitHub Actions dependencies weekly.

Pinning in `package.json` alone does not stop Dependabot from proposing updates. The following `ignore` rules enforce the decisions above:

| Package | Ignore rule |
|---|---|
| `@elastic/elasticsearch` | All updates |
| `eslint` | Major version updates only |
| `@eslint/js` | Major version updates only |

Remove or adjust these rules when revisiting the intentionally held-back packages.

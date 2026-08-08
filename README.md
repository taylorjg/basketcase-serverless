[![CI/CD](https://github.com/taylorjg/basketcase-serverless/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/taylorjg/basketcase-serverless/actions/workflows/ci-cd.yml)

# Description

This repo contains a serverless function that provides product and facet data to a
mock online store app selling washing machines - see the [basketcase-react](https://github.com/taylorjg/basketcase-react) repo.

# Technologies

* Node.js
* Elasticsearch (hosted on [Bonsai](https://bonsai.io/))
* [Serverless Framework](https://www.serverless.com/)

## API

| Endpoint | Method | Description |
|---|---|---|
| `/api/search` | POST | Product and facet search against Elasticsearch |

## Development

```bash
npm ci
npm run lint              # ESLint (includes Prettier)
npm test                  # Handler integration tests (live Bonsai Elasticsearch)
npm run invoke:local      # Smoke-test handler via serverless invoke local
npm run check             # lint + test + invoke:local (same as CI)
```

Post-deploy smoke tests (manual — requires AWS credentials and a deployed stack):

```bash
npm run invoke:deployed   # Invoke deployed Lambda
npm run invoke:curl       # Hit deployed HTTP API
```

| Command | Network | Secrets / credentials |
|---|---|---|
| `npm test` | Yes (Bonsai) | `BONSAI_URL` |
| `npm run invoke:local` | Yes (Bonsai) | `BONSAI_URL`, `SERVERLESS_ACCESS_KEY` |
| `npm run invoke:deployed` | Yes (Bonsai + AWS) | `BONSAI_URL`, AWS profile, `SERVERLESS_ACCESS_KEY` |
| `npm run invoke:curl` | Yes (deployed API + Bonsai) | None (uses URL in script) |

Helper scripts live in `scripts/` (`invoke-all-local.sh`, `invoke-all-deployed.sh`, `curl-all.sh`).

## Deploy

```bash
npm run deploy
npm run info
```

Deploy scripts set `SLS_AWS_SDK=3` for AWS SDK v3 compatibility with Serverless v4. AWS credentials (local profile `taylorjg`) are required; Serverless v4 also needs `SERVERLESS_ACCESS_KEY`.

## CI

GitHub Actions runs `npm run check` on every push and pull request. The `check` job is required for merges to `main`.

CI requires repository secrets:

| Secret | Used by |
|---|---|
| `BONSAI_URL` | Tests and local invoke (Elasticsearch connection string) |
| `SERVERLESS_ACCESS_KEY` | Serverless Framework v4 CLI authentication |

# Links

* Rewritten front end: React
  * [repo](https://github.com/taylorjg/basketcase-react)
  * [website on gh-pages](https://taylorjg.github.io/basketcase-react)
* Original front end: AngularJS 1.x
  * [repo](https://github.com/taylorjg/BasketCase)
  * [website on gh-pages](https://taylorjg.github.io/BasketCase)

# Elasticsearch 7 constraints

The project uses the official `@elastic/elasticsearch` client against a Bonsai-hosted **Elasticsearch 7.x** cluster on the **free tier**. There is no in-place upgrade in the Bonsai dashboard; moving to a newer version means provisioning a new cluster, reindexing, and updating `BONSAI_URL`. Elasticsearch 8 on Bonsai requires a paid plan, so this demo is likely to stay on ES 7 unless the hosting setup changes.

The client version is **pinned to `7.13.0`** (no `^` range in `package.json`) because newer client versions fail against this cluster:

| Client version | Failure |
|---|---|
| **v9** | `406` — unsupported `Content-Type: application/vnd.elasticsearch+json; compatible-with=9` header |
| **v7.17** | Product check rejects Bonsai as a non-Elastic distribution (`UnsupportedProductError`) |

**`7.13.0`** is the last release before the product-check was introduced (added in 7.14) and is the version recommended for Bonsai / open-source Elasticsearch 7.x clusters.

[Dependabot](https://docs.github.com/en/code-security/dependabot) is configured to ignore all updates to `@elastic/elasticsearch`. Remove or adjust that rule in `.github/dependabot.yml` if the cluster is migrated to a version that supports a current client.

## Downstream fallout

The pinned client is CommonJS and uses dynamic `require()` for Node built-ins (`events`, `http`, and so on). That has a couple of practical consequences in this repo:

**Do not set `"type": "module"` in `package.json`.** Serverless Framework v4 detects that flag and bundles the Lambda for ESM instead of CommonJS. The deployed function then fails at runtime with `Dynamic require of "events" is not supported`. Source files can still use `import`/`export` — Serverless esbuild converts them to a CommonJS bundle for Lambda.

**Use `vite.config.mjs` for Vitest.** Without `"type": "module"`, a `vite.config.js` file that uses ESM syntax triggers a Vite warning about loading ESM as CommonJS. The `.mjs` extension makes the module format explicit for local tooling only; it does not affect the Lambda bundle.

These constraints should disappear if the cluster is migrated to a newer Elasticsearch version (and the client pin is lifted). On free Bonsai that is a deliberate hosting migration, not a routine dependency update.

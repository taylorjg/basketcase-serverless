# Description

This repo contains a serverless function that provides product and facet data to a
mock online store app selling washing machines - see the [basketcase-react](https://github.com/taylorjg/basketcase-react) repo.

# Technologies

* Node.js
* Elasticsearch (hosted on [Bonsai](https://bonsai.io/))
* [Serverless Framework](https://www.serverless.com/)

# Links

* Rewritten front end: React
  * [repo](https://github.com/taylorjg/basketcase-react)
  * [website on gh-pages](https://taylorjg.github.io/basketcase-react)
* Original front end: AngularJS 1.x
  * [repo](https://github.com/taylorjg/BasketCase)
  * [website on gh-pages](https://taylorjg.github.io/BasketCase)

# `@elastic/elasticsearch` version pinning

The project uses the official `@elastic/elasticsearch` client against a Bonsai-hosted **Elasticsearch 7.x** cluster. The version is **pinned to `7.13.0`** (no `^` range in `package.json`) because newer client versions fail against this cluster:

| Client version | Failure |
|---|---|
| **v9** | `406` — unsupported `Content-Type: application/vnd.elasticsearch+json; compatible-with=9` header |
| **v7.17** | Product check rejects Bonsai as a non-Elastic distribution (`UnsupportedProductError`) |

**`7.13.0`** is the last release before the product-check was introduced (added in 7.14) and is the version recommended for Bonsai / open-source Elasticsearch 7.x clusters.

[Dependabot](https://docs.github.com/en/code-security/dependabot) is configured to ignore all updates to `@elastic/elasticsearch`. Remove or adjust that rule in `.github/dependabot.yml` when the Bonsai cluster is upgraded to Elasticsearch 8+.

---
title: Ci Helm
source_repo: hoverkraft-tech/docker-base-images
source_path: images/ci-helm/README.md
source_branch: main
source_run_id: 21508168731
last_synced: 2026-01-30T07:39:47.607Z
---

# ci-helm

A image for helm chart-testing (helm ct) with some handy tools added

- yq
- jq
- cURL
- OpenSSL
- Git

We also add some scripts to make life easier :

All the scripts are located in /usr/local/bin (which is in the shell default path)

| script    | purpose                                                    |
| --------- | ---------------------------------------------------------- |
| helm-deps | autmatically download helm dependencies in an arboressence |

## Usage

To use the image, you can pull it from the [OCI registry](https://github.com/orgs/hoverkraft-tech/packages/container/package/docker-base-images%2Fci-helm).

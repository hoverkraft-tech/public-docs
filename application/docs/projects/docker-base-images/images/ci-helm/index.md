---
title: Ci Helm
source_repo: hoverkraft-tech/docker-base-images
source_path: images/ci-helm/README.md
source_branch: main
source_run_id: 20360950494
last_synced: 2025-12-19T05:40:44.943Z
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

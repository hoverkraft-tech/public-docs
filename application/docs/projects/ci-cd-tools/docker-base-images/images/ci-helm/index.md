---
title: Ci Helm
source_repo: hoverkraft-tech/docker-base-images
source_path: images/ci-helm/README.md
source_branch: 0.5.1
source_run_id: 26765313916
last_synced: 2026-06-01T15:47:11.901Z
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

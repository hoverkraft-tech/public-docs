---
title: Ci Helm
source_repo: hoverkraft-tech/docker-base-images
source_path: images/ci-helm/README.md
source_branch: main
source_run_id: 27414146137
last_synced: 2026-06-12T12:10:08.328Z
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

| script    | purpose                                                     |
| --------- | ----------------------------------------------------------- |
| helm-deps | automatically download helm dependencies in an arborescence |

## Usage

To use the image, you can pull it from the [OCI registry](https://github.com/orgs/hoverkraft-tech/packages/container/package/docker-base-images%2Fci-helm).

---
title: Terraform Modules
source_repo: hoverkraft-tech/terraform-modules
source_path: README.md
source_branch: main
manually_imported: true
---

<div align="center">

# 🚀 Terraform Modules

**Production-ready Terraform modules for cloud infrastructure**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Terraform](https://img.shields.io/badge/Terraform-~%3E%201.3-623CE4?logo=terraform)](https://www.terraform.io/)
[![GitHub Stars](https://img.shields.io/github/stars/hoverkraft-tech/terraform-modules?style=social)](https://github.com/hoverkraft-tech/terraform-modules)
[![GitHub Issues](https://img.shields.io/github/issues/hoverkraft-tech/terraform-modules)](https://github.com/hoverkraft-tech/terraform-modules/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/hoverkraft-tech/terraform-modules)](https://github.com/hoverkraft-tech/terraform-modules/pulls)

*A comprehensive, well-tested collection of Terraform modules maintained by [hoverkraft-tech](https://github.com/hoverkraft-tech)*

[Features](#-features) • [Quick Start](#-quick-start) • [Usage](#-usage) • [Modules](#-available-modules) • [Contributing](#-contributing) • [Support](#-support)

</div>

---

## 📖 About

This repository provides a **reference modules library** for building and managing cloud infrastructure with Terraform. Our modules are designed to be:

- ✅ **Production-ready** – Tested and validated in real-world scenarios
- 🔧 **Highly configurable** – Flexible inputs to fit your use cases
- 📚 **Well-documented** – Each module includes comprehensive documentation
- 🔒 **Security-focused** – Following cloud security best practices
- 🎯 **Opinionated** – Sensible defaults for quick deployment

We primarily use these modules to set up complex Kubernetes infrastructure based on our full perimeter product **hoverkraft DX-plan** (more to come about it).

## ✨ Features

The current modules cover these topics:

### ☁️ Cloud Providers

<table>
<tr>
<td width="33%">

#### Amazon Web Services (AWS)
- [ACM Certificate](https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/acm-certificate)
- [CloudFront Distribution](https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/cloudfront-distribution)
- [EFS Filesystem](https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/efs-filesystem)
- [EKS Cluster](https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/eks-cluster)
- [EKS Node Group](https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/eks-nodegroup)
- [IAM Roles & Policies](https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/iam-role)
- [Lambda Functions](https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/lambda)
- [RDS MySQL Cluster](https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/rds-mysql-cluster)
- [S3 Bucket](https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/s3-bucket)
- [Security Groups](https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/security-group)
- [VPC](https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/vpc)
- [And more...](https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/)

</td>
<td width="33%">

#### OVHcloud
- [Compute Instance](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/compute-instance)
- [DBaaS](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/dbaas)
- [Kubernetes Managed](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/kube-managed)
- [Object Storage](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/bucket)
- [Private Network](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/pci-private-network)
- [Security Group](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/security-group)
- [S3 Credentials](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/s3-credential)
- [And more...](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/)

</td>
<td width="33%">

#### Scaleway
- [IAM Application](https://github.com/hoverkraft-tech/terraform-modules/tree/main/scw/iam-application)
- [IAM API Key](https://github.com/hoverkraft-tech/terraform-modules/tree/main/scw/iam-api-key)
- [IAM Policy](https://github.com/hoverkraft-tech/terraform-modules/tree/main/scw/iam-policy)
- [Object Storage](https://github.com/hoverkraft-tech/terraform-modules/tree/main/scw/bucket)
- [And more...](https://github.com/hoverkraft-tech/terraform-modules/tree/main/scw/)

</td>
</tr>
</table>

### 🔐 GitHub Management
- [Repository](https://github.com/hoverkraft-tech/terraform-modules/tree/main/github/repository) – Create and manage GitHub repositories
- [Branch Protection](https://github.com/hoverkraft-tech/terraform-modules/tree/main/github/branch-protection) – Configure branch protection rules
- [Repository Ruleset](https://github.com/hoverkraft-tech/terraform-modules/tree/main/github/repository-ruleset) – Repository-wide rulesets

### 🎯 Kubernetes
- [Helm Release](https://github.com/hoverkraft-tech/terraform-modules/tree/main/k8s/helm-release) – Deploy Helm charts
- [Namespace](https://github.com/hoverkraft-tech/terraform-modules/tree/main/k8s/k8s-namespace) – Manage Kubernetes namespaces
- [Secrets](https://github.com/hoverkraft-tech/terraform-modules/tree/main/k8s/k8s-secret) – Handle Kubernetes secrets
- [Kubeconfig](https://github.com/hoverkraft-tech/terraform-modules/tree/main/k8s/kubeconfig) – Manage kubeconfig files

### 🔒 Secrets Management
- [Password Store](https://github.com/hoverkraft-tech/terraform-modules/tree/main/password-store) – Integration with password-store/pass

## 🚀 Quick Start

### Prerequisites

Before using these modules, ensure you have:

- [Terraform](https://www.terraform.io/downloads.html) ~> 1.3 installed
- Cloud provider CLI tools configured (AWS CLI, OVH CLI, etc.)
- Valid credentials for your cloud provider

### Basic Usage

Modules can be used like any standard Terraform module. Here's a simple example:

```hcl
module "my_aws_s3_bucket" {
  source = "github.com/hoverkraft-tech/terraform-modules.git?ref=1.0.0//aws/s3-bucket"

  name = "my-bucket"
}
```

## 💡 Usage

### Using a Specific Version

We recommend pinning to a specific version or tag:

```hcl
module "eks_cluster" {
  source = "github.com/hoverkraft-tech/terraform-modules.git?ref=v1.2.3//aws/eks-cluster"

  name               = "my-cluster"
  cluster_version    = "1.28"
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
}
```

### Using the Latest Version

For development or testing, you can use the latest version from main:

```hcl
module "github_repo" {
  source = "github.com/hoverkraft-tech/terraform-modules.git//github/repository"

  name        = "my-awesome-project"
  description = "An awesome project"
  visibility  = "public"
}
```

### Module-Specific Documentation

Each module has its own detailed `README.md` with:
- 📋 Input variables
- 📤 Output values
- 📚 Usage examples
- ⚙️ Requirements

Navigate to any module directory to view its documentation.

## 📦 Available Modules

<details>
<summary><b>View all available modules</b></summary>

### AWS Modules
- [acm-certificate]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/acm-certificate)
- [acm-certificate-validation]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/acm-certificate-validation)
- [cloudfront-distribution]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/cloudfront-distribution)
- [efs-access-point]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/efs-access-point)
- [efs-filesystem]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/efs-filesystem)
- [eks-addons]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/eks-addons)
- [eks-cluster]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/eks-cluster)
- [eks-nodegroup]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/eks-nodegroup)
- [iam-eks-oidc-provider]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/iam-eks-oidc-provider)
- [iam-policy]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/iam-policy)
- [iam-role]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/iam-role)
- [iam-service-linked-role]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/iam-service-linked-role)
- [lambda]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/lambda)
- [launch-template]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/launch-template)
- [rds-mysql-cluster]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/rds-mysql-cluster)
- [route53-records]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/route53-records)
- [s3-bucket]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/s3-bucket)
- [s3-bucket-lifecycle-config]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/s3-bucket-lifecycle-config)
- [s3-bucket-notification]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/s3-bucket-notification)
- [s3-bucket-policy]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/s3-bucket-policy)
- [s3-bucket-website-configuration]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/s3-bucket-website-configuration)
- [security-group]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/security-group)
- [ssh-key-pair]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/ssh-key-pair)
- [vpc]( https://github.com/hoverkraft-tech/terraform-modules/tree/main/aws/vpc)

### OVH Modules
- [bucket](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/bucket)
- [compute-instance](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/compute-instance)
- [dbaas](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/dbaas)
- [kube-managed](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/kube-managed)
- [kube-nodepool](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/kube-nodepool)
- [pci-private-network](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/pci-private-network)
- [pci-private-subnet](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/pci-private-subnet)
- [s3-credential](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/s3-credential)
- [s3-policy](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/s3-policy)
- [security-group](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/security-group)
- [ssh-key-pair](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/ssh-key-pair)
- [user](https://github.com/hoverkraft-tech/terraform-modules/tree/main/ovh/user)

### Scaleway Modules
- [bucket](https://github.com/hoverkraft-tech/terraform-modules/tree/main/scw/bucket)
- [iam-api-key](https://github.com/hoverkraft-tech/terraform-modules/tree/main/scw/iam-api-key)
- [iam-application](https://github.com/hoverkraft-tech/terraform-modules/tree/main/scw/iam-application)
- [iam-policy](https://github.com/hoverkraft-tech/terraform-modules/tree/main/scw/iam-policy)

### GitHub Modules
- [branch-protection](https://github.com/hoverkraft-tech/terraform-modules/tree/main/github/branch-protection)
- [repository](https://github.com/hoverkraft-tech/terraform-modules/tree/main/github/repository)
- [repository-ruleset](https://github.com/hoverkraft-tech/terraform-modules/tree/main/github/repository-ruleset)

### Kubernetes Modules
- [helm-release](https://github.com/hoverkraft-tech/terraform-modules/tree/main/k8s/helm-release)
- [k8s-namespace](https://github.com/hoverkraft-tech/terraform-modules/tree/main/k8s/k8s-namespace)
- [k8s-secret](https://github.com/hoverkraft-tech/terraform-modules/tree/main/k8s/k8s-secret)
- [kubeconfig](https://github.com/hoverkraft-tech/terraform-modules/tree/main/k8s/kubeconfig)
- [local-kubectl](https://github.com/hoverkraft-tech/terraform-modules/tree/main/k8s/local-kubectl)

### Password Store Modules
- [get](https://github.com/hoverkraft-tech/terraform-modules/tree/main/password-store/get)
- [put](https://github.com/hoverkraft-tech/terraform-modules/tree/main/password-store/put)

</details>

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new modules, or documentation improvements, your help is appreciated.

### Development Setup

We leverage the following tools to minimize work and time needed to review a PR:

- 🔧 [asdf](https://asdf-vm.com) – Ensures we're using the same tool versions
- 🪝 [pre-commit](https://pre-commit.com) – Automated checks before commits

#### Setup Instructions

```bash
# Clone the repository
git clone git@github.com:hoverkraft-tech/terraform-modules.git
cd terraform-modules

# Install required tools
asdf install

# Install pre-commit hooks
pre-commit install -t pre-push
```

### Submitting a New Module

1. **Create a branch** for your work
   ```bash
   git checkout -b feature/my-new-module
   ```

2. **Copy the template** as a boilerplate
   ```bash
   cp -r _template my-provider/my-module
   ```

3. **Customize** your module with:
   - Terraform resources
   - Input variables
   - Output values
   - README documentation

4. **Run pre-commit checks**
   ```bash
   pre-commit run --all-files
   ```

5. **Submit a pull request**
   - Include a clear description of your module
   - Reference any related issues
   - Add examples of usage

6. **Monitor CI checks** and address any feedback

### Code Quality Tools

Our modules are validated with:
- ✅ **terraform-docs** – Auto-generates documentation
- ✅ **tflint** – Lints Terraform code
- ✅ **checkov** – Security and compliance scanning
- ✅ **trivy** – Vulnerability scanning

### Contribution Guidelines

- Follow the existing module structure and naming conventions
- Include comprehensive documentation
- Add examples demonstrating module usage
- Ensure all pre-commit checks pass
- Write clear commit messages

## 📄 License

This project is licensed under the [MIT License](https://github.com/hoverkraft-tech/terraform-modules/blob/main/LICENSE) - see the LICENSE file for details.

## 🆘 Support

Need help? Here's how to get support:

- 📖 **Documentation**: Check the module-specific README files
- 🐛 **Bug Reports**: [Open an issue](https://github.com/hoverkraft-tech/terraform-modules/issues/new)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/hoverkraft-tech/terraform-modules/discussions)
- 💬 **Questions**: Check existing [issues](https://github.com/hoverkraft-tech/terraform-modules/issues) or [discussions](https://github.com/hoverkraft-tech/terraform-modules/discussions)

## 🌟 Show Your Support

If you find these modules helpful, please consider:
- ⭐ Starring this repository
- 🔀 Forking for your own use
- 📢 Sharing with others
- 🤝 Contributing improvements

## 🏢 About hoverkraft-tech

These modules are maintained by the team at [hoverkraft-tech](https://github.com/hoverkraft-tech). We're passionate about building reliable, scalable infrastructure and sharing our knowledge with the community.

---

<div align="center">

**Made with ❤️ by the hoverkraft-tech team**

[![GitHub](https://img.shields.io/badge/GitHub-hoverkraft--tech-181717?logo=github)](https://github.com/hoverkraft-tech)

</div>

.PHONY: help

MAKEFLAGS += --silent
.DEFAULT_GOAL := help

help: ## Show help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[$$()% a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

include .env

setup: ## Install npm dependencies for all package.json files under actions/
	@echo "Installing npm dependencies for all packages..."
	$(call run_npm_for_packages,install)

start: ## Start application in dev mode
	npm --prefix application run start

npm-audit-fix: ## Execute npm audit fix
	@echo "Running npm audit fix for all packages..."
	$(call run_npm_for_packages,audit fix)

lint: ## Run linters
	npm --prefix application run lint -- $(filter-out $@,$(MAKECMDGOALS))
	$(call run_linter,)

lint-fix: ## Run linters
	npm --prefix application run lint:fix
	$(MAKE) linter-fix

build: ## Build libs and applications
	npm --prefix application run build

test: ## Run tests
	@echo "Running tests for all packages..."
	$(call run_npm_for_packages,run test:ci)

ci: ## Run tests in CI mode
	$(MAKE) setup
	$(MAKE) npm-audit-fix || true
	$(MAKE) lint-fix
	$(MAKE) build
	$(MAKE) test

linter-fix: ## Execute linting and fix
	$(call run_linter, \
		-e FIX_MARKDOWN=true \
		-e FIX_MARKDOWN_PRETTIER=true \
		-e FIX_NATURAL_LANGUAGE=true \
		-e FIX_SPELL_CODESPELL=true \
		-e FIX_SHELL_SHFMT=true \
		-e FIX_BIOME_LINT=true \
		-e FIX_BIOME_FORMAT=true \
	)

define run_linter
	DEFAULT_WORKSPACE="$(CURDIR)"; \
	LINTER_IMAGE="linter:latest"; \
	VOLUME="$$DEFAULT_WORKSPACE:$$DEFAULT_WORKSPACE"; \
	docker build --platform linux/amd64 --build-arg UID=$(shell id -u) --build-arg GID=$(shell id -g) --tag $$LINTER_IMAGE .; \
	docker run \
		--platform linux/amd64 \
		-v $$VOLUME \
		--rm \
		-e DEFAULT_WORKSPACE="$$DEFAULT_WORKSPACE" \
		-e FILTER_REGEX_INCLUDE="$(filter-out $@,$(MAKECMDGOALS))" \
		$(1) \
		$$LINTER_IMAGE
endef

define run_npm_for_packages
	@set -eu; \
	overall_status=0; \
	packages="$$(find application .github/actions -type f -name package.json -not -path '*/node_modules/*' -print | sort)"; \
	for pkg in $$packages; do \
		pkg_dir="$$(dirname "$$pkg")"; \
		echo "---"; \
		echo "npm $(1) in $$pkg_dir"; \
		if ! npm --prefix "$$pkg_dir" $(1); then \
			overall_status=1; \
		fi; \
	done; \
	exit $$overall_status
endef

#############################
# Argument fix workaround
#############################
%:
	@:

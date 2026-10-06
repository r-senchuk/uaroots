.PHONY: check build release-preflight deploy

check:
	npm run check

build:
	npm run build

release-preflight: check
	./scripts/deploy.sh --dry-run

# Apply exactly the already-built and reviewed artifact; rebuilding would change its manifest.
deploy:
	@test "$${RELEASE_MODE:-}" = "apply" || { echo 'deploy: set RELEASE_MODE=apply, RELEASE_MANIFEST, and ROLLBACK_DIR to reviewed release/recovery artifacts' >&2; exit 2; }
	@test -n "$${ROLLBACK_DIR:-}" || { echo 'deploy: ROLLBACK_DIR is required' >&2; exit 2; }
	@test -n "$${RELEASE_MANIFEST:-}" || { echo 'deploy: RELEASE_MANIFEST is required' >&2; exit 2; }
	./scripts/deploy.sh --apply --manifest "$${RELEASE_MANIFEST}" --rollback-dir "$${ROLLBACK_DIR}"

.PHONY: check build deploy

check:
	npm run check

build:
	npm run build

deploy: check
	./scripts/deploy.sh

.PHONY: build deploy

build:
	npm run build

deploy: build
	aws s3 cp ./out/ s3://uaroute.com --recursive

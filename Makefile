.PHONY: deploy

deploy: 
	aws s3 cp ./build/ s3://uaroute.com --exclude ".git*/*" --exclude "Makefile" --recursive
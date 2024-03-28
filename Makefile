.PHONY: deploy

deploy: 
	aws s3 cp . s3://uaroute.com --exclude ".git*/*" --exclude "Makefile" --recursive
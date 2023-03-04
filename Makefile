.PHONY: build publish

FLAGS = --bundle --minify --target=es2018

build:
	./node_modules/.bin/esbuild js/components/sqlime-db.js $(FLAGS) --outfile=dist/sqlime-db.js
	./node_modules/.bin/esbuild js/components/sqlime-example.js $(FLAGS) --outfile=dist/sqlime-example.js

publish:
	make build
	npm publish

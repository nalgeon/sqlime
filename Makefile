.PHONY: build-js build-sqlite

FLAGS = --bundle --minify --target=es2018

build-js:
	./node_modules/.bin/esbuild js/components/sqlime-db.js $(FLAGS) --outfile=dist/sqlime-db.js
	./node_modules/.bin/esbuild js/components/sqlime-example.js $(FLAGS) --outfile=dist/sqlime-example.js

build-sqlite:
	cp js/sqlite/sqlite3.js dist/
	cp js/sqlite/sqlite3.wasm dist/

publish:
	make build-js
	make build-sqlite
	npm publish

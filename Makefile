SQLITE_YEAR := 2026
SQLITE_VERSION := 3540100
SQLITE_URL := https://sqlite.org/$(SQLITE_YEAR)/sqlite-wasm-$(SQLITE_VERSION).zip
SQLITE_DIR := js/sqlite

SITE := CNAME *.html *.db site.webmanifest css img js
PORT ?= 8000

.PHONY: sqlite build serve clean

# Download the official SQLite WASM build (sqlite3.js + sqlite3.wasm).
# Re-downloads whenever the Makefile changes (e.g. a version bump).
sqlite: $(SQLITE_DIR)/sqlite3.js

$(SQLITE_DIR)/sqlite3.js: Makefile
	curl -fsSL -o $(SQLITE_DIR)/sqlite-wasm.zip $(SQLITE_URL)
	unzip -joq $(SQLITE_DIR)/sqlite-wasm.zip '*/jswasm/sqlite3.js' '*/jswasm/sqlite3.wasm' -d $(SQLITE_DIR)
	rm $(SQLITE_DIR)/sqlite-wasm.zip
	touch $@

# Assemble the deployable site in build/.
build: sqlite
	rm -rf build
	mkdir build
	cp -R $(SITE) build/

serve: sqlite
	python3 -m http.server $(PORT)

clean:
	rm -rf build $(SQLITE_DIR)/sqlite3.js $(SQLITE_DIR)/sqlite3.wasm

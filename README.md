# SQLime

**[SQLime](http://sqlime.org/)** is an online SQLite playground for debugging and sharing SQL snippets. Kinda like JSFiddle, but for SQL instead of JavaScript.

[![SQLime](./img/sqlime.jpg)](http://sqlime.org/)

Here are some notable features:

### 🔋 Full-blown database in the browser

SQLime is backed by the latest version of SQLite via the [WASM](https://sqlite.org/wasm) subproject. It provides a full-featured SQL implementation, including indexes, triggers, views, transactions, CTEs, window functions and execution plans.

### 🔌 Connect any data source

Connect any local or remote SQLite database. Both files and URLs are supported. For example, try loading the [Employees database](http://sqlime.org/#https://raw.githubusercontent.com/nalgeon/sqliter/main/employees.en.db) from the GitHub repo.

### 🔗 Save and share with others

SQLime saves both the database and the queries to GitHub so that you can revisit them later or share them with a colleague. The database is stored as a plain text SQL dump, so it's easy to read the code or import data into PostgreSQL, MySQL, or other databases.

For example, here is the [gist](https://gist.github.com/nalgeon/e012594111ce51f91590c4737e41a046) for the Employees database, and here is the [sharing link](https://sqlime.org/#gist:e012594111ce51f91590c4737e41a046) for it.

### 📱 Mobile friendly

Most playgrounds are not meant for small screens. SQLime was specifically designed and tested on mobile devices. No need to zoom or aim at tiny buttons — everything looks and works just fine.

![SQLime on mobile](./img/mobile.jpg)

### 🔒 Secure and private

There is no server. SQLime works completely in the browser. The GitHub API token is also stored locally. Queries are saved as private GitHub gists within your account. Your data is yours only.

### ⌨️ Dead simple

SQLime has zero third-party dependencies other than SQLite. Good old HTML, CSS, and vanilla JS — that's all. No frameworks, no heavy editors, no obsolete and vulnerable libraries. Just some modular open-source code, which is easy to grasp and extend.

_Follow [@ohmypy](https://twitter.com/ohmypy) on Twitter to keep up with new features 🚀_

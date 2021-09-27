import dumper from "./dumper.js";
import gister from "./gister.js";
import hasher from "./hasher.js";
import { DatabasePath } from "./locator.js";

const WASM =
    "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm";
const CONFIG = {
    locateFile: (file) => WASM,
};

const QUERIES = {
    version: "select sqlite_version() as version",
    tables: "select name as \"table\" from sqlite_schema where type = 'table'",
};

// init loads database from specified path
async function init(name, path) {
    if (path.type == "local" || path.type == "remote") {
        return await loadUrl(name, path);
    }
    if (path.type == "binary") {
        return await loadArrayBuffer(name, path);
    }
    if (path.type == "id") {
        return await loadGist(path);
    }
    const cache = await openCache();
    const response = await cache?.match("database");
    if (response) {
        return await loadCache(response);
    } else {
        // empty
        return await create(name, path);
    }
}

// create creates an empty database
async function create(name, path) {
    console.debug(`Creating new ${name} database...`);
    const SQL = await initSqlJs(CONFIG);
    const db = new SQL.Database();
    return new SQLite(name, path, db);
}

// loadArrayBuffer loads database from binary database file content
async function loadArrayBuffer(name, path) {
    console.debug(`Loading ${name} database from array buffer...`);
    const SQL = await initSqlJs(CONFIG);
    const db = new SQL.Database(new Uint8Array(path.value));
    path.value = null;
    return new SQLite(name, path, db);
}

// loadUrl loads database from specified local or remote url
async function loadUrl(name, path) {
    console.debug(`Loading ${name} database from url...`);
    const sqlPromise = initSqlJs(CONFIG);
    const dataPromise = fetch(path.value)
        .then((response) => {
            if (!response.ok) {
                return null;
            }
            return response.arrayBuffer();
        })
        .catch((reason) => {
            return null;
        });
    const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
    if (!buf) {
        return null;
    }
    const db = new SQL.Database(new Uint8Array(buf));
    return new SQLite(name, path, db);
}

// loadGist loads database from GitHub gist with specified id
async function loadGist(path) {
    console.debug(`Loading database from gist ${path.value}...`);
    const gist = await gister.get(path.value);
    if (!gist) {
        return null;
    }
    const SQL = await initSqlJs(CONFIG);
    const db = new SQL.Database();
    const database = new SQLite(gist.description, path, db);
    database.id = path.value;
    database.owner = gist.owner.login;
    database.execute(gist.files["schema.sql"].content);
    database.query = gist.files["query.sql"].content;
    database.hashcode = database.calcHashcode();
    return database;
}

// openCache opens app cache
function openCache() {
    const isAvailable = "caches" in self;
    if (!isAvailable) {
        return new Promise((resolve, reject) => {
            resolve(null);
        });
    }
    return caches.open("app");
}

// loadCache loads database from local cache
async function loadCache(response) {
    console.debug(`Loading database from cache...`);
    const name = response.headers.get("x-name") || "new.db";
    const buffer = await response.arrayBuffer();
    const path = new DatabasePath(buffer, "binary");
    return await loadArrayBuffer(name, path);
}

// saveCache saves database to local cache
async function saveCache(database) {
    console.debug(`Saving database to cache...`);
    const buffer = database.db.export();
    const response = new Response(buffer, {
        headers: {
            "x-name": database.name,
        },
    });
    const cache = await openCache();
    await cache.put("database", response);
}

// save saves database to GitHub gist
async function save(database, query) {
    console.debug(`Saving database to gist...`);
    const schema = dumper.toSql(database, query);
    database.query = query;
    const hashcode = database.calcHashcode();
    let promise;
    if (!database.id || database.owner != gister.username) {
        promise = gister.create(database.name, schema, database.query);
    } else {
        // do not update gist if nothing has changed
        if (hashcode == database.hashcode) {
            return new Promise((resolve, reject) => {
                resolve(database);
            });
        }
        promise = gister.update(
            database.id,
            database.name,
            schema,
            database.query
        );
    }
    return promise.then((response) => {
        if (!response.id) {
            return null;
        }
        database.id = response.id;
        database.owner = response.owner.login;
        database.hashcode = hashcode;
        database.path.type = "id";
        database.path.value = database.id;
        return database;
    });
}

// SQLite database
class SQLite {
    constructor(name, path, db, query = "") {
        this.id = null;
        this.owner = null;
        this.hashcode = 0;
        this.name = name;
        this.path = path;
        this.db = db;
        this.query = query;
    }

    // execute runs one ore more sql queries
    // and returns the last result
    execute(sql) {
        this.query = sql;
        const result = this.db.exec(sql);
        if (!result.length) {
            return null;
        }
        return result[result.length - 1];
    }

    // each runs the query
    // and invokes callback on each of the resulting rows
    each(sql, callback) {
        this.db.each(sql, [], callback);
    }

    calcHashcode() {
        const dbArr = this.db.export();
        const dbHash = hasher.uint8Array(dbArr);
        const queryHash = hasher.string(this.query);
        return dbHash & queryHash;
    }
}

const sqlite = { init, save, saveCache, QUERIES };
export default sqlite;

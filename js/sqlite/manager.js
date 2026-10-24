// SQLite database manager.

import dumper from "./dumper.js";
import github from "../github.js";
import { SQLite } from "./db.js";

// global SQLite WASM API object.
let sqlite3;
// resolves to the SQLite WASM API object once it's initialized.
let loading;

// required by the SQLite WASM API.
const CONFIG = {
    print: console.log,
    printErr: console.error,
};

// init loads a database from the specified path
// using the SQLite WASM API.
async function init(name, path) {
    if (!loading) {
        loading = sqlite3InitModule(CONFIG).then((api) => {
            console.log(`Loaded SQLite ${api.capi.sqlite3_libversion()}`);
            return api;
        });
    }
    sqlite3 = await loading;
    if (path.type == "local" || path.type == "remote") {
        console.debug(`Loading database from url ${path.value}...`);
        if (path.value.endsWith(".sql")) {
            const sql = await fetchFile(path.value, "text");
            return fromSql(name, path, sql);
        }
        const buf = await fetchFile(path.value, "arrayBuffer");
        return fromBytes(name, path, buf);
    }
    if (path.type == "binary") {
        console.debug("Loading database from array buffer...");
        const buf = path.value;
        path.value = null;
        return fromBytes(name, path, buf);
    }
    if (path.type == "sql") {
        console.debug("Loading database from SQL script...");
        return fromSql(name, path, path.value);
    }
    if (path.type == "id") {
        return await loadGist(path);
    }
    // empty
    console.debug("Creating new database...");
    return create(name, path);
}

// create creates an empty database.
function create(name, path) {
    const db = new sqlite3.oo1.DB();
    return new SQLite(name, path, sqlite3.capi, db);
}

// fromBytes loads a database from the binary database file content.
function fromBytes(name, path, buf) {
    if (!buf) {
        return null;
    }
    const bytes = new Uint8Array(buf);
    // in-memory databases do not support WAL,
    // so switch the header to legacy rollback mode.
    if (bytes[18] === 2) bytes[18] = 1;
    if (bytes[19] === 2) bytes[19] = 1;
    const p = sqlite3.wasm.allocFromTypedArray(bytes);
    const database = create(name, path);
    sqlite3.capi.sqlite3_deserialize(
        database.db.pointer,
        "main",
        p,
        bytes.length,
        bytes.length,
        sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE | sqlite3.capi.SQLITE_DESERIALIZE_RESIZEABLE,
    );
    database.gatherTables();
    return database;
}

// fromSql creates a database by executing a plain text SQL script.
function fromSql(name, path, sql) {
    if (!sql) {
        return null;
    }
    const database = create(name, path);
    database.execute(sql);
    database.gatherTables();
    database.query = "";
    return database;
}

// fetchFile fetches a local or remote file using the specified
// response method ("text" or "arrayBuffer"). Returns null on failure.
async function fetchFile(url, method) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return null;
        }
        return await response[method]();
    } catch {
        return null;
    }
}

// loadGist loads a database from the gist with the specified id.
async function loadGist(path) {
    console.debug(`Loading database from gist ${path.value}...`);
    const gist = await github.get(path.value);
    if (!gist) {
        return null;
    }
    const database = create(gist.name, path);
    database.id = gist.id;
    database.owner = gist.owner;
    database.execute(gist.schema);
    database.query = gist.query;
    database.calcHashcode();
    database.ensureName();
    return database;
}

// save saves the database to a gist.
async function save(database, query) {
    console.debug(`Saving database to gist...`);
    const schema = dumper.toSql(database);
    database.query = query;
    if (!schema && !query) {
        return Promise.resolve(null);
    }
    const oldHashcode = database.hashcode;
    database.gatherTables();
    if (!database.tables.length && !query) {
        return Promise.resolve(null);
    }
    database.calcHashcode();
    database.ensureName();
    let promise;
    if (!database.id || database.owner != github.username) {
        promise = github.create(database.name, schema, database.query);
    } else {
        // do not update gist if nothing has changed
        if (database.hashcode == oldHashcode) {
            return Promise.resolve(database);
        }
        promise = github.update(database.id, database.name, schema, database.query);
    }
    return promise.then((gist) => afterSave(database, gist));
}

// afterSave updates database attributes after a successful save.
function afterSave(database, gist) {
    if (!gist.id) {
        return null;
    }
    database.id = gist.id;
    database.owner = gist.owner;
    database.path.type = "id";
    database.path.value = `${github.prefix}:${database.id}`;
    database.ensureName();
    return database;
}

export default { init, save };

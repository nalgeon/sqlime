import dumper from "./dumper.js";
import gister from "./gister.js";
import hasher from "./hasher.js";

const WASM =
    "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm";
const CONFIG = {
    locateFile: (file) => WASM,
};

const DEFAULT_NAME = "new.db";

const QUERIES = {
    version: "select sqlite_version() as version",
    tables: "select name as \"table\" from sqlite_schema where type = 'table'",
};

// init loads database from specified path
async function init(name, path) {
    name = name || DEFAULT_NAME;
    if (path.type == "local" || path.type == "remote") {
        return await loadUrl(name, path);
    }
    if (path.type == "binary") {
        return await loadArrayBuffer(name, path);
    }
    if (path.type == "id") {
        return await loadGist(path);
    }
    // empty
    return await create(name, path);
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
    const database = new SQLite(gist.name, path, db);
    database.id = path.value;
    database.owner = gist.owner;
    database.execute(gist.schema);
    database.query = gist.query;
    if (database.name == DEFAULT_NAME) {
        database.name = extractName(database.id);
    }
    database.updateHashcode();
    return database;
}

// save saves database to GitHub gist
async function save(database, query) {
    console.debug(`Saving database to gist...`);
    const schema = dumper.toSql(database, query);
    database.query = query;
    if (!schema && !query) {
        return Promise.resolve(null);
    }
    const oldHashcode = database.hashcode;
    database.updateHashcode();
    let promise;
    if (!database.id || database.owner != gister.username) {
        promise = gister.create(database.name, schema, database.query);
    } else {
        // do not update gist if nothing has changed
        if (database.hashcode == oldHashcode) {
            return Promise.resolve(database);
        }
        promise = gister.update(
            database.id,
            database.name,
            schema,
            database.query
        );
    }
    return promise.then((gist) => afterSave(database, gist));
}

// afterSave updates database attributes
// after successful save
function afterSave(database, gist) {
    if (!gist.id) {
        return null;
    }
    database.id = gist.id;
    database.owner = gist.owner;
    database.path.type = "id";
    database.path.value = database.id;
    if (database.name == DEFAULT_NAME) {
        database.name = extractName(database.id);
    }
    return database;
}

function extractName(id) {
    return id.substr(0, 6) + ".db";
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

    updateHashcode() {
        const dbArr = this.db.export();
        const dbHash = hasher.uint8Array(dbArr);
        const queryHash = hasher.string(this.query);
        const hash = dbHash & queryHash || dbHash || queryHash;
        this.hashcode = hash;
        return hash;
    }
}

const sqlite = { init, save, QUERIES };
export default sqlite;

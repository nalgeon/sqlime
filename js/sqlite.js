import dumper from "./dumper.js";
import gister from "./gister.js";
import hasher from "./hasher.js";

const WASM =
    "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm";
const CONFIG = {
    locateFile: (file) => WASM,
};

// init loads database from specified path
async function init(name, path) {
    if (path.type == "local" || path.type == "remote") {
        return await loadUrl(name, path);
    } else if (path.type == "binary") {
        return await loadArrayBuffer(name, path);
    } else if (path.type == "id") {
        return await loadGist(path);
    } else {
        // empty
        return await create(name, path);
    }
}

// create creates an empty database
async function create(name, path) {
    const SQL = await initSqlJs(CONFIG);
    const db = new SQL.Database();
    return new SQLite(name, path, db);
}

async function loadArrayBuffer(name, path) {
    const SQL = await initSqlJs(CONFIG);
    const db = new SQL.Database(new Uint8Array(path.value));
    path.type = "empty";
    path.value = null;
    return new SQLite(name, path, db);
}

// loadUrl loads database from specified local or remote url
async function loadUrl(name, path) {
    const sqlPromise = initSqlJs(CONFIG);
    const dataPromise = fetch(path.value).then((response) => {
        if (!response.ok) {
            return null;
        }
        return response.arrayBuffer();
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

// save saves database to GitHub gist
async function save(database, query) {
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
    constructor(name, path, db) {
        this.id = null;
        this.owner = null;
        this.hashcode = 0;
        this.name = name;
        this.path = path;
        this.db = db;
        this.query = "";
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

const sqlite = { init, save };
export default sqlite;

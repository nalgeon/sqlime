import dumper from "./dumper.js";
import gister from "./gister.js";
import hasher from "./hasher.js";

const WASM = "https://unpkg.com/@antonz/sql.js@3.37.2/dist/sql-wasm.wasm";
const CONFIG = {
    locateFile: (file) => WASM,
};

const DEFAULT_NAME = "new.db";

const QUERIES = {
    version: "select sqlite_version() as version",
    tables: `select name as "table" from sqlite_schema
      where type = 'table' and name not like 'sqlite_%'`,
    tableContent: "select * from {} limit 10",
    tableInfo: `select
      iif(pk=1, '✓', '') as pk, name, type, iif("notnull"=0, '✓', '') as "null?"
      from pragma_table_info('{}')`,
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
    const database = new SQLite(name, path, db);
    database.gatherTables();
    return database;
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
    const database = new SQLite(name, path, db);
    database.gatherTables();
    return database;
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
    database.calcHashcode();
    database.ensureName();
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
    database.calcHashcode();
    database.gatherTables();
    database.ensureName();
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
    database.ensureName();
    return database;
}

// SQLite database
class SQLite {
    constructor(name, path, db, query = "") {
        this.id = null;
        this.owner = null;
        this.name = name;
        this.path = path;
        this.db = db;
        this.query = query;
        this.hashcode = 0;
        this.tables = [];
    }

    // meaningfulName returns database name
    // if it differs from default one
    get meaningfulName() {
        if (this.name == DEFAULT_NAME) {
            return "";
        }
        return this.name;
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

    // ensureName changes default name to something more meaningful
    ensureName() {
        if (this.meaningfulName) {
            return this.meaningfulName;
        }
        if (this.tables.length) {
            this.name = this.tables[0] + ".db";
            return this.name;
        }
        if (this.id) {
            this.name = this.id.substr(0, 6) + ".db";
            return this.name;
        }
        return this.name;
    }

    // gatherTables fills .tables attribute with the array of database tables
    // and returns it
    gatherTables() {
        const result = this.db.exec(QUERIES.tables);
        if (!result.length) {
            this.tables = [];
            return this.tables;
        }
        this.tables = result[0].values.map((row) => row[0]);
        return this.tables;
    }

    getTableInfo(table) {
        const sql = QUERIES.tableInfo.replace("{}", table);
        return this.execute(sql);
    }

    // calcHashcode fills .hashcode attribute with the database hashcode
    // and returns it
    calcHashcode() {
        const dbArr = this.db.export();
        const dbHash = hasher.uint8Array(dbArr);
        const queryHash = hasher.string(this.query);
        const hash = dbHash & queryHash || dbHash || queryHash;
        this.hashcode = hash;
        return hash;
    }
}

const sqlite = { init, save, QUERIES, DEFAULT_NAME };
export default sqlite;

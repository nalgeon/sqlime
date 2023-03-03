// SQLite database wrapper and metadata.

import hasher from "./hasher.js";

// default database name
const DEFAULT_NAME = "new.db";

// system queries
const QUERIES = {
    version: "select sqlite_version() as version",
    tables: `select name as "table" from sqlite_schema
      where type = 'table' and name not like 'sqlite_%'`,
    tableContent: "select * from {} limit 10",
    tableInfo: `select
      iif(pk=1, '✓', '') as pk, name, type, iif("notnull"=0, '✓', '') as "null?"
      from pragma_table_info('{}')`,
};

// database messages
const MESSAGES = {
    empty: "The query returned nothing",
    executing: "Executing query...",
    invite: "Run SQL query to see the results",
    loading: "Loading database...",
};

// SQLite database wrapper.
// Wraps SQLite WASM API and calls it in the following methods:
//   - execute()
//   - each()
//   - gatherTables()
//   - calcHashcode()
// The rest of the methods are WASM-agnostic.
class SQLite {
    constructor(name, path, capi, db, query = "") {
        this.id = null;
        this.owner = null;
        this.name = name || DEFAULT_NAME;
        this.path = path;
        this.capi = capi;
        this.db = db;
        this.query = query;
        this.hashcode = 0;
        this.tables = [];
    }

    // execute runs one ore more sql queries
    // and returns the last result.
    execute(sql) {
        if (!sql) {
            // sqlite api fails when trying to execute an empty query
            return null;
        }
        this.query = sql;
        let rows = [];
        this.db.exec({
            sql: sql,
            rowMode: "object",
            resultRows: rows,
        });
        if (!rows.length) {
            return null;
        }
        const result = {
            columns: Object.getOwnPropertyNames(rows[0]),
            values: [],
        };
        for (let row of rows) {
            result.values.push(Object.values(row));
        }
        return result;
    }

    // each runs the query and invokes the callback
    // on each of the resulting rows.
    each(sql, callback) {
        this.db.exec({
            sql: sql,
            rowMode: "object",
            callback: callback,
        });
    }

    // gatherTables fills the `.tables` attribute
    // with an array of database tables and returns it.
    gatherTables() {
        let rows = [];
        this.db.exec({
            sql: QUERIES.tables,
            rowMode: "array",
            resultRows: rows,
        });
        if (!rows.length) {
            this.tables = [];
            return this.tables;
        }
        this.tables = rows.map((row) => row[0]);
        return this.tables;
    }

    // getTableInfo returns the table schema.
    getTableInfo(table) {
        const sql = QUERIES.tableInfo.replace("{}", table);
        return this.execute(sql);
    }

    // calcHashcode fills the `.hashcode` attribute
    // with the database hashcode and returns it.
    calcHashcode() {
        if (!this.tables.length) {
            // sqlite api fails when trying to export an empty database
            this.hashcode = 0;
            return 0;
        }
        const dbArr = this.capi.sqlite3_js_db_export(this.db.pointer);
        const dbHash = hasher.uint8Array(dbArr);
        const queryHash = hasher.string(this.query);
        const hash = dbHash & queryHash || dbHash || queryHash;
        this.hashcode = hash;
        return hash;
    }

    // meaningfulName returns the database name
    // if it differs from default one.
    get meaningfulName() {
        if (this.name == DEFAULT_NAME) {
            return "";
        }
        return this.name;
    }

    // ensureName changes the default name to something more meaningful.
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
}

export { DEFAULT_NAME, MESSAGES, QUERIES, SQLite };

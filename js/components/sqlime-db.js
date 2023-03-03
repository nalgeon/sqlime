// SQLite database component.
// Loads a database and makes it available for querying.

import manager from "../sqlite/manager.js";
import { DatabasePath } from "../db-path.js";

// Do not support loading databases from the cloud.
const gister = null;

class SqlimeDb extends HTMLElement {
    constructor() {
        super();
        this.database = null;
    }

    connectedCallback() {
        if (!this.loaded) {
            this.load();
            this.loaded = true;
        }
    }

    // load loads the database from the specified path
    // and stores it in the global Sqlime window object
    // under the specified name.
    load() {
        const path = new DatabasePath(this.getAttribute("path"));
        const name = this.getAttribute("name") || path.extractName();
        this.start(name, path).then((success) => {
            if (!success) {
                return;
            }
            store(this.database);
        });
    }

    // start loads an SQLite database from the specified path.
    async start(name, path) {
        try {
            this.database = await manager.init(gister, name, path);
            if (!this.database) {
                console.error(`Failed to load database from ${path}`);
                return false;
            }
            return true;
        } catch (exc) {
            console.error(`Failed to load database from ${path}: ${exc}`);
            return false;
        }
    }
}

function store(database) {
    window.Sqlime = window.Sqlime || {};
    window.Sqlime.db = window.Sqlime.db || {};
    window.Sqlime.db[database.name] = database;
}

if (!window.customElements.get("sqlime-db")) {
    window.SqlimeDb = SqlimeDb;
    customElements.define("sqlime-db", SqlimeDb);
}

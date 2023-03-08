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
    async load() {
        const path = new DatabasePath(this.getAttribute("path"));
        const name = this.getAttribute("name") || path.extractName();
        this.loading(name);

        try {
            const database = await manager.init(gister, name, path);
            if (!database) {
                const err = `Failed to load database from ${path}`;
                this.error(name, err);
                console.error(err);
                return;
            }
            this.success(database);
        } catch (exc) {
            this.error(name, exc);
            throw exc;
        }
    }

    // loading stores the database as loading.
    loading(name) {
        this.database = new LoadingDatabase(name);
        store(this.database);
        notify(this.database);
    }

    // loading stores the loaded database.
    success(database) {
        this.database = database;
        store(this.database);
        notify(this.database);
    }

    // loading stores the database as invalid.
    error(name, message) {
        this.database = new InvalidDatabase(name, message);
        store(this.database);
        notify(this.database);
    }
}

// LoadingDatabase represents a database that is still loading.
class LoadingDatabase {
    constructor(name) {
        this.name = name;
    }

    execute(sql) {
        throw new Error("SQLite is still loading, try again in a second");
    }
}

// InvalidDatabase represents a database that is failed to load.
class InvalidDatabase {
    constructor(name, message) {
        this.name = name;
        this.message = message;
    }

    execute(sql) {
        throw new Error(this.message);
    }
}

// store saves the database in the global Sqlime window object.
function store(database) {
    window.Sqlime = window.Sqlime || {};
    window.Sqlime.db = window.Sqlime.db || {};
    window.Sqlime.db[database.name] = database;
}

// notify emits an event with a database in its current state.
function notify(database) {
    const event = new CustomEvent("sqlime-ready", {
        detail: {
            name: database.name,
            database: database,
        },
    });
    document.dispatchEvent(event);
}

if (!window.customElements.get("sqlime-db")) {
    window.SqlimeDb = SqlimeDb;
    customElements.define("sqlime-db", SqlimeDb);
}

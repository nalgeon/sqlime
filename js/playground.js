// SQL Playground page

import gister from "./cloud.js";
import { locator, DatabasePath } from "./locator.js";
import shortcuts from "./shortcuts.js";
import sqlite from "./sqlite-manager.js";
import storage from "./storage.js";
import timeit from "./timeit.js";

import { DEFAULT_NAME, QUERIES } from "./sqlite-db.js";

const messages = {
    empty: "The query returned nothing",
    executing: "Executing query...",
    invite: "Run SQL query to see the results",
    loading: "Loading database...",
};

const ui = {
    buttons: {
        openFile: document.querySelector("#open-file"),
        openUrl: document.querySelector("#open-url"),
        reset: document.querySelector("#reset"),
        execute: document.querySelector("#execute"),
        save: document.querySelector("#save"),
        showTables: document.querySelector("#show-tables"),
    },
    name: document.querySelector("#db-name"),
    commandbar: document.querySelector("#commandbar"),
    editor: document.querySelector("#editor"),
    status: document.querySelector("#status"),
    result: document.querySelector("#result"),
};

const actions = {
    "open-url": openUrl,
    "load-demo": loadDemo,
    execute: executeCurrent,
    save: save,
    "show-tables": showTables,
    "show-table": showTable,
    visit: visit,
};

const DEMO_URL = "#demo.db";

let database;

// for testing purposes
window.app = {
    actions: actions,
    gister: gister,
    ui: ui,
};

// startFromCurrentUrl loads existing database or creates a new one
// using current window location as database path
async function startFromCurrentUrl() {
    const path = locator.path();
    const name = locator.name(path);
    const success = await start(name, path);
    if (!success) {
        return;
    }
    showStarted();
}

// startFromUrl loads existing database
// from specified url
async function startFromUrl(url) {
    const path = new DatabasePath(url);
    const name = locator.name(path);
    const success = await start(name, path);
    if (!success) {
        return;
    }
    history.pushState(database.name, null, `#${database.path.value}`);
    showStarted();
}

// startFromFile loads existing database
// from binary file
async function startFromFile(file, contents) {
    const path = new DatabasePath(contents);
    const name = file.name;
    const success = await start(name, path);
    if (!success) {
        return;
    }
    history.pushState(database.name, null, "./");
    showStarted();
}

// start loads existing database or creates a new one
// using specified database path
async function start(name, path) {
    ui.result.clear();
    ui.status.info(messages.loading);

    const loadedDatabase = await sqlite.init(name, path);
    console.debug(loadedDatabase);
    if (!loadedDatabase) {
        ui.status.error(`Failed to load database from ${path}`);
        return false;
    }

    database = loadedDatabase;
    database.query = database.query || storage.get(database.name);

    document.title = database.meaningfulName || document.title;
    ui.name.ready(database.name);
    ui.status.info(messages.invite);
    ui.editor.value = database.query;
    ui.editor.focus();

    return true;
}

// executeCurrent runs the current SQL query
function executeCurrent() {
    execute(ui.editor.value);
}

// execute runs SQL query on the database
// and shows results
function execute(sql) {
    sql = sql.trim();
    storage.set(database.name, sql);
    if (!sql) {
        ui.status.info(messages.invite);
        ui.result.clear();
        return;
    }
    try {
        ui.status.info(messages.executing);
        timeit.start();
        const result = database.execute(sql);
        const elapsed = timeit.finish();
        showResult(result, elapsed);
    } catch (exc) {
        showError(exc);
    }
}

// openUrl loads database from local or remote url
function openUrl() {
    const url = prompt("Enter database file URL:", "https://path/to/database");
    if (!url) {
        return;
    }
    startFromUrl(url);
}

// save persists database state and current query
// to remote storage
async function save() {
    const query = ui.editor.value.trim();
    storage.set(database.name, query);
    gister.reload();
    if (!gister.hasCredentials()) {
        visit("settings");
        return;
    }
    ui.status.info("Saving...");
    ui.result.clear();
    const savedDatabase = await sqlite.save(database, query);
    if (!savedDatabase) {
        ui.status.error("Failed to save database");
        return;
    }
    database = savedDatabase;
    changeName(database.name);
    showSaved(database);
}

// changeName changes database name
function changeName(name) {
    if (name == ui.name.value && name == database.name) {
        return;
    }
    storage.remove(database.name);
    database.name = name;
    storage.set(name, database.query);
    ui.name.value = name;
    document.title = name;
}

// showStarted shows the result of successful database load
function showStarted() {
    if (database.query) {
        execute(database.query);
        enableCommandBar();
    } else if (database.tables.length) {
        showTableContent(database.tables[0]);
        enableCommandBar();
    } else {
        showWelcome();
    }
}

// showTables shows all database tables
function showTables() {
    const tables = database.gatherTables();
    if (!tables.length) {
        ui.status.info("Database is empty");
        return;
    }
    ui.status.info(`${tables.length} tables:`);
    ui.result.printTables(tables);
}

// showTable shows specific database table
function showTable(table) {
    const result = database.getTableInfo(table);
    const all = action("show-tables", "tables");
    ui.status.info(`${all} / ${table}:`);
    ui.result.print(result);
}

// showTableContent select data from specified table
function showTableContent(table) {
    const query = QUERIES.tableContent.replace("{}", table);
    ui.editor.value = query;
    execute(query);
}

// loadDemo loads demo database
function loadDemo() {
    window.location.assign(DEMO_URL);
}

// showWelcome show the welcome message
function showWelcome() {
    const demo = action("load-demo", "demo database");
    let message = `<p>${messages.invite}<br>or load the ${demo}.</p>`;
    message += `<p>Click the logo anytime to start from scratch.</p>`;
    if (!gister.hasCredentials()) {
        const settings = action("visit", "settings", "settings");
        message += `<p>Visit ${settings} to enable sharing.</p>`;
    }
    const about = action("visit", "About SQLime", "about");
    message += `<p>${about}</p>`;
    ui.status.info(message);
}

// showResult shows results and timing
// of the SQL query execution
function showResult(result, elapsed) {
    if (result && result.values.length) {
        ui.status.success(`${result.values.length} rows, took ${elapsed} ms`);
        ui.result.print(result);
    } else {
        ui.status.success(`Took ${elapsed} ms`);
    }
}

// showError shows an error occured
// during SQL query execution
function showError(exc) {
    const err = exc.toString().split("\n")[0];
    ui.result.clear();
    ui.status.error(err);
}

// showSaved shows saved database information
function showSaved(database) {
    history.pushState(database.id, null, database.path.toHash());
    const shareUrl = `<copy-on-click href="${window.location}" class="button">
        copy share link</copy-on-click>`;

    const url = gister.getUrl(database.id);
    if (url) {
        const gistUrl = `<a href="${url}" target="_blank">gist</a>`;
        let message = `<p>✓ Saved as ${gistUrl}</p>`;
        message += `<p>${shareUrl}</p>`;
        ui.status.info(message);
    } else {
        const settings = action("visit", "settings", "settings");
        let message = `<p>✓ Saved to the public cloud. Visit ${settings} for private sharing.</p>`;
        message += `<p> ${shareUrl}</p>`;
        ui.status.info(message);
    }
}

// enableCommandBar enables all buttons
// in the command bar
function enableCommandBar() {
    ui.commandbar.classList.remove("disabled");
}

function visit(page) {
    window.location.assign(`${page}.html`);
}

function action(name, text, arg = null) {
    const btn = document.createElement("button");
    btn.className = "button-link";
    btn.dataset.action = name;
    btn.innerHTML = text;
    if (arg) {
        btn.dataset.arg = arg;
    }
    return btn.outerHTML;
}

// User changed database name
ui.name.addEventListener("change", (event) => {
    changeName(event.target.value);
});

// Toolbar 'open file' button click
ui.buttons.openFile.addEventListener("change", (event) => {
    if (!event.target.files.length) {
        return;
    }
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function () {
        event.target.value = "";
        startFromFile(file, reader.result);
    };
    reader.readAsArrayBuffer(file);
});

// Toolbar 'open url' button click
ui.buttons.openUrl.addEventListener("click", () => {
    openUrl();
});

// Toolbar 'reset' button click
ui.buttons.reset.addEventListener("click", () => {
    storage.remove(DEFAULT_NAME);
});

// Navigate back to previous database
window.addEventListener("popstate", () => {
    startFromCurrentUrl();
});

// SQL editor 'execute' event
ui.editor.addEventListener("execute", (event) => {
    execute(event.detail);
});

// SQL editor 'started typing' event
ui.editor.addEventListener("start", (event) => {
    enableCommandBar();
});

// User clicked an action button
[ui.commandbar, ui.status, ui.result].forEach((el) => {
    el.addEventListener("click", onActionClick);
});

// onActionClick executes an action
// according to the button clicked
function onActionClick(event) {
    if (event.target.tagName != "BUTTON") {
        return;
    }
    const action = actions[event.target.dataset.action];
    if (!action) {
        return;
    }
    const arg = event.target.dataset.arg;
    if (arg) {
        action(arg);
    } else {
        action();
    }
}

shortcuts.listen("o", () => {
    ui.buttons.openFile.click();
});
shortcuts.listen("u", openUrl);
shortcuts.listen("s", save);
shortcuts.listen("/", showTables);

gister.loadCredentials();
startFromCurrentUrl();

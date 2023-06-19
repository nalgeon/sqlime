import { assert, log, mock, unmock, summary, wait } from "./tester.js";

const LONG_DELAY = 1000;
const MEDIUM_DELAY = 500;
const SMALL_DELAY = 100;

const EMPTY_SCHEMA = `BEGIN TRANSACTION;
PRAGMA writable_schema=ON;
CREATE TABLE IF NOT EXISTS sqlean_define(name text primary key, type text, body text);
PRAGMA writable_schema=OFF;
COMMIT;`;

async function testNewDatabase() {
    log("New database...");
    const app = await loadApp();
    const h1 = app.document.querySelector(".header h1");
    assert(
        "shows header",
        h1.innerText.trim() == "SQLite Playground  // new.db"
    );
    assert("editor is empty", app.ui.editor.value == "");
    assert(
        "command bar is disabled",
        app.ui.commandbar.classList.contains("sqlime-disabled")
    );
    assert("shows welcome text", app.ui.status.value.includes("demo database"));
    assert("result is empty", app.ui.result.innerText == "");
}

async function testExecuteQuery() {
    log("Execute query...");
    const app = await loadApp();
    const sql = "select 'hello' as message";
    // activate buttons
    app.ui.editor.dispatchEvent(new Event("input"));
    app.ui.editor.value = sql;
    app.ui.buttons.execute.click();
    await wait(MEDIUM_DELAY);
    assert("shows result", app.ui.result.innerText.includes("hello"));
    assert("shows query in editor", app.ui.editor.value == sql);
    assert(
        "caches query in local storage",
        localStorage.getItem("sqlime.query.new.db") == sql
    );
}

async function testExecuteSelection() {
    log("Execute selection...");
    const app = await loadApp();
    const sql = "select 54321, 17423";
    // activate buttons
    app.ui.editor.dispatchEvent(new Event("input"));
    app.ui.editor.value = sql;
    selectText(app, app.ui.editor, 0, 12);
    app.ui.buttons.execute.click();
    await wait(MEDIUM_DELAY);
    assert("executes selected part", app.ui.result.innerText.includes("54321"));
    assert("ignores other parts", !app.ui.result.innerText.includes("17423"));
    assert(
        "caches query in local storage",
        localStorage.getItem("sqlime.query.new.db") == sql.substring(0, 12)
    );
}

async function testLoadDemo() {
    log("Load demo...");
    const app = await loadApp();
    const sql = "select * from employees";
    const btn = app.ui.status.querySelector('[data-action="loadDemo"]');
    btn.click();
    await wait(MEDIUM_DELAY);
    assert("shows query in editor", app.ui.editor.value.startsWith(sql));
    assert("shows row count", app.ui.status.value.includes("10 rows"));
    assert("shows employees", app.ui.result.innerText.includes("Diane"));
}

async function testLoadUrl() {
    log("Load url...");
    const app = await loadApp();
    app.window.location.assign("../index.html#demo.db");
    await wait(MEDIUM_DELAY);
    assert("shows database name", app.ui.name.value == "demo.db");
    app.ui.buttons.showTables.click();
    await wait(MEDIUM_DELAY);
    assert("shows tables", app.ui.status.value == "2 tables:");
}

async function testLoadUrlInvalid() {
    log("Load invalid url...");
    const app = await loadApp();
    app.window.location.assign("../index.html#whatever");
    await wait(MEDIUM_DELAY);
    assert("shows error", app.ui.status.value.includes("Failed to load"));
    assert("editor is empty", app.ui.editor.value == "");
    assert("result is empty", app.ui.result.innerText == "");
}

async function testLoadGist() {
    log("Load gist...");
    const app = await loadApp();
    app.window.location.assign(
        "../index.html#gist:e012594111ce51f91590c4737e41a046"
    );
    await wait(LONG_DELAY);
    assert("shows database name", app.ui.name.value == "employees.en.db");
    assert("shows query in editor", app.ui.editor.value.startsWith("select"));
    assert("shows result", app.ui.result.innerText.includes("Diane"));
}

async function testLoadGistInvalid() {
    log("Load invalid gist...");
    const app = await loadApp();
    app.window.location.assign("../index.html#gist:42");
    await wait(LONG_DELAY);
    assert("shows error", app.ui.status.value.includes("Failed to load"));
    assert("editor is empty", app.ui.editor.value == "");
    assert("result is empty", app.ui.result.innerText == "");
}

async function testShowTables() {
    log("Show tables...");
    const app = await loadApp();
    app.window.location.assign("../index.html#demo.db");
    await wait(MEDIUM_DELAY);
    app.ui.buttons.showTables.click();
    await wait(MEDIUM_DELAY);
    assert("shows table count", app.ui.status.value == "2 tables:");
    assert("shows table list", app.ui.result.innerText.includes("employees"));
    const btn = app.ui.result.querySelector('[data-action="showTable"]');
    btn.click();
    await wait(MEDIUM_DELAY);
    assert("shows table navbar", app.ui.status.value == "tables / employees:");
    assert(
        "shows table columns",
        app.ui.result.innerText.includes("department")
    );
}

async function testSaveEmpty() {
    log("Save empty snippet...");
    const app = await loadApp();

    // activate buttons
    app.ui.editor.dispatchEvent(new Event("input"));
    app.ui.editor.value = "";
    app.ui.buttons.save.click();
    await wait(MEDIUM_DELAY);
    assert(
        "fails to save empty snippet",
        app.ui.status.value.startsWith("Failed to save")
    );
}

async function testSave() {
    log("Save snippet...");
    const app = await loadApp();

    mock(app.gister, "create", (name, schema, query) => {
        assert("before save: database name is not set", name == "new.db");
        assert("before save: database schema is empty", schema == EMPTY_SCHEMA);
        assert("before save: database query equals query text", query == sql);
        const gist = buildGist(name, schema, query);
        return Promise.resolve(gist);
    });

    const sql = "select 'hello' as message";
    // activate buttons
    app.ui.editor.dispatchEvent(new Event("input"));
    app.ui.editor.value = sql;
    app.ui.buttons.save.click();
    await wait(MEDIUM_DELAY);
    assert(
        "after save: database named after gist id",
        app.ui.name.value == "424242.db"
    );
    assert(
        "after save: shows successful status",
        app.ui.status.value.includes("✓ Saved")
    );

    unmock(app.gister, "create");
}

async function testUpdate() {
    log("Update snippet...");
    const app = await loadApp();

    const sql1 = "select 'created' as message";
    const sql2 = "select 'updated' as message";

    mock(app.gister, "create", (name, schema, query) => {
        const gist = buildGist(name, schema, query);
        return Promise.resolve(gist);
    });

    mock(app.gister, "update", (id, name, schema, query) => {
        assert("before save: database name is set", name == "424242.db");
        assert("before save: database schema is empty", schema == "");
        assert(
            "before save: database query equals updated text",
            query == sql2
        );
        const gist = buildGist(id, name, schema, query);
        return Promise.resolve(gist);
    });

    // activate buttons
    app.ui.editor.dispatchEvent(new Event("input"));

    // create
    app.ui.editor.value = sql1;
    app.ui.buttons.save.click();
    await wait(MEDIUM_DELAY);

    // update
    app.ui.editor.value = sql2;
    app.ui.buttons.save.click();
    await wait(MEDIUM_DELAY);

    assert(
        "after save: shows successful status",
        app.ui.status.value.includes("✓ Saved")
    );

    unmock(app.gister, "create");
}

async function testChangeName() {
    log("Change database name...");
    const app = await loadApp();
    const name = "my.db";
    app.ui.name.value = name;
    app.ui.name.dispatchEvent(new Event("change"));
    await wait(SMALL_DELAY);
    assert("shows updated name", app.ui.name.value == "my.db");
}

async function runTests() {
    log("Running tests...");
    await testNewDatabase();
    await testExecuteQuery();
    await testExecuteSelection();
    await testLoadDemo();
    await testLoadUrl();
    await testLoadUrlInvalid();
    await testLoadGist();
    await testLoadGistInvalid();
    await testShowTables();
    await testSaveEmpty();
    await testSave();
    await testUpdate();
    await testChangeName();
    summary();
}

async function loadApp(timeout = LONG_DELAY) {
    localStorage.removeItem("sqlime.query.new.db");
    localStorage.removeItem("sqlime.query.demo.db");
    const app = {};
    app.frame = document.querySelector("#app");
    app.frame.src = "../index.html";
    await wait(timeout);
    app.window = app.frame.contentWindow;
    app.document = app.window.document;
    app.actions = app.window.app.actions;
    app.gister = app.window.app.gister;
    app.ui = app.window.app.ui;
    return app;
}

function selectText(app, el, start, end) {
    const range = app.document.createRange();
    range.setStart(el.firstChild, start);
    range.setEnd(el.firstChild, end);
    const selection = app.window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function buildGist(name, schema = "", query = "") {
    return {
        id: "424242131313",
        name: name,
        owner: "test",
        schema: schema,
        query: query,
    };
}

runTests();

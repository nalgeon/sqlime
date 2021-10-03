import { assert, log, summary, wait } from "./tester.js";

const LONG_DELAY = 1000;
const MEDIUM_DELAY = 500;

async function loadApp(timeout = LONG_DELAY) {
    localStorage.removeItem("new.db.sql");
    const app = {};
    app.frame = document.querySelector("#app");
    app.frame.src = "../index.html?test=true";
    await wait(timeout);
    app.window = app.frame.contentWindow;
    app.document = app.window.document;
    app.ui = app.window.ui;
    return app;
}

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
        app.ui.commandbar.classList.contains("disabled")
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
        localStorage.getItem("new.db.sql") == sql
    );
}

async function loadDemo() {
    log("Load demo...");
    const app = await loadApp();
    const sql = "select * from employees";
    const btn = app.ui.status.querySelector('[data-action="load-demo"]');
    btn.click();
    await wait(MEDIUM_DELAY);
    assert("shows query in editor", app.ui.editor.value.startsWith(sql));
    assert("shows row count", app.ui.status.value.includes("10 rows"));
    assert("shows employees", app.ui.result.innerText.includes("Diane"));
}

async function loadUrl() {}

async function loadUrlInvalid() {}

async function loadGist() {}

async function loadGistInvalid() {}

async function showTables() {}

async function saveAnonymous() {}

async function saveEmpty() {}

async function save() {}

async function changeName() {}

async function runTests() {
    log("Running tests...");
    await testNewDatabase();
    await testExecuteQuery();
    await loadDemo();
    summary();
}

runTests();

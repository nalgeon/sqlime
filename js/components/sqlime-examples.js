// Executable SQL example component.
// Attaches to certain elements on the page (containing SQL code)
// and makes them executable.

import printer from "../printer.js";

class SqlimeExamples extends HTMLElement {
    constructor() {
        super();
        this.database = null;
        this.examples = [];
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    // render finds all the elements with the specified selector
    // and converts them to executable examples.
    render() {
        const selector = this.getAttribute("selector") || "pre";
        const isEditable = this.hasAttribute("editable");
        document.querySelectorAll(selector).forEach((element) => {
            const example = this.init(element);
            if (isEditable) {
                this.makeEditable(element, example);
            }
        });
    }

    // init converts the specified element into an executable example.
    init(el) {
        const resultsEl = document.createElement("div");
        resultsEl.style.display = "none";

        const runEl = document.createElement("button");
        runEl.innerHTML = "Run";
        runEl.addEventListener("click", (e) => {
            this.execute(el.innerText, resultsEl);
        });

        const commandsEl = document.createElement("div");
        commandsEl.appendChild(runEl);

        const exampleEl = document.createElement("div");
        exampleEl.className = "sqlime-example";
        exampleEl.appendChild(commandsEl);
        exampleEl.appendChild(resultsEl);

        el.insertAdjacentElement("afterend", exampleEl);

        const example = { commandsEl, resultsEl };
        this.examples.push(example);
        return example;
    }

    // makeEditable allows editing the specified element
    // and executing the updated example.
    makeEditable(el, example) {
        // make the element editable
        el.contentEditable = "true";
        el.addEventListener("keydown", (event) => {
            if (!event.ctrlKey && !event.metaKey) {
                return true;
            }
            if (event.keyCode == 10 || event.keyCode == 13) {
                this.execute(el.innerText, example.resultsEl);
                return false;
            }
            return true;
        });

        // add an 'edit' link
        const editEl = document.createElement("a");
        editEl.innerHTML = "Edit";
        editEl.style.cursor = "pointer";
        editEl.style.display = "inline-block";
        editEl.style.marginLeft = "1em";
        example.commandsEl.appendChild(editEl);

        editEl.addEventListener("click", (e) => {
            el.focus();
            return false;
        });
    }

    // execute runs SQL query on the database,
    // showing results inside the target element.
    execute(sql, targetEl) {
        sql = sql.trim();
        if (!sql) {
            this.showMessage(targetEl, "");
            return;
        }
        try {
            const database = this.getDatabase();
            const result = database.execute(sql);
            this.showResult(targetEl, result);
        } catch (exc) {
            this.showMessage(targetEl, exc);
        }
    }

    // getDatabase returns an SQLite database,
    // previously loaded using the 'sqlime-db' component
    getDatabase() {
        if (this.database == null || !this.database.db) {
            // the database is not initialized at all or is still loading
            this.database = this.loadDatabase();
        }
        return this.database;
    }

    // loadDatabase loads the database from the global Sqlime window object.
    loadDatabase() {
        if (!("Sqlime" in window) || !("db" in window.Sqlime)) {
            throw new Error(
                "Sqlime is not initialized. Use the 'sqlime-db' component to initialize it."
            );
        }
        const dbName = this.getAttribute("db");
        if (!dbName) {
            throw new Error("Missing the 'db' attribute.");
        }
        if (!(dbName in window.Sqlime.db)) {
            throw new Error(
                `Database '${dbName}' is not loaded. Use the 'sqlime-db' component to load it.`
            );
        }
        return window.Sqlime.db[dbName];
    }

    // showResult renders the results of the SQL query inside the target element.
    showResult(targetEl, result) {
        targetEl.style.display = "";
        targetEl.innerHTML = printer.printResult(result);
    }

    // showMessage shows the message inside the target element.
    showMessage(targetEl, msg) {
        targetEl.style.display = "";
        targetEl.innerHTML = msg;
    }
}

if (!window.customElements.get("sqlime-examples")) {
    window.SqlimeExamples = SqlimeExamples;
    customElements.define("sqlime-examples", SqlimeExamples);
}

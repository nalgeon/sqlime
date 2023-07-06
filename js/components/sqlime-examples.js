// Executable SQL example component.
// Attaches to certain elements on the page (containing SQL code)
// and makes them executable.

import printer from "../printer.js";

// SqlimeOutput prints the output of an interactive SQL example.
class SqlimeOutput extends HTMLElement {
    // fadeOut slightly fades out the output.
    fadeOut() {
        this.style.opacity = 0.4;
    }

    // fadeIn fades the output back in.
    fadeIn() {
        setTimeout(() => {
            this.style.opacity = "";
        }, 100);
    }

    // showResult renders the results of the SQL query.
    showResult(result) {
        this.style.display = "block";
        this.innerHTML = printer.printResult(result);
    }

    // showMessage shows the message.
    showMessage(msg) {
        this.style.display = "block";
        this.innerHTML = msg;
    }
}

// SqlimeExamples initializes interactive SQL examples.
class SqlimeExamples extends HTMLElement {
    constructor() {
        super();
        this.database = null;
        this.examples = [];
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.listen();
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

    // listen updates the database when notified by sqlime-db.
    listen() {
        document.addEventListener("sqlime-ready", (e) => {
            const name = this.getAttribute("db");
            if (e.detail.name == name) {
                this.database = e.detail.database;
            }
        });
    }

    // init converts the specified element into an executable example.
    init(el) {
        const outputEl = document.createElement("sqlime-output");
        outputEl.style.display = "none";

        const runEl = document.createElement("button");
        runEl.innerHTML = "Run";
        runEl.addEventListener("click", (e) => {
            this.execute(el.innerText, outputEl);
        });

        const commandsEl = document.createElement("div");
        commandsEl.appendChild(runEl);

        const exampleEl = document.createElement("div");
        exampleEl.className = "sqlime-example";
        exampleEl.appendChild(commandsEl);
        exampleEl.appendChild(outputEl);

        el.insertAdjacentElement("afterend", exampleEl);

        const example = { commandsEl, outputEl };
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
                this.execute(el.innerText, example.outputEl);
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

    // execute runs SQL query on the database and shows the results.
    execute(sql, outputEl) {
        sql = sql.trim();
        if (!sql) {
            outputEl.showMessage("");
            return;
        }
        try {
            outputEl.fadeOut();
            const result = this.getDatabase().execute(sql);
            outputEl.showResult(result);
        } catch (exc) {
            outputEl.showMessage(exc);
        } finally {
            outputEl.fadeIn();
        }
    }

    // getDatabase returns an SQLite database,
    // previously loaded using the 'sqlime-db' component
    getDatabase() {
        if (this.database == null) {
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
        const name = this.getAttribute("db");
        if (!name) {
            throw new Error("Missing the 'db' attribute.");
        }
        if (!(name in window.Sqlime.db)) {
            throw new Error(
                `Database '${name}' is not loaded. Use the 'sqlime-db' component to load it.`
            );
        }
        return window.Sqlime.db[name];
    }
}

if (!window.customElements.get("sqlime-examples")) {
    window.SqlimeExamples = SqlimeExamples;
    customElements.define("sqlime-examples", SqlimeExamples);
    customElements.define("sqlime-output", SqlimeOutput);
}

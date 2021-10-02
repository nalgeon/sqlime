import printer from "../printer.js";

// SQL result component
// shows the result of the SQL query as a table
class SqlResult extends HTMLElement {
    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    render() {
        const table = document.createElement("table");
        this.appendChild(table);
        this.el = table;
    }

    // print prints SQL query result as a table
    print(result) {
        this.applyPrinter(result, printer.printResult);
    }

    // printTables prints table list as a table
    printTables(tables) {
        this.applyPrinter(tables, printer.printTables);
    }

    // applyPrinter prints data structure
    // with specified printer function
    applyPrinter(data, printFunc) {
        if (!result) {
            this.clear();
            return;
        }
        this.el.innerHTML = printFunc(data);
    }

    // clear hides the table
    clear() {
        this.el.innerHTML = "";
    }
}

customElements.define("sql-result", SqlResult);

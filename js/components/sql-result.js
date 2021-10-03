import printer from "../printer.js";

// SQL result component
// shows the result of the SQL query as a table
class SqlResult extends HTMLElement {
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
        this.innerHTML = printFunc(data);
    }

    // clear hides the table
    clear() {
        this.innerHTML = "";
    }
}

customElements.define("sql-result", SqlResult);

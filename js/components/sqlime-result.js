import printer from "../printer.js";

// SQL result component
// shows the result of the SQL query as a table
class SqlimeResult extends HTMLElement {
    // print prints SQL query result as a table
    print(result) {
        this.applyPrinter(result, printer.printResult);
    }

    // printTables prints table list as a table
    printTables(tables) {
        this.applyPrinter(tables, printer.printTables);
    }

    // printMarkdown prints markdown text
    printMarkdown(text) {
        this.applyPrinter(text, printer.printMarkdown);
    }

    // applyPrinter prints data structure
    // with specified printer function
    applyPrinter(data, printFunc) {
        if (!data) {
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

if (!window.customElements.get("sqlime-result")) {
    window.SqlimeResult = SqlimeResult;
    customElements.define("sqlime-result", SqlimeResult);
}

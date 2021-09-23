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

    // print shows SQL query result as a table
    print(result) {
        if (!result) {
            this.clear();
            return;
        }
        this.el.innerHTML = printer.asTable(result);
    }

    // clear hides the table
    clear() {
        this.el.innerHTML = "";
    }
}

customElements.define("sql-result", SqlResult);

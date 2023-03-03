// Prints SQL query results as text.

// printResult converts SQL query results to an HTML table.
function printResult(result) {
    const [columns, values] = [result.columns, result.values];
    let html = "<thead>" + join(columns, "th") + "</thead>";
    const rows = values.map(function (v) {
        return join(v.map(sanitize), "td");
    });
    html += "<tbody>" + join(rows, "tr") + "</tbody>";
    return `<table>${html}</table>`;
}

// printTables prints the specified database tables.
function printTables(tables) {
    let html = "<thead><tr><th>table</th></tr></thead>";
    const rows = tables.map(function (table) {
        return `<tr>
            <td>
                <button class="sqlime-link" data-action="showTable" data-arg="${table}">
                    ${table}
                </button>
            </td>
        </tr>`;
    });
    html += "<tbody>" + rows.join("\n") + "</tbody>";
    return `<table>${html}</table>`;
}

// join joins the values, wrapping each one into a tag.
function join(values, tagName) {
    if (values.length === 0) {
        return "";
    }
    const open = "<" + tagName + ">";
    const close = "</" + tagName + ">";
    return open + values.join(close + open) + close;
}

// sanitize strips HTML from the text.
function sanitize(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}

const printer = { printResult, printTables };
export default printer;

// Prints SQL query result as text

// asTable converts SQL query result to HTML table
function asTable(result) {
    const [columns, values] = [result.columns, result.values];
    let html = "<thead>" + join(columns, "th") + "</thead>";
    const rows = values.map(function (v) {
        return join(v.map(sanitize), "td");
    });
    html += "<tbody>" + join(rows, "tr") + "</tbody>";
    return html;
}

function join(values, tagName) {
    if (values.length === 0) {
        return "";
    }
    const open = "<" + tagName + ">";
    const close = "</" + tagName + ">";
    return open + values.join(close + open) + close;
}

function sanitize(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}

const printer = { asTable };
export default printer;

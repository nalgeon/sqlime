// Prints SQL query result as text

// asTable converts SQL query result to HTML table
function asTable(result) {
    const [columns, values] = [result.columns, result.values];
    var html = "<thead>" + join(columns, "th") + "</thead>";
    var rows = values.map(function (v) {
        return join(v, "td");
    });
    html += "<tbody>" + join(rows, "tr") + "</tbody>";
    return html;
}

function join(values, tagName) {
    if (values.length === 0) {
        return "";
    }
    var open = "<" + tagName + ">",
        close = "</" + tagName + ">";
    return open + values.join(close + open) + close;
}

const printer = { asTable };
export default printer;

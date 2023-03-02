// Helper for working with window.location
import { DatabasePath } from "./db-path.js";

function name(path) {
    if (["binary", "id", "empty"].includes(path.type)) {
        return "";
    }
    const parts = path.value.split("/");
    return parts[parts.length - 1];
}

function path() {
    return new DatabasePath(window.location.hash.slice(1));
}

const locator = { name, path };
export default locator;

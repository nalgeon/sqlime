// Helper for working with window.location.

import { DatabasePath } from "./db-path.js";

// path creates a database path from the window location.
function path() {
    return new DatabasePath(window.location.hash.slice(1));
}

const locator = { path };
export default locator;

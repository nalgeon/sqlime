// Stores various database information
// in brower storage.

const PREFIX = "sqlime";

// get loads SQL query from the local storage
function get(key) {
    return localStorage.getItem(`${PREFIX}.query.${key}`);
}

// save saves SQL query to the local storage
function set(key, sql) {
    if (!sql) {
        remove(key);
    }
    localStorage.setItem(`${PREFIX}.query.${key}`, sql);
}

// remove deletes SQL query from the local storage
function remove(key) {
    localStorage.removeItem(`${PREFIX}.query.${key}`);
}

const storage = { get, set, remove };
export default storage;

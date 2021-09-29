// Stores various database information
// in brower storage.

// get loads SQL query from the local storage
function get(key) {
    return localStorage.getItem(`${key}.sql`);
}

// save saves SQL query to the local storage
function set(key, sql) {
    if (!sql) {
        remove(key);
    }
    localStorage.setItem(`${key}.sql`, sql);
}

// remove deletes SQL query from the local storage
function remove(key) {
    localStorage.removeItem(`${key}.sql`);
}

const storage = { get, set, remove };
export default storage;

// Stores various database information
// in brower storage.

// save saves SQL query to the local storage
function save(database, sql) {
    if (!sql) {
        return;
    }
    localStorage.setItem(`${database}.sql`, sql);
}

// load loads SQL query from the local storage
function load(database) {
    return localStorage.getItem(`${database}.sql`);
}

const storage = { save, load };
export default storage;

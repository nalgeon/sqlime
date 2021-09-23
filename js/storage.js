// Stores various database information
// in brower storage.

const DEFAULT_QUERY = "select * from sqlite_schema";

// save saves SQL query to the local storage
function save(database, sql) {
    if (!sql) {
        return;
    }
    localStorage.setItem(`${database}.sql`, sql);
}

// load loads SQL query from local storage
// and sets it as a value for the specified element
function load(database, el) {
    const sql = localStorage.getItem(`${database}.sql`);
    el.value = sql || DEFAULT_QUERY;
}

const storage = { save, load };
export default storage;

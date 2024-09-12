// Path to an SQLite database.

// Could be one of the following:
//   - local (../data.db),
//   - remote (https://domain.com/data.db)
//   - binary (binary database content)
//   - sql (sql script)
//   - id (gist:02994fe7f2de0611726d61dbf26f46e4)
//   - empty

class DatabasePath {
    constructor(value, type = null) {
        this.value = value;
        this.type = type || this.inferType(value);
    }

    // inferType guesses the path type by its value.
    inferType(value) {
        if (!value) {
            return "empty";
        }
        if (value instanceof ArrayBuffer) {
            return "binary";
        }
        if (value.startsWith("http://") || value.startsWith("https://")) {
            return "remote";
        }
        if (value.includes(":")) {
            return "id";
        }
        return "local";
    }

    // extractName extracts the database name from the path.
    extractName() {
        if (["binary", "sql", "id", "empty"].includes(this.type)) {
            return "";
        }
        const parts = this.value.split("/");
        return parts[parts.length - 1];
    }

    // toHash returns the path as a window location hash string.
    toHash() {
        if (
            this.type == "local" ||
            this.type == "remote" ||
            this.type == "id"
        ) {
            return `#${this.value}`;
        } else {
            return "";
        }
    }

    // toString returns the path as a string.
    toString() {
        if (this.type == "local" || this.type == "remote") {
            return `URL ${this.value}`;
        } else if (this.type == "binary") {
            return "binary value";
        } else if (this.type == "sql") {
            return "sql script";
        } else if (this.type == "id") {
            return `ID ${this.value}`;
        } else {
            return "empty value";
        }
    }
}

export { DatabasePath };

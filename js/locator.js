// Helper for working with window.location

const ID_PREFIX = "gist:";

// Database path, could be:
// - local (../data.db),
// - remote (https://domain.com/data.db)
// - binary (binary database content)
// - id (gist:02994fe7f2de0611726d61dbf26f46e4)
// - empty
class DatabasePath {
    constructor(value) {
        this.value = value;
        this.type = this.inferType(value);
        this.clean();
    }

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
        if (value.startsWith(ID_PREFIX)) {
            return "id";
        }
        return "local";
    }

    clean() {
        if (this.type == "id") {
            this.value = this.value.substr(ID_PREFIX.length);
        }
    }

    toHash() {
        if (this.type == "local" || this.type == "remote") {
            return `#${this.value}`;
        } else if (this.type == "id") {
            return `#${ID_PREFIX}${this.value}`;
        } else {
            return "";
        }
    }

    toString() {
        if (this.type == "local" || this.type == "remote") {
            return `URL ${this.value}`;
        } else if (this.type == "binary") {
            return `binary (${this.value.byteLength} bytes)`;
        } else if (this.type == "id") {
            return `ID ${this.value}`;
        } else {
            return "empty value";
        }
    }
}

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
export { locator, DatabasePath };

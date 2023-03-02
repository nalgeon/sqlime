// Database path, could be:
// - local (../data.db),
// - remote (https://domain.com/data.db)
// - binary (binary database content)
// - id (gist:02994fe7f2de0611726d61dbf26f46e4)
//      (deta:yuiqairmb558)
// - empty
class DatabasePath {
    constructor(value, type = null) {
        this.value = value;
        this.type = type || this.inferType(value);
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
        if (value.includes(":")) {
            return "id";
        }
        return "local";
    }

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

    toString() {
        if (this.type == "local" || this.type == "remote") {
            return `URL ${this.value}`;
        } else if (this.type == "binary") {
            return "binary value";
        } else if (this.type == "id") {
            return `ID ${this.value}`;
        } else {
            return "empty value";
        }
    }
}

export { DatabasePath };

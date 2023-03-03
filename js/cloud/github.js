// Github Gist API client.

const ID_PREFIX = "gist";

const HEADERS = {
    Accept: "application/json",
    "Content-Type": "application/json",
};

class Github {
    constructor() {
        this.prefix = ID_PREFIX;
        this.url = "https://api.github.com/gists";
        this.headers = Object.assign({}, HEADERS);
    }

    // loadCredentials loads GitHub credentials
    // from the local storage.
    loadCredentials() {
        this.username = localStorage.getItem("github.username");
        this.password = localStorage.getItem("github.token");
        if (this.password) {
            this.headers.Authorization = `Token ${this.password}`;
        }
    }

    // hasCredentials returns `true` if the user has provided
    // GitHub username and password, `false` otherwise.
    hasCredentials() {
        return this.username && this.password;
    }

    // getUrl returns a gist url by its id.
    getUrl(id) {
        return `https://gist.github.com/${this.username}/${id}`;
    }

    // get returns a gist by its id.
    get(id) {
        const promise = fetch(`${this.url}/${id}`, {
            method: "get",
            headers: this.headers,
        })
            .then((response) => response.json())
            .then((response) => {
                if (!response.files || !("query.sql" in response.files)) {
                    return null;
                }
                return buildGist(response);
            });
        return promise;
    }

    // create creates a new gist.
    create(name, schema, query) {
        const data = buildData(name, schema, query);
        const promise = fetch(this.url, {
            method: "post",
            headers: this.headers,
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((response) => buildGist(response));
        return promise;
    }

    // update updates an existing gist.
    update(id, name, schema, query) {
        const data = buildData(name, schema, query);
        const promise = fetch(`${this.url}/${id}`, {
            method: "post",
            headers: this.headers,
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((response) => buildGist(response));
        return promise;
    }
}

// buildData creates an object for the GitHub request.
function buildData(name, schema, query) {
    return {
        description: name,
        files: {
            "schema.sql": {
                content: schema || "--",
            },
            "query.sql": {
                content: query || "--",
            },
        },
    };
}

// buildGist creates a gist from the GitHub response.
function buildGist(response) {
    const gist = {
        id: response.id,
        prefix: ID_PREFIX,
        name: response.description,
        owner: response.owner.login,
        schema: response.files["schema.sql"].content,
        query: response.files["query.sql"].content,
    };
    if (gist.schema == "--") {
        gist.schema = "";
    }
    if (gist.query == "--") {
        gist.query = "";
    }
    return gist;
}

const github = new Github();
export default github;

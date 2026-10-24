// Github Gist API client.
// Saves databases as gists with `schema.sql` and `query.sql` files.

const ID_PREFIX = "gist";

const HEADERS = {
    Accept: "application/json",
    "Content-Type": "application/json",
};

class Github {
    constructor() {
        this.name = "GitHub";
        this.prefix = ID_PREFIX;
        this.url = "https://api.github.com/gists";
    }

    // username and token are read from the local storage
    // on each access, so changes in settings apply immediately.
    get username() {
        return localStorage.getItem("github.username");
    }

    get token() {
        return localStorage.getItem("github.token");
    }

    // hasCredentials returns `true` if the user has provided
    // GitHub username and token, `false` otherwise.
    hasCredentials() {
        return Boolean(this.username && this.token);
    }

    // getUrl returns a gist url by its id.
    getUrl(id) {
        return `https://gist.github.com/${this.username}/${id}`;
    }

    // get returns a gist by its path value, e.g. 'gist:12345'.
    get(pathValue) {
        const [prefix, id] = pathValue.split(":");
        if (prefix != ID_PREFIX) {
            return Promise.resolve(null);
        }
        return this.request("get", `${this.url}/${id}`).then((response) => {
            if (!response.files || !("query.sql" in response.files)) {
                return null;
            }
            return buildGist(response);
        });
    }

    // create creates a new gist.
    create(name, schema, query) {
        const data = buildData(name, schema, query);
        return this.request("post", this.url, data).then(buildGist);
    }

    // update updates an existing gist.
    update(id, name, schema, query) {
        const data = buildData(name, schema, query);
        return this.request("post", `${this.url}/${id}`, data).then(buildGist);
    }

    // request calls the GitHub API and returns the JSON response,
    // rejecting on anything different from 200 OK.
    async request(method, url, data = null) {
        const headers = Object.assign({}, HEADERS);
        if (this.token) {
            headers.Authorization = `Token ${this.token}`;
        }
        const body = data ? JSON.stringify(data) : undefined;
        const response = await fetch(url, { method, headers, body });
        if (!response.ok) {
            return Promise.reject(`got ${response.status} status code`);
        }
        return response.json();
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

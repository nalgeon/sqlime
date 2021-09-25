// Github Gist API client

const HEADERS = {
    Accept: "application/json",
    "Content-Type": "application/json",
};

class Gister {
    constructor() {
        this.url = "https://api.github.com/gists";
        this.headers = Object.assign({}, HEADERS);
    }

    // loadCredentials loads GitHub credentials
    // from local storage
    loadCredentials() {
        this.username = localStorage.getItem("github.username");
        this.password = localStorage.getItem("github.token");
        this.headers.Authorization = `Token ${this.password}`;
    }

    // hasCredentials returns true if user has provided
    // GitHub username and password, false otherwise
    hasCredentials() {
        return this.username && this.password;
    }

    // getUrl returns gist url by its id
    getUrl(id) {
        return `https://gist.github.com/${this.username}/${id}`;
    }

    // get returns gist by id
    get(id) {
        const promise = fetch(`${this.url}/${id}`, {
            method: "get",
            headers: HEADERS,
        })
            .then((response) => response.json())
            .then((response) => {
                if (!response.files) {
                    return null;
                }
                return response;
            });
        return promise;
    }

    // create creates new gist
    create(name, schema, query) {
        const data = buildData(name, schema, query);
        const promise = fetch(this.url, {
            method: "post",
            headers: this.headers,
            body: JSON.stringify(data),
        }).then((response) => response.json());
        return promise;
    }

    // update updates existing gist
    update(id, name, schema, query) {
        const data = buildData(name, schema, query);
        const promise = fetch(`${this.url}/${id}`, {
            method: "post",
            headers: this.headers,
            body: JSON.stringify(data),
        }).then((response) => response.json());
        return promise;
    }
}

function buildData(name, schema, query) {
    return {
        description: name,
        files: {
            "schema.sql": {
                content: schema,
            },
            "query.sql": {
                content: query,
            },
        },
    };
}

const gister = new Gister();
export default gister;

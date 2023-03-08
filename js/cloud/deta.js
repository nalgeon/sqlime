// Deta Base API client.

import http from "./http.js";

const ID_PREFIX = "deta";

const HEADERS = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-API-Key": "c0106ixe_ioZahCLri7biViV7vqBduA96sHAzob6D",
};

class Deta {
    constructor() {
        this.name = "Deta";
        this.prefix = ID_PREFIX;
        this.url = "https://database.deta.sh/v1/c0106ixe/sqlime/items";
        this.headers = Object.assign({}, HEADERS);
    }

    // loadCredentials generates a random username.
    loadCredentials() {
        if (this.username) {
            return;
        }
        this.username = randomUsername();
    }

    // hasCredentials always returns true.
    hasCredentials() {
        return this.username;
    }

    // getUrl returns an empty string,
    // because there is no public url to view.
    getUrl(id) {
        return "";
    }

    // get returns a gist by its id.
    get(id) {
        const promise = fetch(`${this.url}/${id}`, {
            method: "get",
            headers: this.headers,
        })
            .then((response) => http.toJson(response))
            .then((response) => {
                if (!response.query) {
                    return null;
                }
                return buildGist(response);
            });
        return promise;
    }

    // create creates a new gist.
    create(name, schema, query) {
        const body = {
            item: buildData(name, this.username, schema, query),
        };
        const promise = fetch(this.url, {
            method: "post",
            headers: this.headers,
            body: JSON.stringify(body),
        })
            .then((response) => http.toJson(response))
            .then((response) => buildGist(response));
        return promise;
    }

    // update updates an existing gist.
    update(id, name, schema, query) {
        const data = buildData(name, this.username, schema, query);
        data.key = id;
        const body = {
            items: [data],
        };
        const promise = fetch(this.url, {
            method: "put",
            headers: this.headers,
            body: JSON.stringify(body),
        })
            .then((response) => http.toJson(response))
            .then((response) => response.processed.items[0])
            .then((response) => buildGist(response));
        return promise;
    }
}

// randomUsername generates a username
// with a random 6-digit suffix.
function randomUsername() {
    const min = 100000;
    const max = 999999;
    const n = Math.floor(Math.random() * (max - min) + min);
    return `user${n}`;
}

// buildData creates an object for the Deta request.
function buildData(name, owner, schema, query) {
    return {
        name: name,
        owner: owner,
        schema: schema,
        query: query,
    };
}

// buildGist creates a gist from the Deta response.
function buildGist(response) {
    const gist = {
        id: response.key,
        prefix: ID_PREFIX,
        name: response.name,
        owner: response.owner,
        schema: response.schema,
        query: response.query,
    };
    return gist;
}

const deta = new Deta();
export default deta;

import deta from "./cloud/deta.js";
import github from "./cloud/github.js";

const PROVIDERS = {
    [deta.prefix]: deta,
    [github.prefix]: github,
};

class Gister {
    constructor() {
        this._provider = null;
    }

    get username() {
        return this.provider.username;
    }

    get provider() {
        if (!this._provider) {
            this.reload();
        }
        return this._provider;
    }

    reload() {
        github.loadCredentials();
        if (github.hasCredentials()) {
            this._provider = github;
        } else {
            this._provider = deta;
        }
    }

    loadCredentials() {
        this.provider.loadCredentials();
    }

    hasCredentials() {
        return this.provider.hasCredentials();
    }

    getUrl(id) {
        return this.provider.getUrl(id);
    }

    get(pathValue) {
        const [prefix, id] = pathValue.split(":");
        const provider = PROVIDERS[prefix];
        return provider.get(id);
    }

    create(name, schema, query) {
        return this.provider.create(name, schema, query);
    }

    update(id, name, schema, query) {
        return this.provider.update(id, name, schema, query);
    }
}

const gister = new Gister();
export default gister;

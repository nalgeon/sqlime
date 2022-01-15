// Cloud Storage API Facade
// Chooses Github Gist API for users with credentials,
// otherwise falls back to Deta Base API.

import deta from "./cloud/deta.js";
import github from "./cloud/github.js";

const PROVIDERS = {
    [deta.prefix]: deta,
    [github.prefix]: github,
};

// Most methods delegate to the underlying provider, except for get()
class Gister {
    constructor() {
        this._provider = null;
    }

    // username is needed to choose
    // create vs update on save
    get username() {
        return this.provider.username;
    }

    // provider is the underlying cloud storage provider
    // who does the actual work of saving and loading gists
    get provider() {
        // lazy init the provider
        if (!this._provider) {
            this.reload();
        }
        return this._provider;
    }

    // reload() chooses Github if the credentials are available
    // otherwise chooses Deta
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

    // get() uses the provider specified in the path value
    // e.g. gist:12345 or deta:54321
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

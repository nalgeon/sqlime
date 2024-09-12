// Cloud Storage API Facade.

// Uses Github Gist API for users with credentials.

import github from "./cloud/github.js";

const PROVIDERS = {
    [github.prefix]: github,
};

// Cloud Storage API Facade.
// Most methods delegate to the underlying provider, except for `get`.
class Gister {
    constructor() {
        this._provider = null;
    }

    // name is the name of the provider.
    get name() {
        return this.provider.name;
    }

    // username is needed to decide whether
    // to call `create` or `update` on save.
    get username() {
        return this.provider.username;
    }

    // provider is the underlying cloud storage provider,
    // which does the actual work of saving and loading gists.
    get provider() {
        // lazy init the provider
        if (!this._provider) {
            this.reload();
        }
        return this._provider;
    }

    // reload chooses GitHub as a provider.
    reload() {
        github.loadCredentials();
        this._provider = github;
    }

    // loadCredentials loads credentials from the local storage.
    loadCredentials() {
        this.provider.loadCredentials();
    }

    // hasCredentials returns `true` if the user has provided
    // API credentials, `false` otherwise.
    hasCredentials() {
        return this.provider.hasCredentials();
    }

    // getUrl returns a gist url by its id.
    getUrl(id) {
        return this.provider.getUrl(id);
    }

    // get returns a gist by its id.
    // Uses the provider specified in the path value,
    // e.g. 'gist:12345'.
    get(pathValue) {
        const [prefix, id] = pathValue.split(":");
        const provider = PROVIDERS[prefix];
        return provider.get(id);
    }

    // create creates a new gist.
    create(name, schema, query) {
        return this.provider.create(name, schema, query);
    }

    // update updates an existing gist.
    update(id, name, schema, query) {
        return this.provider.update(id, name, schema, query);
    }
}

const gister = new Gister();
export default gister;

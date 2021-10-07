const engine = {
    errorCount: 0,
    console: document.querySelector("#console"),
    mocked: {},
};

function assert(desc, condition) {
    if (condition) {
        log(`  ✔ ${desc}`);
    } else {
        engine.errorCount++;
        log(`  ✘ ${desc}`);
    }
}

function log(message) {
    const line = document.createTextNode(message + "\n");
    engine.console.appendChild(line);
    console.log(message);
}

function summary() {
    if (engine.errorCount) {
        log(`✘ FAILED with ${engine.errorCount} errors`);
    } else {
        log("✔ All tests passed");
    }
}

function wait(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(ms);
        }, ms);
    });
}

function mock(obj, property, repacement) {
    obj[`${property}.mocked`] = obj[property];
    obj[property] = repacement;
}

function unmock(obj, property) {
    obj[property] = obj[`${property}.mocked`];
    delete obj[`${property}.mocked`];
}

export { assert, log, mock, unmock, summary, wait };

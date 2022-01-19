// Measures operation execution time

let started;

// start starts measuring the execution time
function start() {
    started = performance.now();
}

// finish stops measuring the execution time
// and returns elasped time in ms
function finish() {
    var elapsed = performance.now() - started;
    return Math.round(elapsed);
}

const timeit = { start, finish };
export default timeit;

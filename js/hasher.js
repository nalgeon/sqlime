// Simple 32-bit integer hashcode implementation.

// string calculates a hashcode for the String value.
function string(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return hash;
}

// uint8Array calculates a hashcode for the Uint8Array value.
function uint8Array(arr) {
    let hash = 0;
    for (let i = 0; i < arr.length; i++) {
        hash = (hash << 5) - hash + arr[i];
        hash = hash & hash;
    }
    return hash;
}

const hasher = { string, uint8Array };
export default hasher;

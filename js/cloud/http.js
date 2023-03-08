// HTTP helper.

// toJson converts the HTTP response to JSON,
// throwing an error on anything different from 200 OK.
function toJson(response) {
    if (!response.ok) {
        const msg = `got ${response.status} status code`;
        return Promise.reject(msg);
    }
    return response.json();
}

const http = { toJson };
export default http;

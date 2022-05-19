const fetch = require('node-fetch');

class Request {
    constructor(root, route, method, data) {
        this.root = root;
        this.route = route;
        this.method = method;
        this.data = data;
    }

    async send() {
        return await fetch(this.root + this.route, {
            method: this.method,
            body: this.method === "GET" ? null : this.data
        });
    }
}

module.exports = Request;
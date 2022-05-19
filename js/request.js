const { FetchError } = require('node-fetch');
const fetch = require('node-fetch');

class Request {
    constructor(root, route, method, data) {
        this.root = root;
        this.route = route;
        this.method = method;
        this.data = data;
    }

    async send() {
        try {
            return await fetch(this.root + this.route, {
                method: this.method,
                body: this.method === "GET" ? null : this.data
            });
        } 
        catch (error) {
            return error;
        }
    }
}

module.exports = Request;
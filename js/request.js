const fetch = require('node-fetch-commonjs');

class Request {
    constructor(root, route, method, data, contentType) {
        this.root = root;
        this.route = route;
        this.method = method;
        this.data = data;
        this.contentType = contentType;
    }

    async send() {
        try {
            return await fetch(this.root + this.route, {
                method: this.method,
                body: this.method === "GET" ? null : this.data,
                headers: { 'Content-Type': this.contentType }
            });
        } 
        catch (error) {
            return error;
        }
    }
}

module.exports = Request;
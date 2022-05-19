const Request = require('./request');
const marky = require('marky');
const { FetchError } = require('node-fetch');
const { Response } = require('node-fetch');

class Tester {
    constructor() {
        this.cache = [Request];
    }

    setWebview(webview) {
        this.webview = webview;
    }

    logOutput(log) {
        this.webview.postMessage(log);
    }

    async submitRequest(root, route, method, data) {
        this.logOutput(method + ' ' + root + ' ~ ' + data);
        this.logOutput([
            { text: method, highlight: "white", color: "black" },
            { text: route, highlight: "transparent", color: "white" }
        ]);

        let request = new Request(root, route, method, data);

        marky.mark('requestSend');
        this.handleResponse(await request.send());
    }

    handleResponse(response) {
        response instanceof FetchError ? this.logResponseAsFetchError(response) : 
        response instanceof TypeError ? this.logResponseAsTypeError(response) :
        response instanceof Response ? this.logResponseAsRecieved(response) : null;
    }

    logResponseAsFetchError(response) {
        this.logOutput([
            { text: "error", highlight: "red", color: "white" },
            { text: response.errno, highlight: "red", color: "white" }
        ]);
    }

    logResponseAsTypeError(response) {
        this.logOutput([
            { text: "error", highlight: "red", color: "white" },
            { text: response.message, highlight: "transparent", color: "white" }
        ]);
    }

    logResponseAsRecieved(response) {
        let responseTime = marky.stop('requestSend').duration.toFixed(2);

        this.logOutput([
            { text: response.status, highlight: mapStatusCode(response.status), color: "white" },
            { text: response.statusText, highlight: mapStatusCode(response.status), color: "white" },
            { text: 'in', highlight: "transparent", color: "white" },
            { text: responseTime, highlight: "white", color: "black" },
            { text: "ms", highlight: "white", color: "black" }
        ]);

        //this.logOutput([
        //    { text: JSON.stringify(response, null, 4), highlight: "transparent", color: "white" }
        //]);
    }
}

function mapStatusCode(status) {
    if (status < 200) {
        return "white";
    }
    else if (status < 300) {
        return "green";
    }
    else if (status < 400) {
        return "blue";
    }
    else if (status < 600) {
        return "red";
    }
}

module.exports = Tester;
const Request = require('./request');
const marky = require('marky');
const { FetchError } = require('node-fetch');
const { Response } = require('node-fetch');

const RED = "#D00000";
const BLUE = "#1A659E";
const GREEN = "#5FAD56";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

class Tester {
    constructor() {
        this.cache = [Request];
    }

    setWebview(webview) {
        this.webview = webview;
    }

    logOutput(log, content) {
        this.webview.postMessage({ tokens: log, content: content })
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
            { text: "error", highlight: RED, color: WHITE },
            { text: response.errno, highlight: "transparent", color: WHITE }
        ]);
    }

    logResponseAsTypeError(response) {
        this.logOutput([
            { text: "error", highlight: RED, color: WHITE },
            { text: response.message, highlight: "transparent", color: WHITE }
        ]);
    }

    async logResponseAsRecieved(response) {
        let responseTime = marky.stop('requestSend').duration.toFixed(2);

        this.logOutput([
            { text: response.status, highlight: mapStatusCode(response.status), color: WHITE },
            { text: response.statusText, highlight: mapStatusCode(response.status), color: WHITE },
            { text: 'in', highlight: "transparent", color: WHITE },
            { text: responseTime, highlight: WHITE, color: BLACK },
            { text: "ms", highlight: WHITE, color: BLACK }
        ]);

        let responseBody = await response.text();
        let responseType = 'text response';

        try {
            responseBody = JSON.parse(responseBody);
            responseType = 'json response';
        } catch (e) {
            if(/<\/?[a-z][\s\S]*>/i.test(responseBody)) {
                responseType = 'html response';
            }
        }

        this.logOutput([
            { text: ">", highlight: "transparent", color: WHITE },
            { text: responseType, highlight: WHITE, color: BLACK }
        ], responseBody);

        
    }
}

function mapStatusCode(status) {
    return status < 200 ? WHITE :
        status < 300 ? GREEN :
            status < 400 ? BLUE :
                status < 600 ? RED : WHITE
}

module.exports = Tester;
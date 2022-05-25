const Request = require('./request');
const marky = require('marky');
const { FetchError } = require('node-fetch-commonjs');
const { Response } = require('node-fetch-commonjs');
const { FlowFlags } = require('typescript');

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

    logOutput(log, content, span) {
        this.webview.postMessage({ tokens: log, content: content, span: span != null })
    }

    async runFlow(flow) {
        this.logOutput([
            { text: "flow", highlight: WHITE, color: BLACK },
            { text: flow.name, highlight: "transparent", color: WHITE }
        ]);

        this.logOutput([
            { text: "root", highlight: WHITE, color: BLACK },
            { text: flow.root, highlight: "transparent", color: WHITE }
        ]);

        let operationResult = 0;

        for(let i = 0; i < flow.flow.length; i++) {
            const flowPart = flow.flow[i];
            const contentType = flowPart.contentType === undefined ? null : flowPart.contentType;

            this.logOutput([
                { text: flowPart.name, highlight: BLUE, color: WHITE }
            ], null, true);

            operationResult = await this.submitRequest(flow.root, flowPart.route, flowPart.method, JSON.stringify(flowPart.body), contentType);

            if(operationResult > 0) 
                break;
        }

        this.logOutput([
            { text: operationResult > 0 ? "flow aborted" : "flow completed", highlight: "transparent", color: operationResult > 0 ? RED : GREEN }
        ]);
    }

    async submitRequest(root, route, method, data, contentType) {
        this.logOutput([
            { text: method, highlight: WHITE, color: BLACK },
            { text: route, highlight: "transparent", color: WHITE }
        ]);

        this.logOutput([
            { text: "sent", highlight: WHITE, color: BLACK },
            { text: ">", highlight: "transparent", color: WHITE },
            { text: "view request", highlight: "transparent", color: WHITE }
        ], data);

        let request = new Request(root, route, method, data, contentType);

        marky.mark('requestSend');
        return this.handleResponse(await request.send());
    }

    handleResponse(response) {
        return response instanceof FetchError ? this.logResponseAsFetchError(response) :
               response instanceof TypeError ? this.logResponseAsTypeError(response) :
               response instanceof Response ? this.logResponseAsRecieved(response) : null;
    }

    logResponseAsFetchError(response) {
        this.logOutput([
            { text: "error", highlight: RED, color: WHITE },
            { text: response.errno, highlight: "transparent", color: WHITE }
        ]);

        return 1;
    }

    logResponseAsTypeError(response) {
        this.logOutput([
            { text: "error", highlight: RED, color: WHITE },
            { text: response.message, highlight: "transparent", color: WHITE }
        ]);

        return 2;
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

        return 0;
    }
}

function mapStatusCode(status) {
    return status < 200 ? WHITE :
        status < 300 ? GREEN :
            status < 400 ? BLUE :
                status < 600 ? RED : WHITE
}

module.exports = Tester;
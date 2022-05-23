const vscode = require('vscode');
const fs = require('fs');
const File = require('fs');
const path = require('path');
const Tester = require('./tester');

class TesterProvider {
    constructor(extensionPath, extensionUri) {
        this.extensionPath = extensionPath;
        this.extensionUri = extensionUri;
        this.viewType = 'endpointtester.endpointTesterView';
        this.tester = new Tester();
    }

    resolveWebviewView(webviewView) {
        webviewView.webview.options = this.getWebviewOptions();
        webviewView.webview.html = this.getHtml(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(this.handleWebviewMessage.bind(this));
    }

    getWebviewOptions() {
        return {
            localResourceRoots: [
                vscode.Uri.file(path.join(this.extensionPath, 'styles')),
                vscode.Uri.file(path.join(this.extensionPath, 'js')) ],
            enableScripts: true
        }
    }

    getHtml(webview) {
        const stylePath = vscode.Uri.joinPath(this.extensionUri, 'styles', 'stylesheet.css');
		const styleUri = webview.asWebviewUri(stylePath);

		const compactPath = vscode.Uri.file(path.join(this.extensionPath, 'views', 'compact.html'));
		let compactViewHtml = fs.readFileSync(compactPath.fsPath, 'utf8').toString();

		const nonce = this.getNonce();

		this.tester.setWebview(webview);

		// Tries to prevent someone from manually inserting matching nonces into html
		if(!compactViewHtml.includes('{nonce}')) throw new Error('External html has been tampered with. Exiting.');

        return compactViewHtml
        .replace('{style}', styleUri.toString())
        .replace('{cspSource}', webview.cspSource)
        .replace('{nonce}', nonce)
        .replace('{nonce}', nonce);;
    }

    handleWebviewMessage(message) {
        message.messageType === "loadFlow" ? this.loadFlow(message.filePath) :
        message.messageType === "submit" ? this.tester.submitRequest(message.root, message.route, message.method, null) : null;
    }

    loadFlow(filePath) {
        let flowString = fs.readFileSync(filePath).toString();
        let flowBuffer = JSON.parse(flowString);

        flowBuffer.cases.forEach(caseToken => {
            while(flowString.includes(caseToken.token)) {
                console.log('replaced ' + caseToken.token + ' with ' + caseToken.default);
                flowString = flowString.replace(caseToken.token, caseToken.default);
            }
        });

        this.tester.runFlow(JSON.parse(flowString));
    }
    
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}

module.exports = TesterProvider;
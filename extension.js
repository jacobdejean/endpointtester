const vscode = require('vscode');
const TesterProvider = require('./js/testerprovider');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "endpointtester" is now active!');

	
	
	try {
		const testerProvider = new TesterProvider(context.extensionPath, context.extensionUri);

		context.subscriptions.push(vscode.window.registerWebviewViewProvider(testerProvider.viewType, testerProvider))
	} catch(error) {
		console.log(error);
	}

	let disposable = vscode.commands.registerCommand('endpointtester.endpointTester', function () {
		vscode.window.showInformationMessage('Started endpointtester');

		//const panel = vscode.window.createWebviewPanel('endpointtester', "Endpoint Tester", vscode.ViewColumn, getWebviewOptions(context));
		
		
	});
	
	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}


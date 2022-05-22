const vscode = require('vscode');
const TesterProvider = require('./js/testerprovider');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('endpointtester active');

	try {
		const testerProvider = new TesterProvider(context.extensionPath, context.extensionUri);

		context.subscriptions.push(vscode.window.registerWebviewViewProvider(testerProvider.viewType, testerProvider))
		context.subscriptions.push(vscode.commands.registerCommand('endpointtester.endpointTester', function () { /* This is where the load flow command will be implemented */ } ));
	} catch(error) {
		console.log(error);
	}
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}


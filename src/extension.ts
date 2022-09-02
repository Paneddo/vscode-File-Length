import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {

	const commandId = 'sample.showSelectionCount';
	context.subscriptions.push(vscode.commands.registerCommand(commandId, () => {
		const linesCount = getFileLength(vscode.window.activeTextEditor);
		const openDocument = vscode.window.activeTextEditor?.document;
		const displayName = openDocument?.isUntitled ? '' : openDocument?.fileName;
		const workSpace = vscode.workspace.workspaceFolders?.[0].uri.path;
		const fileName = displayName?.replace(workSpace? workSpace : '', '');

		vscode.window.showInformationMessage(`File ${fileName} is ${linesCount} lines long`);
	}));

	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	statusBarItem.command = commandId;
	
	context.subscriptions.push(statusBarItem);
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(updateStatusBarItem));

	updateStatusBarItem();
}

function updateStatusBarItem(): void {
	const lines = vscode.window.activeTextEditor?.document.lineCount;
	if (lines) {
		statusBarItem.text = `$(list-ordered) Length: ${lines}`;
		statusBarItem.show();
	} else {
		statusBarItem.hide();
	}
}

function getFileLength(editor: vscode.TextEditor | undefined): number | undefined {
	return editor?.document.lineCount;
}

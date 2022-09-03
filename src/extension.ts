import * as vscode from 'vscode';

type fileStats = {
	lines: number;
	column?: number;
};

let statusBarItem: vscode.StatusBarItem;
const separator = '|';

export function activate(context: vscode.ExtensionContext) {

	const commandId = 'file-length.ShowLinesCount';
	context.subscriptions.push(vscode.commands.registerCommand(commandId, () => {
		const linesCount: string = getFileLength();
		const openDocument = vscode.window.activeTextEditor?.document;
		const displayName = openDocument?.isUntitled ? '' : openDocument?.fileName;
		const workSpace = vscode.workspace.workspaceFolders?.[0].uri.path;
		const fileName = displayName?.replace(workSpace? workSpace : '', '');

		vscode.window.showInformationMessage(`File ${fileName} is ${linesCount} lines long`);
	}));

	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	statusBarItem.command = commandId;
	statusBarItem.tooltip = 'Lines in the current File';
	
	context.subscriptions.push(statusBarItem);
	
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
	context.subscriptions.push(vscode.window.onDidChangeVisibleTextEditors(updateStatusBarItem));
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(updateStatusBarItem));

	updateStatusBarItem();
	
}

function updateStatusBarItem(): void {
	const lines = getFileLength();
	
	if (lines) {
		statusBarItem.text = `$(list-ordered) Length: ${lines}`;
		statusBarItem.show();
	} else {
		statusBarItem.hide();
	}
}

function getFileLength(): string {
	const visibleEditors: ReadonlyArray<vscode.TextEditor> = vscode.window.visibleTextEditors;
	const openFiles: Array<fileStats> = [];
	visibleEditors.forEach(e => openFiles.push({
		lines: e.document.lineCount,
		column: e.viewColumn
	}));
	openFiles.sort((a, b) => (a.column == undefined ? Number.MAX_VALUE : a.column) - (b.column  == undefined ? Number.MAX_VALUE : b.column));
	
	const sortedLengths: Array<number> = openFiles.map(file => file.lines);
	return sortedLengths.join(` ${separator} `);
}

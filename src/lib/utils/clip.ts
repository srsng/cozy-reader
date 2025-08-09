export async function writeToClipBoard(text: string, toastIt?: boolean) {
	try {
		await navigator.clipboard.writeText(text);
		console.log('Copied!');
	} catch {
		console.warn('Failed!');
	}
}

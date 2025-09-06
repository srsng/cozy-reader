import { toast } from 'svelte-sonner';

export async function writeToClipBoard(text: string, toastIt?: boolean) {
	try {
		await navigator.clipboard.writeText(text);
		console.log('Copied!');
		if (toastIt) {
			toast.success('复制成功');
		}
		return true;
	} catch {
		console.warn('Failed!');
		if (toastIt) {
			toast.error('复制失败');
		}
		return false;
	}
}

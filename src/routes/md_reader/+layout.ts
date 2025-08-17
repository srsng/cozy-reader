export const prerender = false;

export async function load({ params }) {
	const books: Record<string, string> = {
		'1': String.raw`E:\my_computer\my_value\小马宝莉\漫画\小马IDW熟肉_md\G4主线\第1话10周年.md`,
		'2': String.raw`E:\my_computer\Documents\WXWork\1688856554681546\Cache\File\2025-08\C端小程序.md`
	};

	return {
		...params,
		books
	};
}

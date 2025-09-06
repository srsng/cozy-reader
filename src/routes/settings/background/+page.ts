import type { PageLoad } from './$types';

export const load = (async () => {
	const metaData = {
		title: '背景设置',
		description: '管理应用程序的背景图片和设置选项'
	};
	return {
		metaData
	};
}) satisfies PageLoad;

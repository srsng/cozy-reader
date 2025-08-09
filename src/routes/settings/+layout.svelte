<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();

	// save btn
	// let saveBtnText = $state('保存设置');
	// let saveBtnActivate = $state(true);
	// let timer: ReturnType<typeof setTimeout>;

	// // store
	// const currentSettings = getContextStoreBySymbol<Settings, Writable<Settings>>(SETTINGS);
	// let localSettings = $state(DEFAULT_SETTINGS);

	// onMount(() => {
	// 	localSettings = {
	// 		...localSettings,
	// 		...$currentSettings
	// 	};
	// });

	// 手动保存
	// function handleSave() {
	// 	saveBtnText = '保存中...';
	// 	saveBtnActivate = false;
	// 	currentSettings.update((s) => ({ ...s, ...localSettings }));
	// 	saveBtnText = '已保存！';

	// 	if (timer) clearTimeout(timer);
	// 	timer = setTimeout(() => {
	// 		saveBtnText = '保存设置';
	// 		saveBtnActivate = true;
	// 	}, 2000);
	// }
</script>

<div class="mx-auto w-full max-w-[85%] select-none space-y-6 p-6">
	<div class="space-y-2">
		<h2 class="text-2xl font-bold">设置</h2>
		<p class="text-muted-foreground">管理应用程序的设置选项</p>
	</div>

	<Tabs.Root value="base" class="w-full">
		<Tabs.List class="grid w-full grid-cols-3">
			<Tabs.Trigger value="base" onclick={() => goto('/settings/base')}>基础设置</Tabs.Trigger>
			<Tabs.Trigger value="theme" onclick={() => goto('/settings/theme')}>主题设置</Tabs.Trigger>
			<Tabs.Trigger value="reader" onclick={() => goto('/settings/reader')}>阅读器设置</Tabs.Trigger
			>
		</Tabs.List>
		{@render children?.()}
	</Tabs.Root>

	<!-- <Separator /> -->

	<!-- Save Button -->
	<!-- <div class="flex justify-end">
		<Button onclick={handleSave} disabled={!saveBtnActivate}>
			{saveBtnText}
		</Button>
	</div> -->
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { resetMode, setMode } from 'mode-watcher';
	// import Switch from "$lib/components/Switch.svelte";
	// import Slider from "$lib/components/Slider.svelte";
	// import RadioGroup from "$lib/components/RadioGroup.svelte";
	import { DEFAULT_SETTINGS, SETTINGS, type Settings } from '$lib/settings';
	import { getContextStoreBySymbol } from '$lib/utils/context';
	// import ThemePanel from "$lib/components/theme/themePanel.svelte";
	// import ThemeDrawer from "$lib/components/theme/themeDrawer.svelte";
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { AppThemeMode } from '$lib/settings/Theme';
	import { Separator } from '$lib/components/ui/separator';

	let saveBtnText = $state('保存设置');
	let saveBtnActivate = $state(true);
	let timer: ReturnType<typeof setTimeout>;

	const currentSettings = getContextStoreBySymbol<Settings, Writable<Settings>>(SETTINGS);
	let localSettings = $state(DEFAULT_SETTINGS);

	onMount(() => {
		localSettings = {
			...localSettings,
			...$currentSettings
		};
	});

	function handleSave() {
		saveBtnText = '保存中...';
		saveBtnActivate = false;
		// AppManager.updateConfig(void 0, localSettings);
		currentSettings.update((s) => ({ ...s, ...localSettings }));
		saveBtnText = '已保存！';

		console.log(localSettings.theme.mode);

		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			saveBtnText = '保存设置';
			saveBtnActivate = true;
		}, 2000);
	}
	// import { goto } from '$app/navigation';

	// goto('/settings/base', { replaceState: true });
</script>

<div class="mx-auto w-full max-w-[85%] space-y-6 p-6">
	<div class="space-y-2">
		<h2 class="text-2xl font-bold">设置</h2>
		<p class="text-gray-500">管理应用程序的设置选项</p>
	</div>
	<!-- <div class="w-full">
    <ThemePanel></ThemePanel>
  </div> -->

	<section>
		<div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>主题 - {$currentSettings.theme.mode}</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.RadioGroup bind:value={$currentSettings.theme.mode}>
						<DropdownMenu.RadioItem value={'light' as AppThemeMode} onclick={() => setMode('light')}
							>Light</DropdownMenu.RadioItem
						>
						<DropdownMenu.RadioItem value={'dark' as AppThemeMode} onclick={() => setMode('dark')}
							>Dark</DropdownMenu.RadioItem
						>
						<DropdownMenu.RadioItem value={'system' as AppThemeMode} onclick={resetMode}
							>System</DropdownMenu.RadioItem
						>
					</DropdownMenu.RadioGroup>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</section>

	<Separator />

	<!-- Save Button -->
	<div class="flex justify-end">
		<Button onclick={handleSave} disabled={!saveBtnActivate}>
			{saveBtnText}
		</Button>
	</div>

	<!-- 关于 -->
	<!-- <section class="space-y-4">
    <h3 class="text-lg font-medium">关于</h3>
    <div class="p-4 rounded-lg">
      <p class="text-sm">版本: 1.0.0</p>
      <p class="text-sm">构建日期: 2024-01-27</p>
    </div>
  </section> -->
</div>

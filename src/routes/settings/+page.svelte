<script lang="ts">
	import { page } from '$app/state';
	import { BaseSettingsForm, ReaderSettingsForm, ThemeSettingsForm } from '$lib/components/forms';
	import * as Tabs from '$lib/components/ui/tabs';
	import { m } from '$lib/paraglide/messages.js';
	import { slide } from 'svelte/transition';

	// todo: state
	// @ts-ignore
	const _tab = page.state.tab;
	let tab = $state(_tab || 'base');
</script>

<div transition:slide>
	<Tabs.Root bind:value={tab} class="w-full">
		<Tabs.List class="grid w-full grid-cols-3">
			<Tabs.Trigger value="base">{m['settings.base']()}</Tabs.Trigger>
			<Tabs.Trigger value="theme">{m['settings.theme']()}</Tabs.Trigger>
			<Tabs.Trigger value="reader">{m['settings.reader']()}</Tabs.Trigger>
		</Tabs.List>
		<!-- 基础设置标签页 -->
		<Tabs.Content value="base" class="space-y-6">
			<BaseSettingsForm />
		</Tabs.Content>

		<!-- 主题设置标签页 -->
		<Tabs.Content value="theme" class="space-y-6">
			<ThemeSettingsForm />
		</Tabs.Content>

		<!-- 阅读器设置标签页 -->
		<Tabs.Content value="reader" class="space-y-6">
			<ReaderSettingsForm />
		</Tabs.Content>
	</Tabs.Root>
</div>

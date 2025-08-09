<script lang="ts">
	import { BaseSettingsForm, ReaderSettingsForm, ThemeSettingsForm } from '$lib/components/forms';
	import * as Tabs from '$lib/components/ui/tabs';
</script>

<Tabs.Root value="base" class="w-full">
	<Tabs.List class="grid w-full grid-cols-3">
		<Tabs.Trigger value="base">基础设置</Tabs.Trigger>
		<Tabs.Trigger value="theme">主题设置</Tabs.Trigger>
		<Tabs.Trigger value="reader">阅读器设置</Tabs.Trigger>
	</Tabs.List>
	<!-- 基础设置标签页 -->
	<Tabs.Content value="base" class="space-y-6">
		<BaseSettingsForm />
	</Tabs.Content>

	<!-- 阅读器设置标签页 -->
	<Tabs.Content value="reader" class="space-y-6">
		<ReaderSettingsForm />
	</Tabs.Content>

	<!-- 主题设置标签页 -->
	<Tabs.Content value="theme" class="space-y-6">
		<ThemeSettingsForm />
	</Tabs.Content>
</Tabs.Root>

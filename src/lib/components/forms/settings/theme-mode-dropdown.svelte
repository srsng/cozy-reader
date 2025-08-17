<script lang="ts" module>
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { inject } from '$lib/utils/context';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { AppThemeMode2Str, type AppThemeMode } from '$lib/settings/Theme';
	import { resetMode, setMode } from 'mode-watcher';
</script>

<script lang="ts">
	const currentSettings = inject(USER_SETTINGS);

	function handleThemeMode(mode: AppThemeMode) {
		$currentSettings.theme.mode = mode;
		if (mode === 'system') resetMode();
		else setMode(mode);
	}
	const { variant = 'outline' }: { variant?: 'default' | 'outline' } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button {variant}>模式</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56">
		<DropdownMenu.Group>
			<DropdownMenu.Label>主题模式</DropdownMenu.Label>
			<DropdownMenu.Separator />

			<DropdownMenu.RadioGroup bind:value={$currentSettings.theme.mode}>
				{#each Object.keys(AppThemeMode2Str) as mode}
					<DropdownMenu.RadioItem
						value={mode}
						onclick={() => handleThemeMode(mode as AppThemeMode)}
					>
						{AppThemeMode2Str[mode as AppThemeMode]}
					</DropdownMenu.RadioItem>
				{/each}
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

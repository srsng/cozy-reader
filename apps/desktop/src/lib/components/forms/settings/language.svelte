<script lang="ts" module>
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { inject } from '$lib/utils/context';
	import { setLocale } from '$lib/paraglide/runtime';
	import { langCode2Name, type AppLanguageCode } from '$lib/settings/Base';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { Button } from '$ui/button';
	import { m } from '$lib/paraglide/messages.js';
</script>

<script lang="ts">
	const currentSettings = inject(USER_SETTINGS);

	// 选择语言
	function handleLanguageChange(langCode: AppLanguageCode) {
		console.log('langCode', langCode);
		$currentSettings.base.langCode = langCode;
		setLocale(langCode);
	}

	const { variant = 'outline' }: { variant?: 'default' | 'outline' } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button {variant}>{m['settings.language']()}</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56">
		<DropdownMenu.Group>
			<DropdownMenu.Label>{m['settings.language']()}</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.RadioGroup bind:value={$currentSettings.base.langCode}>
				{#each Object.keys(langCode2Name) as langCode}
					<DropdownMenu.RadioItem
						value={langCode}
						onclick={() => handleLanguageChange(langCode as AppLanguageCode)}
					>
						{langCode2Name[langCode as AppLanguageCode]}
					</DropdownMenu.RadioItem>
				{/each}
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

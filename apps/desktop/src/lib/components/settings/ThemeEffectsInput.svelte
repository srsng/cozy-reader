<script lang="ts">
    import { toast } from 'svelte-sonner';
    import { Button } from '$ui/button';
    import type { UserSettings } from '$lib/settings';
    import type { AppThemeEffects } from '$lib/settings/Theme';
    import type { SettingEntry } from '$lib/settings-registry';
    import { runSettingHandler } from './setting-handlers';
    import type { Writable } from 'svelte/store';

    let {
        entry,
        settingsStore,
        settings,
        value,
        disabled = false
    }: {
        entry: SettingEntry;
        settingsStore: Writable<UserSettings>;
        settings: UserSettings;
        value: AppThemeEffects;
        disabled?: boolean;
    } = $props();

    const effects: { value: AppThemeEffects; label: string }[] = [
        { value: 'none', label: '无' },
        { value: 'acrylic', label: '亚克力' },
        { value: 'mica', label: '云母' },
        { value: 'blur', label: '模糊' }
    ];

    function selectEffect(effect: AppThemeEffects) {
        if (disabled) return;

        settingsStore.update((currentSettings) => {
            const nextSettings = structuredClone(currentSettings);
            nextSettings.theme.effects = effect;
            runSettingHandler('theme.effects.event', entry, effect, { settings: nextSettings });
            return nextSettings;
        });

        if (effect === 'blur') {
            toast.warning('警告', {
                description: '该效果在Win 10/11较新版本中表现较差，不建议对应系统用户使用'
            });
        }
    }
</script>

<div class="flex flex-wrap gap-2">
    {#each effects as effect}
        <Button
            size="sm"
            variant={value === effect.value ? 'default' : 'outline'}
            {disabled}
            onclick={() => selectEffect(effect.value)}
        >
            {effect.label}
        </Button>
    {/each}
</div>

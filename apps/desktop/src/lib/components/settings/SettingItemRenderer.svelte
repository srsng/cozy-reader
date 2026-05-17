<script lang="ts">
    import { Button } from '$ui/button';
    import { Input } from '$ui/input';
    import * as NativeSelect from '$ui/native-select';
    import { Switch } from '$ui/switch';
    import * as Tooltip from '$ui/tooltip';
    import { ButtonList } from '$ui/button-list';
    import { Info } from 'lucide-svelte';
    import SliderWithControls from '$lib/components/common/slider-with-controls.svelte';
    import type { UserSettings } from '$lib/settings';
    import type { SettingViewModel } from '$lib/settings-registry';
    import {
        formatSettingValue,
        normalizeSettingValue,
        setNestedValue
    } from '$lib/settings-registry';
    import { hasSettingHandler, runSettingHandler, getCurrentThemeMode } from './setting-handlers';
    import FontFamilyInput from './FontFamilyInput.svelte';
    import ThemeEffectsInput from './ThemeEffectsInput.svelte';
    import ZoomInput from './ZoomInput.svelte';
    import type { Writable } from 'svelte/store';
    import { COMMAND_SERVICE } from '$lib/commands';
    import { inject } from '$lib/utils/context';

    let {
        entry,
        settingsStore,
        settings,
        searchMode = false,
        highlighted = false
    }: {
        entry: SettingViewModel;
        settingsStore: Writable<UserSettings>;
        settings: UserSettings;
        searchMode?: boolean;
        highlighted?: boolean;
    } = $props();

    const commandService = inject(COMMAND_SERVICE);
    const isDisabled = $derived(searchMode && entry.disabled);
    const currentValue = $derived.by(() => {
        if (entry.id === 'theme.mode') return getCurrentThemeMode();
        return entry.value;
    });
    const description = $derived(
        entry.description && entry.format
            ? `${entry.description}: ${formatSettingValue(currentValue, entry.format)}`
            : entry.description
    );

    function updateSettings(mutator: (settings: UserSettings) => void) {
        settingsStore.update((currentSettings) => {
            const nextSettings = structuredClone(currentSettings);
            mutator(nextSettings);
            return nextSettings;
        });
    }

    function commit(value: unknown) {
        if (isDisabled) return;

        const normalizedValue = normalizeSettingValue(entry.schema, value);

        if (entry.key === 'base.alwaysOnTop') {
            if (typeof normalizedValue !== 'boolean') {
                console.error('Invalid always-on-top setting value:', normalizedValue);
                return;
            }

            void commandService.execute('window.setAlwaysOnTop', normalizedValue).catch((error) => {
                console.error('Failed to update always-on-top setting:', error);
            });
            return;
        }

        if (hasSettingHandler(entry.key)) {
            updateSettings((nextSettings) => {
                runSettingHandler(entry.key, entry, normalizedValue, { settings: nextSettings });
            });
            return;
        }

        updateSettings((nextSettings) => {
            setNestedValue(
                nextSettings as unknown as Record<string, unknown>,
                entry.key,
                normalizedValue
            );
        });
    }

    function optionRecord() {
        return Object.fromEntries(entry.options.map((option) => [option.value, option.label]));
    }
</script>

<div
    data-setting-id={entry.id}
    class={[
        'hover:bg-muted/80 flex w-full scroll-mt-24 items-center gap-2 rounded-lg p-4 transition-colors',
        highlighted ? 'ring-primary/50 bg-primary/10 ring-2' : '',
        isDisabled ? 'opacity-60' : ''
    ]}
>
    <div class="max-w-[40%] flex-shrink-0 space-y-1">
        <div class="flex items-center gap-2 text-sm font-medium">
            {entry.label}
            {#if isDisabled && entry.condition?.disabledReason}
                <Tooltip.Provider>
                    <Tooltip.Root>
                        <Tooltip.Trigger>
                            <Info class="text-muted-foreground size-3.5" />
                        </Tooltip.Trigger>
                        <Tooltip.Content>{entry.condition.disabledReason}</Tooltip.Content>
                    </Tooltip.Root>
                </Tooltip.Provider>
            {/if}
        </div>
        {#if description}
            <p class="text-muted-foreground text-sm">{description}</p>
        {/if}
    </div>
    <div class="ml-auto flex max-w-[60%] flex-1 items-center justify-end gap-2">
        {#if entry.type === 'switch'}
            <Switch
                checked={Boolean(currentValue)}
                disabled={isDisabled}
                onCheckedChange={commit}
            />
        {:else if entry.type === 'slider'}
            <SliderWithControls
                value={Number(currentValue)}
                defaultValue={Number(entry.defaultValue ?? currentValue ?? 0)}
                min={entry.min ?? 0}
                max={entry.max ?? 100}
                step={entry.step ?? 1}
                disabled={isDisabled}
                input={Boolean(entry.inlineInput)}
                formatValue={(value) => formatSettingValue(value, entry.format)}
                onValueChange={commit}
            />
        {:else if entry.type === 'input'}
            <Input
                value={String(currentValue ?? '')}
                type={entry.inputType ?? 'text'}
                placeholder={entry.placeholder}
                disabled={isDisabled}
                onchange={(event) => commit(event.currentTarget.value)}
            />
        {:else if entry.type === 'select'}
            <NativeSelect.Root
                value={String(currentValue ?? '')}
                disabled={isDisabled}
                onchange={(event) => commit(event.currentTarget.value)}
            >
                {#each entry.options as option}
                    <NativeSelect.NativeSelectOption value={option.value}>
                        {option.label}
                    </NativeSelect.NativeSelectOption>
                {/each}
            </NativeSelect.Root>
        {:else if entry.type === 'button-list'}
            <div class={isDisabled ? 'pointer-events-none' : ''}>
                <ButtonList Map2Str={optionRecord()} selected={currentValue} onclick={commit} />
            </div>
        {:else if entry.type === 'custom' && entry.component === 'fontFamily'}
            <FontFamilyInput
                value={String(currentValue ?? '')}
                defaultValue={String(entry.defaultValue ?? '')}
                placeholder={entry.placeholder}
                disabled={isDisabled}
                onSave={commit}
            />
        {:else if entry.type === 'custom' && entry.component === 'themeEffects'}
            <ThemeEffectsInput value={currentValue as never} disabled={isDisabled} />
        {:else if entry.type === 'custom' && entry.component === 'zoom'}
            <ZoomInput {settings} disabled={isDisabled} />
        {:else}
            <Button variant="outline" disabled>尚未支持</Button>
        {/if}
    </div>
</div>

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
    import type { SettingEntry } from '$lib/settings-registry';
    import {
        formatSettingValue,
        isSearchDisabled,
        resolveNestedValue,
        setNestedValue
    } from '$lib/settings-registry';
    import { runSettingHandler, getCurrentThemeMode } from './setting-handlers';
    import FontFamilyInput from './FontFamilyInput.svelte';
    import ThemeEffectsInput from './ThemeEffectsInput.svelte';
    import ZoomInput from './ZoomInput.svelte';
    import type { Writable } from 'svelte/store';

    let {
        entry,
        settingsStore,
        settings,
        searchMode = false,
        highlighted = false
    }: {
        entry: SettingEntry;
        settingsStore: Writable<UserSettings>;
        settings: UserSettings;
        searchMode?: boolean;
        highlighted?: boolean;
    } = $props();

    const isDisabled = $derived(searchMode && isSearchDisabled(entry, settings));
    const currentValue = $derived.by(() => {
        if (entry.id === 'theme.mode') return getCurrentThemeMode();
        return resolveNestedValue(settings, entry.path);
    });
    const description = $derived(
        entry.description && entry.props?.format
            ? `${entry.description}: ${formatSettingValue(currentValue, entry.props.format)}`
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

        const action = entry.onChangeAction ?? { kind: 'store' as const };

        if (action.kind === 'handler') {
            updateSettings((nextSettings) => {
                runSettingHandler(action.name, entry, value, { settings: nextSettings });
            });
            return;
        }

        if (action.kind === 'store') {
            updateSettings((nextSettings) => {
                setNestedValue(nextSettings as unknown as Record<string, unknown>, entry.path, value);
            });
        }
    }

    function optionRecord() {
        return Object.fromEntries((entry.props?.options ?? []).map((option) => [option.value, option.label]));
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
            <Switch checked={Boolean(currentValue)} disabled={isDisabled} onCheckedChange={commit} />
        {:else if entry.type === 'slider'}
            <SliderWithControls
                value={Number(currentValue)}
                defaultValue={Number(entry.defaultValue ?? currentValue ?? 0)}
                min={entry.props?.min ?? 0}
                max={entry.props?.max ?? 100}
                step={entry.props?.step ?? 1}
                disabled={isDisabled}
                input={Boolean(entry.props?.inlineInput)}
                formatValue={(value) => formatSettingValue(value, entry.props?.format)}
                onValueChange={commit}
            />
        {:else if entry.type === 'input'}
            <Input
                value={String(currentValue ?? '')}
                type={entry.props?.inputType ?? 'text'}
                placeholder={entry.props?.placeholder}
                disabled={isDisabled}
                onchange={(event) => commit(event.currentTarget.value)}
            />
        {:else if entry.type === 'select'}
            <NativeSelect.Root
                value={String(currentValue ?? '')}
                disabled={isDisabled}
                onchange={(event) => commit(event.currentTarget.value)}
            >
                {#each entry.props?.options ?? [] as option}
                    <NativeSelect.NativeSelectOption value={option.value}>
                        {option.label}
                    </NativeSelect.NativeSelectOption>
                {/each}
            </NativeSelect.Root>
        {:else if entry.type === 'button-list'}
            <div class={isDisabled ? 'pointer-events-none' : ''}>
                <ButtonList Map2Str={optionRecord()} selected={currentValue} onclick={commit} />
            </div>
        {:else if entry.type === 'custom' && entry.props?.component === 'fontFamily'}
            <FontFamilyInput
                value={String(currentValue ?? '')}
                defaultValue={String(entry.defaultValue ?? '')}
                placeholder={entry.props?.placeholder}
                disabled={isDisabled}
                onSave={commit}
            />
        {:else if entry.type === 'custom' && entry.props?.component === 'themeEffects'}
            <ThemeEffectsInput
                {entry}
                {settings}
                {settingsStore}
                value={currentValue as never}
                disabled={isDisabled}
            />
        {:else if entry.type === 'custom' && entry.props?.component === 'zoom'}
            <ZoomInput {entry} {settings} disabled={isDisabled} />
        {:else}
            <Button variant="outline" disabled>尚未支持</Button>
        {/if}
    </div>
</div>

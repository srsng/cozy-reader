<script lang="ts">
    import { toast } from 'svelte-sonner';
    import { Button } from '$ui/button';
    import type { AppThemeEffects } from '$lib/settings/Theme';
    import { COMMAND_SERVICE } from '$lib/commands';
    import { APP_STATE } from '$lib/stores/appState';
    import { inject } from '$lib/utils/context';

    let {
        value,
        disabled = false
    }: {
        value: AppThemeEffects;
        disabled?: boolean;
    } = $props();

    const commandService = inject(COMMAND_SERVICE);
    const appState = inject(APP_STATE);

    const effects: { value: AppThemeEffects; label: string }[] = [
        { value: 'none', label: '无' },
        { value: 'acrylic', label: '亚克力' },
        { value: 'mica', label: '云母' },
        { value: 'blur', label: '模糊' }
    ];

    function canSelectEffect(effect: AppThemeEffects): boolean {
        $appState.theme.effectAvailability;
        return !disabled && commandService.canExecute('theme.effects.set', effect);
    }

    async function selectEffect(effect: AppThemeEffects) {
        if (!canSelectEffect(effect)) {
            toast.warning('窗口效果不可用', {
                description: '当前平台或系统版本不支持该窗口效果'
            });
            return;
        }

        const executed = await commandService.execute('theme.effects.set', effect);
        if (!executed) {
            toast.warning('窗口效果不可用', {
                description: '当前平台或系统版本不支持该窗口效果'
            });
            return;
        }

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
            disabled={!canSelectEffect(effect.value)}
            onclick={() => selectEffect(effect.value)}
        >
            {effect.label}
        </Button>
    {/each}
</div>

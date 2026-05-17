<script lang="ts" module>
    import { onMount } from 'svelte';
    import { keybindingManager } from '$lib/keybindings/keybindingManager';
    import { parseUserKeybindingRules } from '$lib/keybindings/userKeybindings';
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { inject } from '$lib/utils/context';
</script>

<script lang="ts">
    const userSettings = inject(USER_SETTINGS);

    $effect(() => {
        const rules = parseUserKeybindingRules($userSettings.keybindings?.rules);
        const disposable = keybindingManager.applyUserKeybindingRules(rules);

        return () => disposable.dispose();
    });

    // 初始化按键绑定
    onMount(() => {
        keybindingManager.init();
        return () => keybindingManager.stopListening();
    });
</script>

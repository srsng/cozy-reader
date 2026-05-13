<script lang="ts" module>
    import { onMount } from 'svelte';
    import { registerDefaultKeybindings } from '$lib/keybindings/defaultKeybindings';
    import { keybindingManager } from '$lib/keybindings/keybindingManager';
</script>

<script lang="ts">
    // 初始化按键绑定
    onMount(() => {
        registerDefaultKeybindings();
        keybindingManager.init();
    });
</script>

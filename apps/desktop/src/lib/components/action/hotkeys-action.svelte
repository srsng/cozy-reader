<script lang="ts" module>
    import { onMount } from 'svelte';
    import { registerDefaultShortcuts } from '$lib/shortcuts/defaultShortcuts';
    import { simpleShortcutManager } from '$lib/shortcuts/shortcutManager';
</script>

<script lang="ts">
    // 初始化快捷键
    onMount(() => {
        // 注册默认快捷键
        registerDefaultShortcuts();
        // 启动快捷键监听器
        simpleShortcutManager.init();
    });
</script>

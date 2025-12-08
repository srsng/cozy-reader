<script lang="ts">
    import { inject } from '$lib/utils/context';
    import { USER_SETTINGS } from '$lib/stores/userSettings';

    const userSettings = inject(USER_SETTINGS);

    // 在:root上设置--ui-opacity变量，统一管理UI不透明度
    // 类似BackgroundAction的模式，所有CSS变量在:root上管理
    // @theme中的color-mix()函数会自动响应--ui-opacity的变化
    $effect(() => {
        document.documentElement.style.setProperty(
            '--ui-opacity',
            $userSettings.base.uiOpacity.toString()
        );
    });

    // 在:root上设置--body-opacity变量，统一管理body背景不透明度
    // 独立于UI不透明度控制
    $effect(() => {
        document.documentElement.style.setProperty(
            '--body-opacity',
            $userSettings.base.bodyTransparent.toString()
        );
    });
</script>

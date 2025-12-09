<script lang="ts">
    interface Props {
        width?: string;
    }

    const { width = 'w-8 sm:w-6' }: Props = $props();

    // TODO: 从主题 store 获取 safeAreaInsets
    const safeAreaInsets = $state({ top: 0 });
</script>

<div
    class="ribbon absolute inset-0 z-10 flex {width} justify-center"
    style="height: ${(safeAreaInsets?.top || 0) + 44}px;"
>
    <svg
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        shape-rendering="geometricPrecision"
        image-rendering="optimizeQuality"
    >
        <polygon fill="#F44336" points="100 100, 50 78, 0 100, 0 0, 100 0" />
    </svg>
</div>

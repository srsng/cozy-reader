<script lang="ts">
    import { page } from '$app/state';
    import { goReaderHome } from '$lib/utils/route.svelte';
    import { View } from '$lib/components/layout/views';

    const error = $derived(page.error);
    const errorMessage = $derived(error?.message || '未知错误');
</script>

<svelte:head>
    <title>错误 - Cozy Reader</title>
</svelte:head>

<View.Error
    title="错误"
    message={errorMessage}
    footerBtnText="返回书架"
    footerBtnOnclick={goReaderHome}
/>

<script lang="ts">
    import { convertFileSrc } from '@tauri-apps/api/core';
    import { resolveMarkdownImageSource, shouldUseTauriAssetProtocol } from './image-utils';

    interface Props {
        href?: string;
        title?: string;
        text?: string;
        mdSrcPath?: string;
    }

    const { href = '', title = undefined, text = '', mdSrcPath = '' }: Props = $props();

    const imgSrc = $derived.by(() => {
        const src = resolveMarkdownImageSource(href, mdSrcPath);

        return shouldUseTauriAssetProtocol(src) ? convertFileSrc(src) : src;
    });
</script>

<img src={imgSrc} {title} alt={text} class="items-center justify-between" loading="lazy" />

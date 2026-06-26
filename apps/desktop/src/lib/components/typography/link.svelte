<script lang="ts" module>
    import { mergeProps } from 'bits-ui';
    import { writeClipboard } from '$lib/backend/clipboard';
    import { cn } from '$lib/utils.js';
    import * as Tooltip from '$ui/tooltip';
    import { Link as LinkIcon } from 'lucide-svelte';
    import type { Snippet } from 'svelte';
    import type { HTMLAnchorAttributes } from 'svelte/elements';

    function handleClick(e: MouseEvent, href: string) {
        e.stopPropagation();

        if (!e.ctrlKey) {
            writeClipboard(href, {
                message: '链接已复制',
                // description: '按住 Ctrl 键点击链接以跳转'
            });
            e.preventDefault();
        }
    }

    type Props = {
        href: string;
        children: Snippet;
        raw?: string;
        text?: string;
        tokens?: unknown;
        mdSrcPath?: string;
    } & HTMLAnchorAttributes;
</script>

<script lang="ts">
    let {
        href,
        children,
        class: className,
        raw: _raw,
        text: _text,
        tokens: _tokens,
        mdSrcPath: _mdSrcPath,
        ...restProps
    }: Props = $props();

    const anchorProps = $derived({
        href,
        target: '_blank',
        rel: 'noopener noreferrer',
        class: cn(
            'text-primary underline-offset-4 hover:underline',
            className
        ),
        onclick: (e: MouseEvent) => handleClick(e, href),
        ...restProps
    });
</script>

<Tooltip.Provider>
    <Tooltip.Root>
        <Tooltip.Trigger>
            {#snippet child({ props })}
                {@const { type: _type, ...tooltipProps } = props}
                <a {...mergeProps(anchorProps, tooltipProps)}>
                    <LinkIcon
                        aria-hidden="true"
                        class="text-secondary pointer-events-none inline-block size-3.5 align-[-0.125em]"
                    />
                    {@render children()}
                </a>
            {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content>
            <p>{href}</p>
        </Tooltip.Content>
    </Tooltip.Root>
</Tooltip.Provider>

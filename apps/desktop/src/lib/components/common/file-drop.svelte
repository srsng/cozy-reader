<script lang="ts" module>
    import { webview } from '@tauri-apps/api';
    import { onDestroy } from 'svelte';
    import type { Snippet } from 'svelte';
    import type { Event } from '@tauri-apps/api/event';
    import { fade } from 'svelte/transition';
    import { Upload } from 'lucide-svelte';

    interface childProps {
        isDragOver: boolean;
        files: string[];
        invalidFiles: string[];
    }

    // 类型定义
    interface Props {
        /**
         * 允许的文件扩展名列表。不符合条件的文件将被过滤掉。
         * 如果为null（默认值），则允许所有文件扩展名。
         */
        extensions?: string[] | null;
        /** 处理一个或多个文件的拖放事件 */
        handleFiles?: (files: string[]) => void;
        /** 处理拓展名不符合条件的文件, 只有非法文件多于0个时才会调用 */
        handleInvalidFiles?: (files: string[]) => void;
        /**
         * 处理单个文件的拖放事件。
         * 注意：无论如何，handleFiles()也会被调用。
         * 如果有任何不符合条件的文件被过滤掉，则不会调用此函数。
         */
        handleOneFile?: (file: string) => void;
        /** 子内容渲染函数，接收当前拖拽的文件列表 */
        children: Snippet<[childProps]>;
        /** 启用overlay，若启用且没有传入overlayBody，则使用默认overlay */
        overlay?: boolean;
        /** overlayBody渲染函数, 优化交互
         *
         * 不需要使用isDragOver判断是否要渲染，内部已经做了
         */
        overlayBody?: Snippet<[childProps]>;
        /** CSS类名 */
        class?: string;
    }
</script>

<script lang="ts">
    // 组件属性
    const {
        extensions = null,
        handleFiles = () => {},
        handleInvalidFiles = () => {},
        handleOneFile = () => {},
        children,
        overlay,
        overlayBody,
        ...others
    }: Props = $props();

    // overlay渲染函数
    const theOverlay = overlayBody ? overlayBody : _overlayBody;

    // 内部状态
    let dropzone = $state<HTMLDivElement>();
    let files = $state<string[]>([]);
    let invalidFiles = $state<string[]>([]);
    let isDragOver = $state(false);

    /**
     * 根据允许的扩展名过滤文件路径
     */
    function getValidPaths(paths: string[]): string[] {
        if (!extensions) return paths;

        return paths.filter((path) =>
            extensions.some((ext) => path.toLowerCase().endsWith(`.${ext.toLowerCase()}`))
        );
    }

    /**
     * 根据不允许的扩展名过滤文件路径
     *
     * 允许的拓展名为空时，返回空列表
     */
    function getInvalidPaths(paths: string[]): string[] {
        if (!extensions) return [];

        return paths.filter((path) => {
            const p = path.toLowerCase();
            return extensions.every((ext) => !p.endsWith(`.${ext.toLowerCase()}`));
        });
    }

    /**
     * 处理文件拖放事件
     */
    function handleDragEvent(event: Event<webview.DragDropEvent>) {
        switch (event.payload.type) {
            case 'enter':
                files = getValidPaths(event.payload.paths);
                invalidFiles = getInvalidPaths(event.payload.paths);
                break;

            case 'drop':
                const validFiles = getValidPaths(event.payload.paths);
                if (validFiles.length > 0) {
                    handleFiles(validFiles);
                    if (event.payload.paths.length === 1 && validFiles.length === 1) {
                        handleOneFile(validFiles[0]);
                    }
                }
                if (invalidFiles.length > 0) {
                    handleInvalidFiles(invalidFiles);
                }

                files = [];
                invalidFiles = [];
                isDragOver = false;
                break;

            case 'leave':
                files = [];
                invalidFiles = [];
                isDragOver = false;
                break;

            case 'over':
                const position = event.payload.position;
                if (position && dropzone) {
                    const hoveredElement = document.elementFromPoint(position.x, position.y);
                    isDragOver = dropzone.contains(hoveredElement);
                }
                break;
        }
    }

    // 初始化拖放监听
    const current_webview = webview.getCurrentWebview();
    const dragDropUnsubscribe = current_webview.onDragDropEvent(async (event) => {
        handleDragEvent(event);
    });

    // 清理资源
    onDestroy(async () => {
        (await dragDropUnsubscribe)();
    });
</script>

{#snippet _overlayBody({ isDragOver, files, invalidFiles }: childProps)}
    <div
        class="bg-secondary/80 fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md"
        transition:fade={{ duration: 200 }}
    >
        <div class="text-center">
            <Upload class="text-primary mx-auto mb-6 h-24 w-24" />
            <h2 class="text-primary mb-4 text-2xl font-bold">拖放文件到这里以添加</h2>
        </div>
    </div>
{/snippet}

<div bind:this={dropzone} {...others}>
    {@render children({
        isDragOver,
        files: isDragOver ? files : [],
        invalidFiles: isDragOver ? invalidFiles : []
    })}
    {#if overlay && isDragOver}
        {@render theOverlay?.({
            isDragOver,
            files: isDragOver ? files : [],
            invalidFiles: isDragOver ? invalidFiles : []
        })}
    {/if}
</div>

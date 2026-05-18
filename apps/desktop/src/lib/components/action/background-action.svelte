<script lang="ts" module>
    import { inject } from '$lib/utils/context';
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { onDestroy, onMount } from 'svelte';
    import type {
        BackgroundImage,
        GlobalBackgroundConfig,
        BackgroundFilters,
        BackgroundPosition
    } from '$lib/settings/background';
    import { getImageFullConfig, getOpacityForTheme } from '$lib/settings/background';
    import { convertFileSrc } from '@tauri-apps/api/core';
    import { mode } from 'mode-watcher';

    // 图片 URL 转换
    export function convertToTauriUrl(filePath: string): string {
        if (!filePath) return '';
        return convertFileSrc(filePath);
    }

    // 生成背景样式对象
    export function generateBackgroundStyles(
        image: BackgroundImage | null,
        globalConfig: GlobalBackgroundConfig
    ): Record<string, string> {
        if (!image) {
            return {
                '--settings-bg-image': 'none',
                '--settings-bg-opacity': '0',
                '--settings-bg-size': 'cover',
                '--settings-bg-position': 'center',
                '--settings-bg-blend-mode': 'normal',
                '--settings-bg-filters': 'none',
                '--settings-bg-background-overlay-enabled': 'hidden',
                '--settings-bg-background-overlay-color': 'transparent',
                '--settings-bg-background-overlay-opacity': '0'
            };
        }

        const imageUrl = convertToTauriUrl(image.filePath);

        // 获取当前主题模式
        const currentTheme = mode.current === 'dark' ? 'dark' : 'light';

        // 使用getImageFullConfig获取完整配置，传入当前主题
        const config = getImageFullConfig(image, globalConfig, currentTheme);
        const {
            opacity,
            displayMode,
            position,
            blendMode,
            filters,
            scale,
            rotation,
            offsetX,
            offsetY
        } = config;

        // 转换显示模式为 CSS background-size 值
        const backgroundSize = convertDisplayModeToCSS(displayMode);

        // 转换位置为 CSS background-position 值
        const backgroundPosition = convertPositionToCSS(position);

        // 生成滤镜字符串
        const filtersString = filters ? generateFiltersString(filters) : 'none';
        const backgroundOverlayFiltersString = generateFiltersString(
            globalConfig.backgroundOverlay.filters
        );

        return {
            '--settings-bg-image': `url("${imageUrl}")`,
            '--settings-bg-opacity': opacity.toString(),
            '--settings-bg-size': backgroundSize,
            '--settings-bg-position': backgroundPosition,
            '--settings-bg-blend-mode': blendMode,
            '--settings-bg-filters': filtersString,
            '--settings-bg-scale': scale.toString(),
            '--settings-bg-rotation': `${rotation}deg`,
            '--settings-bg-offset-x': `${offsetX}px`,
            '--settings-bg-offset-y': `${offsetY}px`,
            '--settings-bg-background-overlay-enabled': globalConfig.backgroundOverlay.enabled
                ? 'visible'
                : 'hidden',
            '--settings-bg-background-overlay-color': globalConfig.backgroundOverlay.color,
            '--settings-bg-background-overlay-opacity': getOpacityForTheme(
                globalConfig.backgroundOverlay.opacity,
                currentTheme
            ).toString(),
            '--settings-bg-background-overlay-filters': backgroundOverlayFiltersString,
            '--settings-bg-animation-duration': `${globalConfig.animationDuration}ms`
        };
    }

    // 生成前景/上层遮罩层样式对象
    export function generateTopOverlayStyles(
        globalConfig: GlobalBackgroundConfig
    ): Record<string, string> {
        const currentTheme = mode.current === 'dark' ? 'dark' : 'light';

        return {
            '--settings-bg-top-overlay-enabled': globalConfig.topOverlay.enabled
                ? 'visible'
                : 'hidden',
            '--settings-bg-top-overlay-color': globalConfig.topOverlay.color,
            '--settings-bg-top-overlay-opacity': getOpacityForTheme(
                globalConfig.topOverlay.opacity,
                currentTheme
            ).toString(),
            '--settings-bg-top-overlay-filters': generateFiltersString(
                globalConfig.topOverlay.filters
            )
        };
    }

    // 转换显示模式为 CSS 值
    function convertDisplayModeToCSS(displayMode: string): string {
        switch (displayMode) {
            case 'cover':
                return 'cover';
            case 'contain':
                return 'contain';
            case 'stretch':
                return '100% 100%';
            case 'tile':
                return 'auto';
            case 'center':
                return 'auto';
            default:
                return 'cover';
        }
    }

    // 转换位置为 CSS 值
    function convertPositionToCSS(position: BackgroundPosition): string {
        switch (position) {
            case 'top-left':
                return 'left top';
            case 'top-center':
                return 'center top';
            case 'top-right':
                return 'right top';
            case 'center-left':
                return 'left center';
            case 'center':
                return 'center center';
            case 'center-right':
                return 'right center';
            case 'bottom-left':
                return 'left bottom';
            case 'bottom-center':
                return 'center bottom';
            case 'bottom-right':
                return 'right bottom';
            default:
                return 'center center';
        }
    }

    // 生成滤镜字符串
    function generateFiltersString(filters: BackgroundFilters): string {
        const filterParts: string[] = [];

        if (filters.brightness !== undefined && filters.brightness !== 1) {
            filterParts.push(`brightness(${filters.brightness})`);
        }
        if (filters.contrast !== undefined && filters.contrast !== 1) {
            filterParts.push(`contrast(${filters.contrast})`);
        }
        if (filters.saturate !== undefined && filters.saturate !== 1) {
            filterParts.push(`saturate(${filters.saturate})`);
        }
        if (filters.blur !== undefined && filters.blur > 0) {
            filterParts.push(`blur(${filters.blur}px)`);
        }
        if (filters.grayscale !== undefined && filters.grayscale > 0) {
            filterParts.push(`grayscale(${filters.grayscale})`);
        }
        if (filters.hueRotate !== undefined && filters.hueRotate !== 0) {
            filterParts.push(`hue-rotate(${filters.hueRotate}deg)`);
        }
        if (filters.invert !== undefined && filters.invert > 0) {
            filterParts.push(`invert(${filters.invert})`);
        }

        return filterParts.length > 0 ? filterParts.join(' ') : 'none';
    }

    // 应用背景样式到元素
    export function applyBackgroundStyles(
        element: HTMLElement | null,
        styles: Record<string, string>
    ): void {
        if (!element || !element.style) return;
        Object.entries(styles).forEach(([property, value]) => {
            if (element && element.style) {
                element.style.setProperty(property, value);
            }
        });
    }

    // 移除背景样式
    export function removeBackgroundStyles(element: HTMLElement | null): void {
        if (!element || !element.style) return;
        const properties = [
            '--settings-bg-image',
            '--settings-bg-opacity',
            '--settings-bg-size',
            '--settings-bg-position',
            '--settings-bg-blend-mode',
            '--settings-bg-filters',
            '--settings-bg-scale',
            '--settings-bg-rotation',
            '--settings-bg-offset-x',
            '--settings-bg-offset-y',
            '--settings-bg-background-overlay-enabled',
            '--settings-bg-background-overlay-color',
            '--settings-bg-background-overlay-opacity',
            '--settings-bg-background-overlay-filters',
            '--settings-bg-animation-duration'
        ];

        removeStyleProperties(element, properties);
    }

    export function removeStyleProperties(
        element: HTMLElement | null,
        properties: string[]
    ): void {
        if (!element || !element.style) return;
        properties.forEach((property) => {
            element.style.removeProperty(property);
        });
    }
</script>

<script lang="ts">
    const userSettings = inject(USER_SETTINGS);

    // 背景相关状态
    // svelte-ignore non_reactive_update
    let backgroundContainerElement: HTMLDivElement | null = null;

    // 获取当前激活的背景图片
    const activeImage = $derived(
        $userSettings.background.images.find(
            (img) => img.id === $userSettings.background.activeImageId
        )
    );

    // 应用背景样式到独立背景容器
    function applyBackgroundToContainer() {
        if (!backgroundContainerElement) return;

        if (activeImage) {
            const styles = generateBackgroundStyles(activeImage, $userSettings.background.global);
            applyBackgroundStyles(backgroundContainerElement, styles);
        } else {
            removeBackgroundStyles(backgroundContainerElement);
        }
    }

    function applyTopOverlayToRoot() {
        if (typeof document === 'undefined') return;
        applyBackgroundStyles(
            document.documentElement,
            generateTopOverlayStyles($userSettings.background.global)
        );
    }

    function removeTopOverlayFromRoot() {
        if (typeof document === 'undefined') return;
        removeStyleProperties(document.documentElement, [
            '--settings-bg-top-overlay-enabled',
            '--settings-bg-top-overlay-color',
            '--settings-bg-top-overlay-opacity',
            '--settings-bg-top-overlay-filters'
        ]);
    }

    // 监听背景设置变化和主题变化
    $effect(() => {
        // 当背景设置发生变化或主题变化时重新应用样式
        // 通过访问mode.current来建立对主题变化的响应性
        mode.current;
        applyTopOverlayToRoot();
        if (activeImage || $userSettings.background.activeImageId === null) {
            applyBackgroundToContainer();
        }
    });

    onMount(() => {
        // 初始化背景
        applyTopOverlayToRoot();
        applyBackgroundToContainer();
    });

    onDestroy(() => {
        removeTopOverlayFromRoot();
    });
</script>

<!-- 独立背景容器 -->
<div class="background-container" bind:this={backgroundContainerElement}></div>

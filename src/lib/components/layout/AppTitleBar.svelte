<script>
	import {
		Minus,
		X,
		RefreshCcw,
		Pin,
		Move,
		Maximize2,
		House,
		Settings,
		ZoomIn
	} from 'lucide-svelte';
	import { saveAppWindowState } from '$lib/stores/WindowState';
	import { goHome, goSettings } from '$lib/utils/route.svelte';
	import { Button } from '$lib/components/ui/button';
	import Label from '$lib/components/ui/label/label.svelte';
	// import * as ContextMenu from '$lib/components/ui/context-menu';
	import AppIcon from '../app-icon.svelte';
	import { writeToClipBoard } from '$lib/utils/clip';
	import { emit } from '@tauri-apps/api/event';
	import { SHORTCUT_ENENT } from '$lib/shortcuts/shortcutService';

	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { inject } from '$lib/utils/context';
	import * as Popover from '../ui/popover';
	import { ZoomForm, ThemeModeToggle } from '../forms';
	import { m } from '$lib/paraglide/messages';
	import { emitMainWindowEvent } from '$lib/components/action/window-action.svelte';

	const currentSettings = inject(USER_SETTINGS);

	let appTitle = 'Cozy Reader';

	function switchAlwaysOnTop() {
		emit(SHORTCUT_ENENT, 'main-window-toggle-always-on-top');
	}

	function refreshPage() {
		saveAppWindowState();
		window.location.reload();
	}
</script>

<div
	data-tauri-drag-region
	id="titlebar"
	class="bg-card border-muted fixed left-0 right-0 top-0 flex h-8 w-full select-none items-center justify-between border-b"
>
	<!-- 左侧部分 -->
	<div class="left-section ml-2 flex items-center gap-1">
		<Button
			id="titlebar-home"
			title={m['settings.go home']()}
			variant="outline"
			size="icon"
			class="size-6"
			onclick={goHome}
		>
			<House class="size-4" />
		</Button>
		<Button
			id="titlebar-settings"
			title={m['settings.go settings']()}
			variant="outline"
			size="icon"
			class="size-6"
			onclick={goSettings}
		>
			<Settings />
		</Button>
		<Button
			id="titlebar-fresh"
			title="刷新页面"
			variant="outline"
			size="icon"
			class="size-6"
			onclick={refreshPage}
		>
			<RefreshCcw class="size-4" />
		</Button>

		<Popover.Root>
			<Popover.Trigger>
				<Button
					id="titlebar-zoom-action"
					title={m['settings.zoom']()}
					variant="outline"
					size="icon"
					class="size-6"
				>
					<ZoomIn class="size-4" />
				</Button></Popover.Trigger
			>
			<Popover.Content class="w-fit"><ZoomForm /></Popover.Content>
		</Popover.Root>
	</div>

	<!-- 中间部分 - 标题 -->
	<div
		data-tauri-drag-region
		class="center-section flex flex-1 items-center justify-center overflow-hidden"
	>
		<Button
			id="titlebar-appicon"
			size="icon"
			variant="outline"
			class="size-6"
			onclick={() => writeToClipBoard(appTitle)}
		>
			<AppIcon class="size-5 select-none" />
		</Button>
		<div data-tauri-drag-region class="app-title truncate px-4">
			<Label data-tauri-drag-region class="text-foreground font-bold">{appTitle}</Label>
		</div>
	</div>

	<!-- 右侧部分 -->
	<div class="right-section mr-2 flex items-center gap-1">
		<ThemeModeToggle
			btnProps={{ id: 'titlebar-theme-mode-toggle', title: '切换主题模式', class: 'size-6' }}
			iconProps={{ class: 'size-4' }}
		/>
		<Button
			id="titlebar-always-on-top"
			title="始终置顶"
			variant="outline"
			size="icon"
			class="size-6"
			onclick={switchAlwaysOnTop}
		>
			<Pin
				class="size-4 transition-transform {$currentSettings.base.alwaysOnTop ? 'rotate-45' : ''}"
			/>
		</Button>
		<Button
			id="titlebar-drag-move"
			title="按住以拖拽移动"
			variant="outline"
			size="icon"
			class="size-6"
			data-tauri-drag-region
		>
			<Move class="size-4" data-tauri-drag-region />
		</Button>
		<Button
			id="titlebar-minimize"
			title="最小化"
			variant="outline"
			size="icon"
			class="size-6"
			onclick={() => emitMainWindowEvent('minimize')}
		>
			<Minus class="size-4" />
		</Button>
		<Button
			id="titlebar-maximize"
			title="最大化"
			variant="outline"
			size="icon"
			class="size-6"
			onclick={() => emitMainWindowEvent('maximize')}
		>
			<Maximize2 class="size-4" />
		</Button>
		<Button
			id="titlebar-close"
			title="关闭"
			variant="outline"
			size="icon"
			class="hover:bg-destructive hover:text-destructive-foreground size-6"
			onclick={() => emitMainWindowEvent('close')}
		>
			<X class="size-4" />
		</Button>
	</div>
</div>

<style>
	/* 响应式设计 */
	@media (max-width: 640px) {
		#titlebar {
			height: 2rem; /* 32px - 保持移动端高度一致 */
		}
	}
</style>

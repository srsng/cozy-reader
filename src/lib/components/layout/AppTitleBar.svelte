<script>
	import { Window } from '@tauri-apps/api/window';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { Minus, Plus, X, RefreshCcw, Pin, Move, Maximize2, House } from 'lucide-svelte';
	// import { cycleTheme } from "@/theme/theme.js";
	// import {
	//   IconWindowMin,
	//   IconWindowMax,
	//   IconWindowClose,
	//   IconThemeChange,
	//   IconAddBook,
	//   IconHome,
	//   IconPin,
	//   IconRefresh,
	//   IconDragMove,
	// } from "@/components/icons";
	// import BookAdder from "@/components/common/BookAdder.vue";
	// import PopupThemeSelecter from "@/components/popups/PopupThemeSelecter.vue";
	// import { mapMutations, mapState } from "vuex";
	import { saveAppWindowState } from '$lib/stores/WindowState';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let appTitle = 'Cozy Reader';

	// props: {
	//   appTitle: {
	//     type: String,
	//     default: "Cozy Reader",
	//     required: true,
	//   },
	// },
	// watch: {
	//   $route(to) {
	//     if (to.name === "Home") {
	//       this.appTitle = "Cozy Reader";
	//     }
	//   },
	//   curBookTitle(bookTitle) {
	//     this.appTitle = bookTitle;
	//   },
	//   async alwaysOnTop(val) {
	//     console.log("switch alwaysOnTop", val);
	//     await getCurrentWindow().setAlwaysOnTop(val);
	//   }
	// }

	let alwaysOnTop;

	// ...mapMutations(['setUploadBooksStatus', 'switchAlwaysOnTop']),
	function goHome() {
		// this.$router.push({ name: "Home" });
	}
	function switchAlwaysOnTop() {}
	// triggerUpload() {
	//   if (this.$route.name === "Home") {
	//     document.getElementById("book-adder").click();
	//   }
	// },
	// function handleFileChange(event) {
	//   // this.setUploadBooksStatus({ uploading: true, solving: false, event: event, });
	// }
	function refreshPage() {
		saveAppWindowState();
		// this.$router.go(0);
	}
	// cycleTheme,
	// function toggleThemeSelecterPopup() {
	//   this.showThemeSelecterPopup = !this.showThemeSelecterPopup;
	// }

	onMount(() => {
		// 绑定最小化、最大化、关闭按钮功能
		const appWindow = new Window('main');
		document
			.getElementById('titlebar-minimize')
			?.addEventListener('click', () => appWindow.minimize());
		document
			.getElementById('titlebar-maximize')
			?.addEventListener('click', () => appWindow.toggleMaximize());
		document.getElementById('titlebar-close')?.addEventListener('click', () => appWindow.close());
	});
</script>

<div
	data-tauri-drag-region
	class="titlebar header no-print fixed left-0 right-0 top-0 z-[6000] flex w-full select-none items-center justify-between"
>
	<!-- 左侧部分 -->
	<div class="left-section ml-0.5 flex items-center">
		<div id="titlebar-home" title="go home" class="titlebar-button" onclick={goHome}>
			<House />
		</div>
		<div id="titlebar-changeTheme" title="change Theme" class="titlebar-button">
			<!-- <IconThemeChange /> -->
			<!-- <PopupThemeSelecter
          v-show="showThemeSelecterPopup"
          class="top-10 left-2"
        /> -->
		</div>
		<div id="titlebar-fresh" title="refresh" class="titlebar-button" onclick={refreshPage}>
			<RefreshCcw />
		</div>
	</div>

	<!-- 中间部分 -->
	<div
		data-tauri-drag-region
		class="center-section flex flex-grow items-center justify-center overflow-hidden"
	>
		<div id="app-title" class="center-content truncate">
			<!-- title maybe too long to let right buttons show in right case -->
			<p>{appTitle}</p>
		</div>
	</div>

	<!-- 右侧部分 -->
	<div class="right-section mr-0.5 flex items-center">
		<div
			id="titlebar-always-on-top"
			title="always on top"
			class="titlebar-button"
			onclick={switchAlwaysOnTop}
		>
			<div class:rotate-45={alwaysOnTop}>
				<Pin />
			</div>
		</div>
		<div
			id="titlebar-drag-move"
			title="drag to move"
			class="titlebar-button"
			data-tauri-drag-region
		>
			<Move data-tauri-drag-region />
		</div>
		<div id="titlebar-minimize" title="minmize" class="titlebar-button">
			<Minus />
		</div>
		<div id="titlebar-maximize" title="maximize" class="titlebar-button">
			<Maximize2 />
		</div>
		<div id="titlebar-close" title="close" class="titlebar-button">
			<X />
		</div>
	</div>
</div>

<style>
	@import 'tailwindcss';

	.rotate-45 {
		transform: rotate(-45deg);
	}
</style>

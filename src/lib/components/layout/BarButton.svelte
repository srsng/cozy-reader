<script lang="ts" module>
	import type { ButtonConfig } from '$lib/settings/Layout';
	import { cn } from '$lib/utils';
	import type { Component } from 'svelte';
	import UtilButton from './util-btn';
</script>

<script lang="ts">
	const {
		appTitle,
		config,
		className = 'size-6',
		btnDisabled = false,
		iconClass = 'size-4'
	}: {
		appTitle: string;
		config: ButtonConfig;
		className?: string;
		btnDisabled?: boolean;
		iconClass?: string;
	} = $props();

	function getButtonProps() {
		const _props: Record<string, any> = {
			name: config.name,
			className: cn(config.customProps?.className, className),
			iconClass: cn(config.customProps?.iconClass, iconClass),
			disabled: btnDisabled
		};

		// console.log(_props);
		return _props;
	}

	function getTextProps() {
		const _props: Record<string, any> = {
			name: config.name,
			disabled: btnDisabled,
			appTitle
			// className: config.customProps?.className || className,
			// iconClass: config.customProps?.iconClass || iconClass
		};

		return _props;
	}

	function getProps() {
		const _props = (() => {
			if (config.mode === 'text') {
				return getTextProps();
			} else if (config.mode === 'icon') {
				return getButtonProps();
			} else {
				// 默认作为 icon mode
				return getButtonProps();
			}
		})(); // rust 后遗症犯了

		const needsAppTitle = config.type.startsWith('app');
		if (needsAppTitle) {
			_props.appTitle = appTitle;
		}

		return _props;
	}

	const Btn: Component = UtilButton[config.type];
</script>

{#if config.enabled}
	<Btn {appTitle} {...getProps()} />
{/if}

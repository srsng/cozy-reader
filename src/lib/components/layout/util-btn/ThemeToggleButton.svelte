<script lang="ts" module>
	import { ThemeModeToggle } from '$lib/components/forms';
</script>

<script lang="ts">
	const {
		className = { name: 'theme-toggle-button', title: '切换主题模式', class: 'size-6' },
		iconClass = { class: 'size-4' },
		...others
	} = $props<{
		className?: Record<string, any>;
		iconClass?: Record<string, any>;
	}>();
</script>

<ThemeModeToggle {className} {iconClass} {...others} />

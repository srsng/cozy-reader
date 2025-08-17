<script lang="ts">
	const { text, ...other } = $props();
	console.log('text:', text, other);
</script>

<p class="leading-7 [&:not(:first-child)]:mt-6" {...other}>{text}</p>

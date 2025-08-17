<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	let f = $state(undefined);

	$effect(() => {
		console.log(f);
	});
</script>

<Label>{f}</Label>
<Input type="file" bind:value={f}></Input>

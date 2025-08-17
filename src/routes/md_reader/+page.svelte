<script>
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';

	const { data } = $props();

	const bookid = Object.keys(data.books)[1];
</script>

<Button onclick={() => goto(`/md_reader/${bookid}`)}>bookid {bookid}</Button>

<script lang="ts">
	import { ZoomForm } from '$lib/components/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
</script>

<Card.Root class="w-85% max-w-sm">
	<Card.Header>
		<Card.Title><h1>Welcome to SvelteKit</h1></Card.Title>
		<Card.Description>Enter your email below to login to your account</Card.Description>
		<Card.Action>
			<Button>toast</Button>
		</Card.Action>
	</Card.Header>
	<Card.Content>
		<Button
			variant="outline"
			onclick={() =>
				toast.success('Event has been created', {
					description: 'Sunday, December 03, 2023 at 9:00 AM',
					action: {
						label: 'Undo',
						onClick: () => console.info('Undo')
					}
				})}
		>
			Show Toast
		</Button>
	</Card.Content>
	<!-- <Card.Footer class="flex-col gap-2">
		<Button type="submit" class="w-full">Login</Button>
		<Button variant="outline" class="w-full">Login with Google</Button>
	</Card.Footer> -->
</Card.Root>

<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<p><a href="/demo/paraglide">123</a></p>

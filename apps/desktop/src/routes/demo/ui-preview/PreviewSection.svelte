<script lang="ts">
    import type { Snippet } from 'svelte';
    import { Activity } from 'lucide-svelte';
    import * as Card from '$ui/card';

    const {
        title,
        description,
        children
    }: {
        title: string;
        description: string;
        children: Snippet;
    } = $props();
</script>

<Card.Root class="min-h-full">
    <Card.Header>
        <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
                <Card.Title>{title}</Card.Title>
                <Card.Description>{description}</Card.Description>
            </div>
            <Activity class="text-muted-foreground mt-0.5 size-4 shrink-0" />
        </div>
    </Card.Header>
    <Card.Content>
        {@render children()}
    </Card.Content>
</Card.Root>

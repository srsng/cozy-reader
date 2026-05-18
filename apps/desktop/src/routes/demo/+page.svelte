<script lang="ts">
    import { Button } from '$ui/button';
    import * as Card from '$ui/card';
</script>

<div class="mx-auto grid w-full max-w-3xl gap-4 p-6">
    <Card.Root>
        <Card.Header>
            <Card.Title>Demo</Card.Title>
            <Card.Description>内部调试页面入口</Card.Description>
        </Card.Header>
        <Card.Content class="flex flex-wrap gap-2">
            <Button href="/demo/ui-preview" variant="outline">组件样式预览</Button>
            <Button href="/demo/paraglide" variant="outline">Paraglide</Button>
            <Button href="/demo/route-demo" variant="outline">路由导航演示</Button>
        </Card.Content>
    </Card.Root>
</div>

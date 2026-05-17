<script lang="ts">
    import { USER_SETTINGS } from '$lib/stores/userSettings';
    import { inject } from '$lib/utils/context';
    import { setDomZoom } from '$lib/commands';

    const userSettings = inject(USER_SETTINGS);

    $effect(() => {
        setDomZoom($userSettings.base.zoom);
    });
</script>

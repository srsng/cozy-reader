import type { BarSection } from '$lib/settings/Layout';

export const titleBarSections: BarSection[] = ['left', 'center', 'right'];

export const titleBarSurfaceBaseClass =
    'bg-card flex w-full select-none items-stretch overflow-hidden';

export const titleBarSurfaceClass = `${titleBarSurfaceBaseClass} h-full`;

export const titleBarPreviewSurfaceClass = `${titleBarSurfaceBaseClass} border-muted h-8 border-b`;

export const titleBarContentClass =
    'grid h-full w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch';

export const titleBarSectionClasses: Record<BarSection, string> = {
    left: 'flex min-w-0 items-stretch justify-start',
    center: 'flex min-w-0 items-stretch justify-center',
    right: 'flex min-w-0 items-stretch justify-end'
};

export const titleBarButtonGroupClass =
    'h-full w-fit items-stretch gap-0 rounded-none [&>[data-slot]]:rounded-none! [&>[data-slot]:not(:has(~[data-slot]))]:rounded-none!';

export const titleBarButtonClass =
    'h-full min-w-8 rounded-none! border-0 px-2 hover:bg-accent-foreground/20 aria-expanded:bg-accent-foreground/20';

export const titleBarTextButtonClass =
    'text-card-foreground app-title flex h-full max-w-48 items-center truncate rounded-none! border-0 bg-transparent px-2 text-sm font-medium transition-colors outline-none select-none';

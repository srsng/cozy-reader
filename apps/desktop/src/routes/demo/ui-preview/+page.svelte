<script lang="ts">
    import { resetMode, setMode } from 'mode-watcher';
    import { toast } from 'svelte-sonner';
    import {
        Bell,
        BookOpen,
        Check,
        ChevronRight,
        CircleAlert,
        Cloud,
        Command,
        FileText,
        Info,
        Library,
        MoreHorizontal,
        Search,
        Settings,
        Star,
        Trash2
    } from 'lucide-svelte';
    import PreviewSection from './PreviewSection.svelte';
    import { USER_SETTINGS, forceSaveUserSettings } from '$lib/stores/userSettings';
    import { inject } from '$lib/utils/context';
    import {
        ALL_Pony_NAMES,
        ALL_Std_TD_NAMES,
        AppThemeMode2Str,
        AppThemeType2Str,
        type AppThemeMode,
        type AppThemeType,
        type PonyName,
        type StdTDName
    } from '$lib/settings/Theme';
    import { applyFourColorsHue, applyThemeType } from '$lib/theme/themeUtils';
    import { updateName as updateStdName } from '$lib/theme/standard';
    import { Button } from '$ui/button';
    import * as ButtonGroup from '$ui/button-group';
    import { Badge } from '$ui/badge';
    import * as Card from '$ui/card';
    import { Separator } from '$ui/separator';
    import { Skeleton } from '$ui/skeleton';
    import { Spinner } from '$ui/spinner';
    import * as Kbd from '$ui/kbd';
    import * as Avatar from '$ui/avatar';
    import { Input } from '$ui/input';
    import { Textarea } from '$ui/textarea';
    import { Label } from '$ui/label';
    import * as Field from '$ui/field';
    import * as InputGroup from '$ui/input-group';
    import { Checkbox } from '$ui/checkbox';
    import * as RadioGroup from '$ui/radio-group';
    import { Switch } from '$ui/switch';
    import { Slider } from '$ui/slider';
    import * as Select from '$ui/select';
    import * as NativeSelect from '$ui/native-select';
    import * as Alert from '$ui/alert';
    import { Progress } from '$ui/progress';
    import * as Empty from '$ui/empty';
    import * as Dialog from '$ui/dialog';
    import * as Popover from '$ui/popover';
    import * as DropdownMenu from '$ui/dropdown-menu';
    import * as Tooltip from '$ui/tooltip';
    import * as HoverCard from '$ui/hover-card';
    import * as Collapsible from '$ui/collapsible';
    import * as Accordion from '$ui/accordion';
    import * as Tabs from '$ui/tabs';
    import * as Breadcrumb from '$ui/breadcrumb';
    import * as Pagination from '$ui/pagination';
    import { Toggle } from '$ui/toggle';
    import * as ToggleGroup from '$ui/toggle-group';
    import * as Table from '$ui/table';
    import * as Item from '$ui/item';
    import { ScrollArea } from '$ui/scroll-area';

    const userSettings = inject(USER_SETTINGS);

    const modeOptions = Object.entries(AppThemeMode2Str) as [AppThemeMode, string][];
    const typeOptions = Object.entries(AppThemeType2Str) as [AppThemeType, string][];
    const ponyLabels: Record<PonyName, string> = {
        ts: 'Twilight',
        fs: 'Fluttershy',
        aj: 'Applejack',
        rd: 'Rainbow Dash',
        pp: 'Pinkie Pie',
        rr: 'Rarity',
        sg: 'Starlight',
        ss: 'Sunset'
    };
    const activityRows = [
        { title: 'Reader shell', status: 'Stable', value: '98%' },
        { title: 'Settings form', status: 'Review', value: '74%' },
        { title: 'Theme runtime', status: 'Active', value: '100%' }
    ];
    const scrollItems = Array.from({ length: 10 }, (_, index) => `Preview item ${index + 1}`);

    let email = $state('reader@example.com');
    let notes = $state('Components should stay readable across themes.');
    let searchValue = $state('');
    let checkboxChecked = $state(true);
    let radioValue = $state('comfortable');
    let switchChecked = $state(true);
    let sliderValue = $state(68);
    let selectValue = $state('reader');
    let nativeSelectValue = $state('standard');
    let collapsibleOpen = $state(true);
    let accordionValue = $state('spacing');
    let tabsValue = $state('overview');
    let togglePressed = $state(true);
    let toggleGroupValue = $state(['bold', 'comment']);
    let pageNumber = $state(2);
    let dropdownDensity = $state('comfortable');
    let dropdownGrid = $state(true);

    const currentMode = $derived($userSettings.theme.mode);
    const currentThemeType = $derived($userSettings.theme.type);
    const currentStdName = $derived($userSettings.theme.data.standard.name);
    const currentHue = $derived($userSettings.theme.data.four_colors.hue);
    const currentPonyName = $derived($userSettings.theme.data.pony.name);

    function updateSettings(mutator: (settings: typeof $userSettings) => void) {
        userSettings.update((settings) => {
            const nextSettings = structuredClone(settings);
            mutator(nextSettings);
            return nextSettings;
        });
    }

    function setThemeMode(mode: AppThemeMode) {
        updateSettings((settings) => {
            settings.theme.mode = mode;
        });

        if (mode === 'system') resetMode();
        else setMode(mode);
    }

    function setThemeType(type: AppThemeType) {
        updateSettings((settings) => {
            settings.theme.type = type;
        });
        applyThemeType(type);
    }

    function setStandardName(name: StdTDName) {
        updateSettings((settings) => {
            settings.theme.data.standard.name = name;
        });
        updateStdName(name);
    }

    function setFourColorsHue(hue: number) {
        const safeHue = Math.min(Math.max(Math.round(hue), 0), 360);
        updateSettings((settings) => {
            settings.theme.data.four_colors.hue = safeHue;
        });
        applyFourColorsHue(safeHue);
    }

    function setPonyName(name: PonyName) {
        updateSettings((settings) => {
            settings.theme.data.pony.name = name;
        });
    }

    async function saveNow() {
        await forceSaveUserSettings(userSettings);
        toast.success('Theme settings saved');
    }
</script>

<svelte:head>
    <title>UI Preview</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-6">
    <div class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center gap-2">
            <Badge variant="outline">/demo/ui-preview</Badge>
            <Badge>Theme lab</Badge>
        </div>
        <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div class="space-y-1">
                <h1 class="text-2xl font-semibold tracking-normal">组件样式预览</h1>
                <p class="text-muted-foreground max-w-2xl text-sm">
                    用真实应用主题检查常用 $ui 组件的颜色、间距、圆角和浮层状态。
                </p>
            </div>
            <Button variant="outline" size="sm" onclick={saveNow}>
                <Check />
                保存当前设置
            </Button>
        </div>
    </div>

    <Card.Root class="sticky top-3 z-20">
        <Card.Content class="grid gap-4 lg:grid-cols-[1fr_1fr_1.2fr]">
            <div class="space-y-2">
                <Label>明暗模式</Label>
                <ButtonGroup.Root class="flex-wrap">
                    {#each modeOptions as [mode, label]}
                        <Button
                            size="sm"
                            variant={currentMode === mode ? 'default' : 'outline'}
                            aria-pressed={currentMode === mode}
                            onclick={() => setThemeMode(mode)}
                        >
                            {label}
                        </Button>
                    {/each}
                </ButtonGroup.Root>
            </div>

            <div class="space-y-2">
                <Label>主题类型</Label>
                <ButtonGroup.Root class="flex-wrap">
                    {#each typeOptions as [type, label]}
                        <Button
                            size="sm"
                            variant={currentThemeType === type ? 'default' : 'outline'}
                            aria-pressed={currentThemeType === type}
                            onclick={() => setThemeType(type)}
                        >
                            {label}
                        </Button>
                    {/each}
                </ButtonGroup.Root>
            </div>

            <div class="grid gap-3 sm:grid-cols-3">
                <div class="space-y-2">
                    <Label>标准主题</Label>
                    <NativeSelect.Root
                        class="w-full"
                        value={currentStdName}
                        onchange={(event) =>
                            setStandardName(event.currentTarget.value as StdTDName)}
                    >
                        {#each ALL_Std_TD_NAMES as name}
                            <NativeSelect.Option value={name}>{name}</NativeSelect.Option>
                        {/each}
                    </NativeSelect.Root>
                </div>

                <div class="space-y-2">
                    <Label>四色 hue: {currentHue}°</Label>
                    <Slider
                        type="single"
                        value={currentHue}
                        min={0}
                        max={360}
                        step={1}
                        onValueCommit={(value) => setFourColorsHue(Number(value))}
                    />
                </div>

                <div class="space-y-2">
                    <Label>Pony</Label>
                    <NativeSelect.Root
                        class="w-full"
                        value={currentPonyName}
                        onchange={(event) => setPonyName(event.currentTarget.value as PonyName)}
                    >
                        {#each ALL_Pony_NAMES as name}
                            <NativeSelect.Option value={name}
                                >{ponyLabels[name]}</NativeSelect.Option
                            >
                        {/each}
                    </NativeSelect.Root>
                </div>
            </div>
        </Card.Content>
    </Card.Root>

    <div class="grid gap-4 xl:grid-cols-2">
        <PreviewSection
            title="基础视觉"
            description="Buttons, badges, cards, separators, loading and avatars."
        >
            <div class="space-y-4">
                <div class="flex flex-wrap gap-2">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">
                        <Trash2 />
                        Delete
                    </Button>
                    <Button disabled>Disabled</Button>
                    <Button size="icon" aria-label="Settings">
                        <Settings />
                    </Button>
                </div>

                <div class="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="ghost">Ghost</Badge>
                </div>

                <Separator />

                <div class="grid gap-3 sm:grid-cols-2">
                    <div class="bg-muted/40 rounded-lg p-3">
                        <div class="mb-3 flex items-center gap-3">
                            <Avatar.Group>
                                <Avatar.Root>
                                    <Avatar.Fallback>CR</Avatar.Fallback>
                                    <Avatar.Badge />
                                </Avatar.Root>
                                <Avatar.Root>
                                    <Avatar.Fallback>UI</Avatar.Fallback>
                                </Avatar.Root>
                                <Avatar.GroupCount>+3</Avatar.GroupCount>
                            </Avatar.Group>
                            <div>
                                <p class="text-sm font-medium">Avatar group</p>
                                <p class="text-muted-foreground text-xs">
                                    Fallback and badge states
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <Spinner />
                            <span class="text-muted-foreground text-sm">Loading preview</span>
                        </div>
                    </div>

                    <div class="space-y-2 rounded-lg border p-3">
                        <Skeleton class="h-4 w-3/4" />
                        <Skeleton class="h-4 w-1/2" />
                        <Skeleton class="h-20 w-full" />
                        <Kbd.Group>
                            <Kbd.Root>Ctrl</Kbd.Root>
                            <Kbd.Root>K</Kbd.Root>
                        </Kbd.Group>
                    </div>
                </div>
            </div>
        </PreviewSection>

        <PreviewSection
            title="表单输入"
            description="Inputs, fields, selections and binary controls."
        >
            <Field.Group>
                <Field.Field>
                    <Field.Label>Email</Field.Label>
                    <Input bind:value={email} placeholder="reader@example.com" />
                    <Field.Description
                        >Standard input with placeholder and focus ring.</Field.Description
                    >
                </Field.Field>

                <Field.Field>
                    <Field.Label>Notes</Field.Label>
                    <Textarea bind:value={notes} />
                </Field.Field>

                <Field.Field>
                    <Field.Label>Command input group</Field.Label>
                    <InputGroup.Root>
                        <InputGroup.Addon>
                            <Search />
                        </InputGroup.Addon>
                        <InputGroup.Input
                            bind:value={searchValue}
                            placeholder="Search components"
                        />
                        <InputGroup.Addon align="inline-end">
                            <InputGroup.Button>Go</InputGroup.Button>
                        </InputGroup.Addon>
                    </InputGroup.Root>
                </Field.Field>

                <div class="grid gap-4 sm:grid-cols-2">
                    <Field.Field orientation="horizontal">
                        <Checkbox bind:checked={checkboxChecked} id="preview-checkbox" />
                        <Field.Content>
                            <Field.Label for="preview-checkbox">Checkbox</Field.Label>
                            <Field.Description>Checked state</Field.Description>
                        </Field.Content>
                    </Field.Field>

                    <Field.Field orientation="horizontal">
                        <Switch bind:checked={switchChecked} id="preview-switch" />
                        <Field.Content>
                            <Field.Label for="preview-switch">Switch</Field.Label>
                            <Field.Description
                                >{switchChecked ? 'Enabled' : 'Disabled'}</Field.Description
                            >
                        </Field.Content>
                    </Field.Field>
                </div>

                <RadioGroup.Root bind:value={radioValue}>
                    <Field.Field orientation="horizontal">
                        <RadioGroup.Item value="compact" id="density-compact" />
                        <Field.Label for="density-compact">Compact</Field.Label>
                    </Field.Field>
                    <Field.Field orientation="horizontal">
                        <RadioGroup.Item value="comfortable" id="density-comfortable" />
                        <Field.Label for="density-comfortable">Comfortable</Field.Label>
                    </Field.Field>
                </RadioGroup.Root>

                <div class="grid gap-4 sm:grid-cols-2">
                    <Field.Field>
                        <Field.Label>Slider: {sliderValue}</Field.Label>
                        <Slider type="single" bind:value={sliderValue} min={0} max={100} step={1} />
                    </Field.Field>

                    <Field.Field>
                        <Field.Label>Select</Field.Label>
                        <Select.Root type="single" bind:value={selectValue}>
                            <Select.Trigger class="w-full">
                                {selectValue === 'reader' ? 'Reader' : 'Library'}
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="reader">Reader</Select.Item>
                                <Select.Item value="library">Library</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </Field.Field>
                </div>

                <Field.Field>
                    <Field.Label>Native select</Field.Label>
                    <NativeSelect.Root bind:value={nativeSelectValue}>
                        <NativeSelect.Option value="standard">Standard</NativeSelect.Option>
                        <NativeSelect.Option value="dense">Dense</NativeSelect.Option>
                        <NativeSelect.Option value="spacious">Spacious</NativeSelect.Option>
                    </NativeSelect.Root>
                </Field.Field>
            </Field.Group>
        </PreviewSection>

        <PreviewSection
            title="反馈状态"
            description="Alerts, progress, empty states and sonner notifications."
        >
            <div class="space-y-4">
                <Alert.Root>
                    <Info />
                    <Alert.Title>Default alert</Alert.Title>
                    <Alert.Description
                        >Neutral feedback should stay legible on every theme.</Alert.Description
                    >
                    <Alert.Action>
                        <Button size="xs" variant="outline">Action</Button>
                    </Alert.Action>
                </Alert.Root>

                <Alert.Root variant="destructive">
                    <CircleAlert />
                    <Alert.Title>Destructive alert</Alert.Title>
                    <Alert.Description
                        >Contrast for destructive states is part of the preview.</Alert.Description
                    >
                </Alert.Root>

                <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                        <span>Import progress</span>
                        <span class="text-muted-foreground">72%</span>
                    </div>
                    <Progress value={72} />
                </div>

                <Empty.Root class="border">
                    <Empty.Media variant="icon">
                        <Library />
                    </Empty.Media>
                    <Empty.Title>No books selected</Empty.Title>
                    <Empty.Description>
                        Empty states should feel quiet while keeping primary actions visible.
                    </Empty.Description>
                    <Empty.Content>
                        <Button size="sm" onclick={() => toast.info('Preview toast')}>
                            Show toast
                        </Button>
                    </Empty.Content>
                </Empty.Root>
            </div>
        </PreviewSection>

        <PreviewSection
            title="浮层交互"
            description="Dialog, popover, dropdown, tooltip, hover card and disclosure states."
        >
            <div class="space-y-4">
                <div class="flex flex-wrap gap-2">
                    <Dialog.Root>
                        <Dialog.Trigger>
                            <Button variant="outline">Dialog</Button>
                        </Dialog.Trigger>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>Reader settings</Dialog.Title>
                                <Dialog.Description>
                                    Modal content should inherit popover colors and focus styles.
                                </Dialog.Description>
                            </Dialog.Header>
                            <div class="grid gap-3">
                                <Input value="Chapter spacing" />
                                <Progress value={64} />
                            </div>
                            <Dialog.Footer showCloseButton>
                                <Button>Save</Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Root>

                    <Popover.Root>
                        <Popover.Trigger>
                            <Button variant="outline">Popover</Button>
                        </Popover.Trigger>
                        <Popover.Content>
                            <Popover.Header>
                                <Popover.Title>Quick action</Popover.Title>
                                <Popover.Description
                                    >Popover panels use the same surface tokens.</Popover.Description
                                >
                            </Popover.Header>
                            <Button size="sm">Apply</Button>
                        </Popover.Content>
                    </Popover.Root>

                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            <Button variant="outline">
                                Menu
                                <ChevronRight />
                            </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content class="w-52">
                            <DropdownMenu.Label>Preview menu</DropdownMenu.Label>
                            <DropdownMenu.Separator />
                            <DropdownMenu.CheckboxItem bind:checked={dropdownGrid}>
                                Show grid
                            </DropdownMenu.CheckboxItem>
                            <DropdownMenu.RadioGroup bind:value={dropdownDensity}>
                                <DropdownMenu.RadioItem value="compact"
                                    >Compact</DropdownMenu.RadioItem
                                >
                                <DropdownMenu.RadioItem value="comfortable">
                                    Comfortable
                                </DropdownMenu.RadioItem>
                            </DropdownMenu.RadioGroup>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item>
                                Command palette
                                <DropdownMenu.Shortcut>⌘K</DropdownMenu.Shortcut>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item variant="destructive">Remove</DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>

                    <Tooltip.Provider>
                        <Tooltip.Root>
                            <Tooltip.Trigger>
                                <Button variant="outline" size="icon" aria-label="Tooltip preview">
                                    <Bell />
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>Notification tooltip</Tooltip.Content>
                        </Tooltip.Root>
                    </Tooltip.Provider>

                    <HoverCard.Root>
                        <HoverCard.Trigger>
                            <Button variant="link">Hover card</Button>
                        </HoverCard.Trigger>
                        <HoverCard.Content>
                            <div class="flex gap-3">
                                <Avatar.Root>
                                    <Avatar.Fallback>CR</Avatar.Fallback>
                                </Avatar.Root>
                                <div class="space-y-1">
                                    <p class="font-medium">Cozy Reader</p>
                                    <p class="text-muted-foreground text-sm">
                                        Hover surfaces should match popovers.
                                    </p>
                                </div>
                            </div>
                        </HoverCard.Content>
                    </HoverCard.Root>
                </div>

                <Collapsible.Root bind:open={collapsibleOpen}>
                    <Collapsible.Trigger>
                        <Button variant="ghost" class="w-full justify-between">
                            Collapsible details
                            <Badge variant="outline">{collapsibleOpen ? 'Open' : 'Closed'}</Badge>
                        </Button>
                    </Collapsible.Trigger>
                    <Collapsible.Content
                        class="text-muted-foreground rounded-lg border p-3 text-sm"
                    >
                        Disclosure content checks border, muted text and spacing together.
                    </Collapsible.Content>
                </Collapsible.Root>

                <Accordion.Root type="single" bind:value={accordionValue}>
                    <Accordion.Item value="spacing">
                        <Accordion.Trigger>Spacing and surfaces</Accordion.Trigger>
                        <Accordion.Content>
                            Accordion content uses the same text rhythm as settings panels.
                        </Accordion.Content>
                    </Accordion.Item>
                    <Accordion.Item value="focus">
                        <Accordion.Trigger>Focus rings</Accordion.Trigger>
                        <Accordion.Content>
                            Keyboard focus should be visible without overwhelming the layout.
                        </Accordion.Content>
                    </Accordion.Item>
                </Accordion.Root>
            </div>
        </PreviewSection>

        <PreviewSection
            title="导航组织"
            description="Tabs, breadcrumbs, pagination, grouped buttons and toggles."
        >
            <div class="space-y-4">
                <Breadcrumb.Root>
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="/demo">Demo</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="/demo/ui-preview">UI</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Page>Preview</Breadcrumb.Page>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>

                <Tabs.Root bind:value={tabsValue}>
                    <Tabs.List>
                        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
                        <Tabs.Trigger value="details">Details</Tabs.Trigger>
                        <Tabs.Trigger value="disabled" disabled>Disabled</Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="overview" class="rounded-lg border p-3">
                        Overview panel with card-like border and active tab state.
                    </Tabs.Content>
                    <Tabs.Content value="details" class="rounded-lg border p-3">
                        Details panel for checking inactive and selected tab contrast.
                    </Tabs.Content>
                </Tabs.Root>

                <div class="flex flex-wrap items-center gap-3">
                    <ButtonGroup.Root>
                        <Button variant="outline" size="sm">
                            <BookOpen />
                            Read
                        </Button>
                        <Button variant="outline" size="sm">
                            <Star />
                            Mark
                        </Button>
                        <Button variant="outline" size="sm">
                            <MoreHorizontal />
                        </Button>
                    </ButtonGroup.Root>

                    <Toggle
                        bind:pressed={togglePressed}
                        variant="outline"
                        aria-label="Toggle favorite"
                    >
                        <Star />
                        Favorite
                    </Toggle>

                    <ToggleGroup.Root
                        type="multiple"
                        bind:value={toggleGroupValue}
                        variant="outline"
                    >
                        <ToggleGroup.Item value="bold">B</ToggleGroup.Item>
                        <ToggleGroup.Item value="italic">I</ToggleGroup.Item>
                        <ToggleGroup.Item value="comment">
                            <Command />
                        </ToggleGroup.Item>
                    </ToggleGroup.Root>
                </div>

                <Pagination.Root count={80} perPage={10} bind:page={pageNumber}>
                    {#snippet children({ pages })}
                        <Pagination.Content>
                            <Pagination.Item>
                                <Pagination.PrevButton />
                            </Pagination.Item>
                            {#each pages as page (page.key)}
                                <Pagination.Item>
                                    {#if page.type === 'ellipsis'}
                                        <Pagination.Ellipsis />
                                    {:else}
                                        <Pagination.Link
                                            {page}
                                            isActive={pageNumber === page.value}
                                        />
                                    {/if}
                                </Pagination.Item>
                            {/each}
                            <Pagination.Item>
                                <Pagination.NextButton />
                            </Pagination.Item>
                        </Pagination.Content>
                    {/snippet}
                </Pagination.Root>
            </div>
        </PreviewSection>

        <PreviewSection title="数据展示" description="Tables, item rows and scrollable regions.">
            <div class="space-y-4">
                <Table.Root>
                    <Table.Caption>Component health snapshot</Table.Caption>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head>Area</Table.Head>
                            <Table.Head>Status</Table.Head>
                            <Table.Head class="text-right">Score</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each activityRows as row}
                            <Table.Row>
                                <Table.Cell class="font-medium">{row.title}</Table.Cell>
                                <Table.Cell>
                                    <Badge variant="outline">{row.status}</Badge>
                                </Table.Cell>
                                <Table.Cell class="text-right">{row.value}</Table.Cell>
                            </Table.Row>
                        {/each}
                    </Table.Body>
                </Table.Root>

                <Item.Group>
                    <Item.Root variant="outline">
                        <Item.Media variant="icon">
                            <FileText />
                        </Item.Media>
                        <Item.Content>
                            <Item.Title>Reader document</Item.Title>
                            <Item.Description
                                >Item layout with icon media and actions.</Item.Description
                            >
                        </Item.Content>
                        <Item.Actions>
                            <Button size="sm" variant="outline">Open</Button>
                        </Item.Actions>
                    </Item.Root>
                    <Item.Root variant="muted">
                        <Item.Media variant="icon">
                            <Cloud />
                        </Item.Media>
                        <Item.Content>
                            <Item.Title>Sync state</Item.Title>
                            <Item.Description
                                >Muted item background in current theme.</Item.Description
                            >
                        </Item.Content>
                        <Badge variant="secondary">Ready</Badge>
                    </Item.Root>
                </Item.Group>

                <ScrollArea class="h-40 rounded-lg border">
                    <div class="space-y-1 p-3">
                        {#each scrollItems as item}
                            <div
                                class="hover:bg-muted flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
                            >
                                <span>{item}</span>
                                <span class="text-muted-foreground">#{item.split(' ').at(-1)}</span>
                            </div>
                        {/each}
                    </div>
                </ScrollArea>
            </div>
        </PreviewSection>
    </div>
</div>

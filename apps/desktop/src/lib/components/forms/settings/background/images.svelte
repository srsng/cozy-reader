<script lang="ts" module>
	import { inject } from '$lib/utils/context';
	import { confirm } from '@tauri-apps/plugin-dialog';
	import { USER_SETTINGS } from '$lib/stores/userSettings';
	import { createBackgroundImage, type BackgroundImage } from '$lib/settings/background';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { Info, Trash2, Upload, Check, X, SquarePen, EyeOff, Eye, Copy } from 'lucide-svelte';
	import { askOpenImg } from '$lib/utils/file';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { writeToClipBoard } from '$lib/utils/clip';
	import { scale, slide } from 'svelte/transition';
	import { BACKGROUND_EVENTS } from '$lib/events/shortcut';
	import { emit } from '@tauri-apps/api/event';
	import { SHORTCUT_EVENT } from '$lib/shortcuts/shortcutService';
	import { toast } from 'svelte-sonner';
	import apis from '$lib/apis';
</script>

<script lang="ts">
	const currentSettings = $state(inject(USER_SETTINGS));
	let keepConfirm = false;
	let askedKeepConfirm = false;

	// 选择图片文件
	async function selectImageFile() {
		try {
			const filePath = await askOpenImg();
			if (filePath) {
				const fileName = filePath.split(/[\/\\]/).pop() || 'Unknown';
				const newImage = createBackgroundImage({
					name: fileName,
					filePath: filePath
				});

				// 添加到设置中并设为活跃
				$currentSettings.background.images = [...$currentSettings.background.images, newImage];
				$currentSettings.background.activeImageId = newImage.id;
				// 发送背景图片切换事件
				emit(SHORTCUT_EVENT, BACKGROUND_EVENTS.IMAGE_CHANGED);
			}
		} catch (error) {
			toast.error('选择图片失败', {
				description: `${error}`
			});
			console.error('选择图片失败:', error);
		}
	}

	// 删除背景图片
	async function removeImage(imageId: string) {
		if (
			keepConfirm ||
			(await confirm('确定要删除这张背景图片吗？', {
				title: '警告',
				okLabel: '删除',
				cancelLabel: '取消'
			}))
		) {
			$currentSettings.background.images = $currentSettings.background.images.filter(
				(img) => img.id !== imageId
			);

			// 如果删除的是当前激活的图片，清除激活状态
			if ($currentSettings.background.activeImageId === imageId) {
				$currentSettings.background.activeImageId = null;
			}

			if (!askedKeepConfirm) {
				toast('近期删除不再确认？', {
					action: {
						label: 'Yes',
						onClick: () => {
							keepConfirm = true;
							askedKeepConfirm = true;
						}
					},
					onDismiss: () => (askedKeepConfirm = true)
				});
			}
		}
	}

	// 激活背景图片
	async function activateImage(imageId: string) {
		const image = $currentSettings.background.images.find((img) => img.id === imageId);
		if (!image) {
			toast.error('未知错误', {
				description: '图片配置丢失'
			});
			return;
		}

		if (await apis.fs.exists({ path: image.filePath })) {
			$currentSettings.background.activeImageId = imageId;
			// 发送背景图片切换事件
			emit(SHORTCUT_EVENT, BACKGROUND_EVENTS.IMAGE_CHANGED);
		} else {
			toast.error('目标图片不存在', {
				description: '请检查是否删除图片'
			});
		}
	}

	// 禁用背景图片
	function disableBackground() {
		$currentSettings.background.activeImageId = null;
		// 发送背景图片切换事件
		emit(SHORTCUT_EVENT, BACKGROUND_EVENTS.IMAGE_CHANGED);
	}

	// 编辑状态管理
	let editingImageId: string | null = $state(null);
	let editingName: string = $state('');

	// 开始编辑图片名称
	function startEditName(image: BackgroundImage) {
		editingImageId = image.id;
		editingName = image.name;
		// todo: 获取输入焦点
	}

	// 保存图片名称
	function saveImageName() {
		if (editingImageId && editingName.trim()) {
			const imageIndex = $currentSettings.background.images.findIndex(
				(img) => img.id === editingImageId
			);
			if (imageIndex >= 0) {
				$currentSettings.background.images[imageIndex].name = editingName.trim();
			}
		}
		cancelEditName();
	}

	// 取消编辑图片名称
	function cancelEditName() {
		editingImageId = null;
		editingName = '';
	}

	// 处理键盘事件
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			saveImageName();
		} else if (event.key === 'Escape') {
			cancelEditName();
		}
	}

	// 复制图片配置
	function copyCurImageConfig() {
		const sourceImage = $currentSettings.background.images.find(
			(img) => img.id === $currentSettings.background.activeImageId && img.internal === false
		);
		if (!sourceImage) {
			toast.warning('复制配置失败', {
				description: '未使用任何背景图'
			});
			return;
		}
		try {
			// 创建新的图片配置，复制所有配置但生成新的ID
			const copiedImage = createBackgroundImage({
				name: `${sourceImage.name} - 副本`,
				filePath: sourceImage.filePath,
				internal: sourceImage.internal,
				enableConfig: sourceImage.enableConfig,
				config: sourceImage.config ? { ...sourceImage.config } : undefined,
				themeBinding: sourceImage.themeBinding ? { ...sourceImage.themeBinding } : undefined
			});

			// 添加到配置末尾
			$currentSettings.background.images = [...$currentSettings.background.images, copiedImage];

			// 设为活跃图片
			$currentSettings.background.activeImageId = copiedImage.id;

			// 发送背景图片切换事件
			emit(SHORTCUT_EVENT, BACKGROUND_EVENTS.IMAGE_CHANGED);

			toast.success('复制配置成功', {
				description: `已复制 "${sourceImage.name}" 的配置`
			});
		} catch (error) {
			toast.error('复制配置失败', {
				description: `${error}`
			});
			console.error('复制配置失败:', error);
		}
	}
</script>

{#snippet imageTooltip(image: BackgroundImage)}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					variant="ghost"
					class="size-8"
					onclick={() => writeToClipBoard(image.filePath, true)}
				>
					<Info />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>name: {image.name}</p>
				<p>path: {image.filePath}</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{/snippet}

<Card.Root class="flex flex-col">
	<Card.Header class="flex-shrink-0">
		<Card.Title>背景图片</Card.Title>
		<Card.Description>管理您的背景图片集合</Card.Description>
		<Card.Action>
			<div class="flex flex-col gap-2 sm:flex-row">
				<Button title="添加背景图片" size="icon" onclick={selectImageFile}>
					<Upload />
				</Button>
				<Button
					title="复制当前背景图的配置"
					class="flex-shrink-0"
					size="icon"
					variant={$currentSettings.background.activeImageId === null ? 'outline' : 'default'}
					disabled={$currentSettings.background.activeImageId === null}
					onclick={() => copyCurImageConfig()}
				>
					<Copy />
				</Button>
				<Button
					title="禁用背景"
					class="flex-shrink-0"
					size="icon"
					variant={$currentSettings.background.activeImageId === null ? 'outline' : 'default'}
					disabled={$currentSettings.background.activeImageId === null}
					onclick={disableBackground}
				>
					<EyeOff />
				</Button>
			</div>
		</Card.Action>
	</Card.Header>
	<Card.Content class="space-y-4">
		{#if $currentSettings.background.images.length === 0}
			<div class="text-muted-foreground py-8 text-center">
				<p>暂无背景图片</p>
				<p class="text-sm">点击上方按钮添加图片</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each $currentSettings.background.images.filter((img) => !img.internal) as image (image.id)}
					<div
						class="flex items-center gap-3 rounded-lg border p-3 transition-colors"
						class:bg-accent={$currentSettings.background.activeImageId === image.id}
						class:text-accent-foreground={$currentSettings.background.activeImageId === image.id}
					>
						<div class="min-w-0 flex-1">
							{#if editingImageId === image.id}
								<div class="flex items-center gap-2" in:scale={{ duration: 300 }}>
									<Input
										bind:value={editingName}
										onkeydown={handleKeydown}
										class="h-8 text-sm"
										placeholder="输入图片名称"
									/>
									<Button variant="ghost" class="size-8 p-0" onclick={saveImageName}>
										<Check class="size-4" />
									</Button>
									<Button variant="ghost" class="size-8 p-0" onclick={cancelEditName}>
										<X class="size-4" />
									</Button>
								</div>
							{:else}
								<div class="flex items-center gap-2" in:scale={{ duration: 300 }}>
									<p class="flex-1 truncate font-medium">{image.name}</p>
									<Button variant="ghost" class="size-8 p-0" onclick={() => startEditName(image)}>
										<SquarePen />
									</Button>
								</div>
							{/if}
						</div>
						{#if editingImageId !== image.id}
							<!-- todo fix: 动画结束会卡顿一下 -->
							<div class="flex items-center gap-1" transition:slide={{ axis: 'x', duration: 300 }}>
								<Button
									class="size-8"
									disabled={$currentSettings.background.activeImageId === image.id}
									onclick={() => activateImage(image.id)}
								>
									<Eye />
								</Button>
								{@render imageTooltip(image)}

								<Button
									variant="warnDestructive"
									class="size-8"
									onclick={() => removeImage(image.id)}
								>
									<Trash2 />
								</Button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</Card.Content>
</Card.Root>

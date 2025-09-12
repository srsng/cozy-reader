# UI

项目UI库，通过在当前子包根目录**逐步**执行

```cmd
pnpm dlx sv add tailwindcss
pnpm dlx shadcn-svelte@latest init
pnpm dlx shadcn-svelte@latest add --all
```

进行初始化shadcn-svelte。

## 更新

初始化后暂未更新，之后再说

## 使用

就shadcn-svelte的组件而言，原本的导入方式

```svelte
import * as Card from '$lib/components/ui/card'; 
```

新的导入方式

```svelte
import * as Card from '@cozy/ui/card';
// 等效
// import * as Card from '@cozy/ui/components/ui/card/index';
```

其他组件同理，或可以根据目录结构查看怎么导入

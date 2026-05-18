# TODO List

## 常规

### eazy

- [ ] 修改背景图片设置的“重选背景图”功能位置
- [x] 在设置页面的销毁钩子中添加立即保存
- [x] 背景图片支持修改路径
- [x] 添加goto背景图设置 util-btn， 图标`<Wallpaper />`
- [x] 恢复钩子 adapter
- [ ] 系统标题栏似乎去不掉了 (打包出来其他设备没有标题栏？？)
- [x] zoom添加数值显示
- [x] 给 zoom 注册应用全局快捷键
- [x] 主题数据编辑区
- [x] 优化std主题选择器
- [ ] reader文本等可选中
- [x] 应用页面元数据（title、description）
- [ ] ~~window-vibrancy~~
- [x] css默认值问题：ui透明度默认从0.1开始；移除body入场动画的透明度
- [x] 四色主题颜色问题：accent明暗模式颜色值对调
- [ ] 增强主题预览组件，完全覆盖所有主题css变量
- [x] 重构slider的使用，封装带有contorls的slider组件
- [x] 切换最大化/全屏时，保存窗口状态
- [x] 错误处理: 原有的背景图片被删除或移走
- [ ] 优化thumbnail，支持封面，支持hover时显示详情信息
- [x] 阻止原本的 ctrl+r，f5等刷新快捷键
- [ ] 首行缩进、长图缩放等样式
- [ ] 为APP状态添加一个是否有焦点的标记，并添加一个防误触功能：当窗口没有焦点时，部分功能如翻页会被保护。
- [ ] 设置中的tab默认会不选中，或者说选中了但是没有显示
- [ ] review layout.css 中独立背景容器对 --background 变量的使用

### hard

- [x] 调整设置架构，支持搜索设置项
- [x] fix: 从深色mode切换到浅色模式时会有一个闪光弹效果：切换主题模式时，背景会瞬间从暗色切换到亮色（正常，但导致不好的体验），导致屏幕会突然像是吃了闪光弹一样突然很亮。
- [x] bug: slider的进度条丢失
- [x] bug: 页面没法滚动
- [x] bug: 一些颜色消失，包括tab选中强调色、slider的进度条颜色

- [x] 将当前的路由历史记录换成更加原生的实现，提升带state的goto在项目中的兼容性，解决goto 带 `{ state: { ... } }` 后（去设置与背景设置页面的utils按钮），偶尔出现的错误

    ```txt
    Uncaught (in promise) DataCloneError: Failed to execute 'pushState' on 'History': PointerEvent object could not be cloned.
        at history.pushState (client.js:96:21)
        at navigate (client.js:1596:6)
    ```

- [ ] 实装`window-vibrancy`后，考虑合并到背景图片设置中，一并管理
- [ ] reader epub的注解，脚注等支持tooltip显示，而不跳转
- [ ] 优化store的计时器保存，在立即保存中判断是否在计时（考虑清除计时器？因为有新的保存请求）

- [ ] typography系列组件 样式控制器，用于控制reader的各种设置需要改变样式的地方
- [ ] 调整主题导入架构，减少重复代码
- [ ] 参考 cozy-reader-old的主题，增加新主题类型`simple`

    ```json
    {
        "theme-light-blue": {
            "name": "Blue | 蓝",
            "type": "light",
            "css": {
                "--header-color": "#006fc9",
                "--header-text-color": "#e5e7eb",
                "--background-color": "#f2f2f2",
                "--text-color": "#323130"
            }
        },
        "theme-gray-blue": {
            "name": "Gray-Blue | 灰蓝",
            "type": "both",
            "css": {
                "--header-color": "#374151",
                "--background-color": "#4b5563",
                "--text-color": "#e5e7eb"
            }
        },
        "theme-dark-gray": {
            "name": "Gray | 暗灰",
            "type": "dark",
            "css": {
                "--header-color": "#333333",
                "--background-color": "#282828",
                "--text-color": "#e5e7eb"
            }
        },
        "theme-light-coral": {
            "name": "Coral | 珊瑚红",
            "type": "light",
            "css": {
                "--header-color": "#f08080",
                "--header-text-color": "#f2f4f8",
                "--background-color": "#f2f2f2",
                "--text-color": "#323130"
            }
        },
        "theme-light-yellow123": {
            "name": "bulue",
            "type": "light",
            "css": {
                "--header-color": "#a63030",
                "--background-color": "#7e6767",
                "--text-color": "#331010",
                "--header-text-color": "#d57272"
            }
        }
    }
    ```

- [ ] 升级tauri等rust依赖，并排除可能的错误
- [x] md支持渲染数学公式
- [ ] 增强md：table等组件 [参考](node_modules.pnpm\marked@16.2.1\node_modules\marked\lib\marked.d.ts)
- [x] 书籍drag添加到书库
  - [x] 支持批量添加
- [x] 找出dev时老是莫名无响应 ( 似乎是 最大化就触发)
- [x] 给背景图添加：internal标注字段，创建时间
- [ ] 实现内置背景图(资源附加问题，可能直接把图片放public就实现了？)
- [ ] 给titlebar等添加几种状态，如apptitle（常规状态）、header（固定在顶部）、hide（完全隐藏）、slide（平时隐藏，鼠标靠近滑出来）
- [x] 透明
  - [x] 窗口透明
  - [x] 背景图透明
- [ ] 修复上层overlay失效问题
- [x] 修复背景层overlay坏掉了的问题
- [ ] 优化背景图片设置相关代码，包括background-action组件，主layout初始化背景图，更改、响应
- [ ] reader
- [ ] 加强对window的自定义，参考Trans与old Cozy Reader
- [ ] 优化整体的i18n方案
- [ ] api系统
- [x] 全局快捷键系统
- [ ] 事件系统 - 事件列表 管理事件
- [x] 全局toast
- [x] 全局应用状态
- [ ] 为bar添加变体封装
- [ ] 集中管理theme
- [x] 集中管理window相关修改应用
- [x] 主题背景图支持
- [x] 背景图可以自定义与某一主题绑定
  - [ ] 优化主题与背景图之间的关系(好抽象)
- [ ] 背景图设置页面 图片列表 动画格格不入——还是给Card——已封装组件添加动画的问题
- [ ] Pony主题
- [x] 深色模式下按钮hover效果尤其是close window按钮不佳，destructive颜色没有
- [ ] 尺寸/大小过渡动画
  - [ ] 优化主题数据编辑区高度变化动画 (Card组件)
  - => 新思路：新增元素时，scale+slide过渡，挤压父元素尺寸
- [ ] review 自定义titlebar配置页及相关组件的代码
  - src\lib\components\layout\custom\*
  - src\lib\components\forms\bar\*
  - src\lib\components\forms\ButtonTypeSelector.svelte
  - src\route\settings\bar-config\+page.svelte
  - [ ] 支持多webview-window，记得在app state中添加window列表以管理
  - [ ] 支持多tab tablist-warper manager
- [ ] 数据库版本管理
- [ ] CI/CD构建
  - [ ] 支持绿色版

## super hard

- [ ] 将仓库改为[turborepo](https://turborepo.com/)模式
  - [ ] 了解turborepo管理方式
  - [ ] 将 foliate.js 作为submodule添加到仓库

            ```cmd
            git submodule add https://github.com/johnfactotum/foliate-js packages/foliate-js
            git submodule update --init --recursive
            ```

  - [ ] 考虑 pdf.js djvu.js kthoom villain.js

  - [ ] 将旧项目的 icon相关功能、fastlink项目作为crate一部分
    - [ ] 重构icon相关功能作为一个crate
    - [ ] 重构fastlink项目

  - [ ] ...

## 平台特定

### Windows

- [ ] 对"Win+Z"快捷键添加`<Group />`按钮

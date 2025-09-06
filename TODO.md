# TODO List

## 常规

### eazy

- [ ] 背景图片支持修改路径
- [x] 添加goto背景图设置 util-btn， 图标`<Wallpaper />`
- [x] 恢复钩子 adapter
- [ ] 系统标题栏似乎去不掉了 (打包出来其他设备没有标题栏？？)
- [x] zoom添加数值显示
- [x] 给 zoom 注册应用全局快捷键
- [x] 主题数据编辑区
- [x] 优化std主题选择器
- [ ] reader文本等可选中
- [x] 应用页面元数据（title、description）
- [ ] window-vibrancy
- [x] css默认值问题：ui透明度默认从0.1开始；移除body入场动画的透明度
- [x] 四色主题颜色问题：accent明暗模式颜色值对调
- [ ] 增强主题预览组件，完全覆盖所有主题css变量
- [ ] 背景图片变换设置部分，slide组件step设为1，添加两个加减1的按钮
- [x] 切换最大化/全屏时，保存窗口状态

### hard

- [x] 找出dev时老是莫名无响应 ( 似乎是 最大化就触发)
- [x] 给背景图添加：internal标注字段，创建时间
- [ ] 实现内置背景图(资源附加问题，可能直接把图片放public就实现了？)
- [ ] 给titlebar等添加几种状态，如apptitle（常规状态）、header（固定在顶部）、hide（完全隐藏）、slide（平时隐藏，鼠标靠近滑出来）
- [ ] 透明
  - [ ] 窗口透明
  - [x] 背景透明
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

## 平台特定

### Windows

- [ ] 对"Win+Z"快捷键添加`<Group />`按钮

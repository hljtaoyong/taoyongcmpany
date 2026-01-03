# ui/
> L2 | 父级: ../CLAUDE.md

shadcn/ui 设计系统组件目录

**微拟物升级组件**：Button, Card, Input, Badge
- Button: 渐变背景 + 三层立体阴影 + Apple 级点击回弹
- Card: raised/inset/flat 三种变体 + Apple 级悬浮提升
- Input: 内凹阴影效果
- Badge: 渐变背景 + 立体效果

**Apple 级动效集成**
- Button: whileTap 缩放到 0.96 (Spring: 500,30)
- Card: whileHover 提升 + 阴影加深 (Spring: 400,25)
- 所有动画使用 Spring 物理引擎

成员清单 (核心交互)
button.jsx: 按钮,渐变 + 立体阴影 + 点击回弹,6 种 variant
input.jsx: 输入框,内凹阴影效果
label.jsx: 表单标签
card.jsx: 卡片,raised/inset/flat 变体 + 悬浮动画

成员清单 (表单)
form.jsx: 表单容器,react-hook-form 集成
select.jsx: 下拉选择,Radix UI
checkbox.jsx: 复选框
radio-group.jsx: 单选组
switch.jsx: 开关切换
textarea.jsx: 多行输入

成员清单 (反馈)
alert.jsx: 警告提示
sonner.jsx: Toast 通知
badge.jsx: 标签,渐变背景
skeleton.jsx: 骨架屏
progress.jsx: 进度条

成员清单 (导航)
tabs.jsx: 标签页
accordion.jsx: 手风琴
dropdown-menu.jsx: 下拉菜单
navigation-menu.jsx: 导航菜单
sheet.jsx: 侧边抽屉
dialog.jsx: 对话框

成员清单 (展示)
avatar.jsx: 头像
table.jsx: 表格
popover.jsx: 气泡弹出
tooltip.jsx: 工具提示
hover-card.jsx: 悬停卡片

成员清单 (工具)
scroll-area.jsx: 滚动区域
separator.jsx: 分隔线
command.jsx: 命令面板
collapsible.jsx: 可折叠容器

法则: 成员完整·一行一文件·父级链接·技术词前置

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

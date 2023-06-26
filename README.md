## 通用版3d场景编辑器

### 标注
1. 动态导入模型、基础属性编辑（位置、模型属性）
2. 运行和定制页分离

### 目录结构
```

├─global.less  全局样式
├─global.ts  应用根配置
├─utils
|   ├─common.js  通用工具函数
|   ├─threeD.js  自封装插件
|   ├─three-correct  第三方插件
├─style
|   └core.less
├─service
|    └ipConfig.js
├─pages
|   ├─main
|   |  ├─wealth  左侧模型库及关系树
|   |  |   ├─RelationshipEditor
|   |  |   ├─ModelLibrary
|   |  ├─scene  场景渲染
|   |  |   ├─Workbench
|   |  |   ├─ToolBar
|   |  ├─navigation  顶部导航栏
|   |  |     ├─utils
|   |  |     |   ├─exportProject.ts
|   |  |     |   ├─getFileType.ts
|   |  |     |   ├─newProject.ts
|   |  |     |   └saveProjectConfig.ts
|   |  |     ├─data
|   |  |     |  └menuTemplate.js
|   |  |     ├─component
|   |  |     |     ├─userImg
|   |  |     |     ├─SubMenu
|   |  |     |     ├─ProjectName
|   |  |     |     ├─NewProject
|   |  |     |     ├─Menu
|   |  |     |     ├─ImpFiles
|   |  ├─attribute  右侧属性编辑面板
|   |  |     ├─SelectedModel
|   |  |     ├─EnvConfig
|   |  |     ├─Editor
|   |  |     ├─DataBind
|   ├─login
|   ├─error
|   |   ├─404.tsx
|   |   └500.tsx
├─models
|   ├─attribute.ts
|   ├─project.ts  工程相关
|   └scene.ts  场景编辑相关
├─layout
|   └SecurityLayout.tsx
├─components
|     ├─RightMenu
|     ├─ErrorBoundary
|     ├─Collapse
├─common
|   ├─antd.ts
|   ├─sceneConfigList.ts
|   └type.ts
├─assets
```

### 拓展

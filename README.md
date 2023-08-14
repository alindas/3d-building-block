## 通用版3d场景编辑器

### 设计理念
**通用和定制开发的边界**：通用版本实现对基本的场景编辑进行，特定复杂业务的开发留给定制页处理。

**基本场景的编辑理念**：将场景灯光效果、动态模型的自定义属性打包成配置文件的形式，定制页根据配置文件直接渲染基本场景的特性。其他效果动态调整。



#### 编辑器和定制页
1. 编辑器用于基于现有模型进行修改和生成配置文件
2. 不同项目在定制页进行特性开发
3. 单工程模式

#### 编辑器
1. 模型基本属性编辑
2. 场景基本属性编辑

### 目录结构
```

├─global.less  全局样式
├─global.ts  应用根配置
├─utils
|   ├─common.js  通用工具函数
|   ├─threeD.js  自封装插件
|   ├─correct-package  需要自定义调整的第三方插件
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
|   ├─stage  场景运行页，定制参考这
|   |   ├─exhibit.tsx 具体工程渲染数据，增加定制功能参考这
|   ├─error
|   |   ├─404.tsx
|   |   └500.tsx
├─models
|   ├─attribute.ts
|   ├─project.ts  工程相关
|   └scene.ts  场景编辑相关
├─layout
|   └SecurityLayout.tsx
├─components 全局公用组件
├─common 全局属性约束、配置文件
|   ├─antd.ts
|   ├─sceneConfigList.ts
|   └type.ts
├─assets 静态资源
```

### 拓展
1. 增加模型库
2. 已响应编辑面板拖入模型事件，模型库需要作模型文件映射

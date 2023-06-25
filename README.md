## 通用版3d场景编辑器

### 功能
1. 动态导入模型、基础属性编辑（位置、模型属性）
2. 多场景编辑
3.

### 目录结构
```
D:\Desktop\WorkData\062023\universal-3d-editor\src
├─global.less
├─utils
|   ├─common.js
|   ├─opConfigFile.js
|   ├─threeD.js
|   ├─three-correct
|   |       ├─outlinePass.js
|   |       ├─TGALoader.js
|   |       ├─fbxloader
|   |       |     ├─index.js
|   |       |     └inflate.min.js
|   |       ├─exporter
|   |       |    ├─ColladaExporter.js
|   |       |    └ColladaLoader.js
├─style
|   └core.less
├─service
|    ├─address.js
|    ├─constant.js
|    ├─runTD.ts
|    └webSocketReq.js
├─pages
|   ├─main
|   |  ├─index.less
|   |  ├─index.tsx
|   |  ├─wealth
|   |  |   ├─index.less
|   |  |   ├─index.tsx
|   |  |   ├─component
|   |  |   |     ├─RelationshipEditor
|   |  |   |     |         ├─index.less
|   |  |   |     |         └index.tsx
|   |  |   |     ├─ModelLibrary
|   |  ├─topMenu
|   |  |    ├─index.less
|   |  |    ├─index.tsx
|   |  |    ├─utils
|   |  |    |   └getFileType.ts
|   |  |    ├─js
|   |  |    | └choiseAMenuItem.ts
|   |  |    ├─datas
|   |  |    |   └topMenuData.js
|   |  |    ├─component
|   |  |    |     ├─userImg
|   |  |    |     |    ├─index.less
|   |  |    |     |    └index.tsx
|   |  |    |     ├─file
|   |  |    |     |  ├─NewProject
|   |  |    |     |  |     └index.tsx
|   |  |    |     |  ├─ImpFiles
|   |  |    |     |  |    └index.tsx
|   |  |    |     |  ├─ExpFile
|   |  |    |     |  |    └index.tsx
|   |  |    |     ├─aMenuItem
|   |  |    |     |     ├─index.less
|   |  |    |     |     └index.tsx
|   |  |    |     ├─aMenu
|   |  |    |     |   ├─index.less
|   |  |    |     |   └index.tsx
|   |  ├─scene
|   |  |   ├─index.less
|   |  |   ├─index.tsx
|   |  |   ├─component
|   |  |   |     ├─Workbench
|   |  |   |     |     ├─index.less
|   |  |   |     |     └index.tsx
|   |  |   |     ├─ToolBar
|   |  |   |     |    ├─index.less
|   |  |   |     |    └index.tsx
|   |  ├─attribute
|   |  |     ├─index.less
|   |  |     ├─index.tsx
|   |  |     ├─component
|   |  |     |     ├─SelectedModel
|   |  |     |     |       ├─index.less
|   |  |     |     |       └index.tsx
|   |  |     |     ├─EnvConfig
|   |  |     |     |     ├─index.less
|   |  |     |     |     ├─Light.tsx
|   |  |     |     |     └SceneMap.tsx
|   |  |     |     ├─Editor
|   |  |     |     |   ├─index.less
|   |  |     |     |   └index.tsx
|   |  |     |     ├─DataBind
|   |  |     |     |    ├─index.less
|   |  |     |     |    └index.tsx
|   ├─login
|   |   ├─index.less
|   |   └index.tsx
├─models
|   ├─attribute.ts
|   ├─effect.js
|   ├─menu.js
|   ├─scene.js
|   └tree.js
├─components
|     ├─SpecialEffect
|     |       ├─specialEffect.js
|     |       ├─utils
|     |       |   └index.js
|     |       ├─libs
|     |       |  ├─const.js
|     |       |  ├─emitter.js
|     |       |  ├─particle.js
|     |       |  ├─shaders.js
|     |       |  ├─system.js
|     |       |  ├─tween.js
|     |       |  ├─emitters
|     |       |  |    └flame.js
|     ├─RightMenu
|     |     ├─index.less
|     |     └index.tsx
|     ├─ErrorBoundary
|     |       └index.tsx
|     ├─Collapse
|     |    ├─index.less
|     |    └index.tsx
├─common
|   ├─globalThreeD.js
|   └sceneConfigList.js
├─assets
|   ├─attrRefresh.png
|   ├─holderOutlined.png
|   ├─tool-bar
|   |    ├─focusBtn.png
|   |    ├─redoBtn.png
|   |    ├─revokeBtn.png
|   |    ├─rotateBtn.png
|   |    ├─scaleBtn.png
|   |    ├─selectBtn.png
|   |    └translateBtn.png
```

### 拓展

import { Mesh, MeshBasicMaterial, Group, Euler } from 'three';
import {
  TransformArrayToHash,
  freeModelMemory,
  calculateWorldSet,
  degreesToRadians,
} from '@/utils/threeD';
import { isEmpty } from '@/utils/common';
import { ModelType } from '@/common/type';

type ModelData = THREE.Group | THREE.Mesh;

//该文件中所有 @ts-ignore 注释都是用于解决由于无法准确定位外部导入模型的 ts 类型导致的类型推论错误问题

export interface SceneState {
  transformControlMode:
    | 'disable'
    | 'translate'
    | 'rotate'
    | 'scale'
    | 'focus'
    | 'selectRect'
    | 'selectCurve';
  transformStatus: any;
  workbenchModel: null | THREE.Object3D;
  workbenchModelHash: { [k: string]: THREE.Object3D };
  selectedModel: null | THREE.Object3D;
  multipleChoiceNodes: { [k: number]: 1 };
  multipleChoiceModels: any[];
  outlinePassModel: null | THREE.Object3D;

  allModelConfigList: [];
  cfgFileMdlUniqueKey: '';
  sceneEnv: string;
  customSceneEnvList: { value: string; label: string }[];
  sceneRefreshTrigger: number;
  forceUpdateModel: boolean;
}

const original: SceneState = {
  transformControlMode: 'disable', // 控制器模式
  transformStatus: {}, // 模型初始偏移
  workbenchModel: null, // 当前工作台的模型
  workbenchModelHash: {}, // 当前工作台模型的哈希结构
  selectedModel: null, // 选中的模型
  multipleChoiceNodes: {}, // 多选模型的 id 列表
  multipleChoiceModels: [], // 多选模型列表

  outlinePassModel: null, // 给 outlinePass 使用的模型，绑定 selectedModel
  allModelConfigList: [],
  cfgFileMdlUniqueKey: '',
  sceneEnv: '', // 场景环境贴图url
  customSceneEnvList: [], // 环境贴图列表
  sceneRefreshTrigger: 0, // 用于刷新模型属性面板
  forceUpdateModel: true, // workbenchModel 强制刷新
};

const SceneModel: ModelType<SceneState> = {
  namespace: 'scene',

  state: original,

  effects: {},
  reducers: {
    // 清除缓存，还原数据
    clear: (state) => {
      freeModelMemory(state.workbenchModel);
      freeModelMemory(state.outlinePassModel);

      return original;
    },

    updateMultipleChoiceNodes: (state, action) => {
      state.multipleChoiceNodes = action.payload;
    },

    // 更改控制器模式
    modifyTransformControlMode: (state, action) => {
      // console.log('here', action);
      state.transformControlMode = action.payload;
    },

    modifyTransformStatus: (state, action) => {
      state.transformStatus = {
        ...state.transformStatus,
        ...action.payload,
      };
    },

    // 构建工作台模型
    initWorkbenchModel: (state, action) => {
      state.selectedModel = null;
      freeModelMemory(state.outlinePassModel);
      state.outlinePassModel = null;
      // 移除旧模型，导入新模型
      freeModelMemory(state.workbenchModel!);
      window.scene.remove(state.workbenchModel!);

      if (!isEmpty(action.payload)) {
        state.workbenchModel = action.payload;
        window.scene.add(state.workbenchModel!);
        // 保存模型所有子项到哈希表中，方便在关系列表中更快读取
        state.workbenchModelHash = TransformArrayToHash(
          action.payload.children,
        ) as { [k: string]: THREE.Object3D };
      } else {
        state.workbenchModel = null;
        state.workbenchModelHash = {};
      }
      state.forceUpdateModel = !state.forceUpdateModel;
    },

    // 动态导入模型时
    updateWorkbenchModel: (state, action) => {
      // console.log(action.payload);
      const { model, modelHash, type = 'update', id } = action.payload;

      switch (type) {
        case 'update': {
          if (isEmpty(model) && isEmpty(modelHash)) {
            break;
          }
          model.forEach((item: THREE.Object3D) => {
            state.workbenchModel!.remove(item);
            state.workbenchModel!.add(item);
          });

          function loopUpdate(array: THREE.Object3D[]) {
            array.forEach((item) => {
              state.workbenchModelHash[item.id] = item;
              if (item?.children.length != 0) {
                loopUpdate(item.children);
              }
            });
          }
          loopUpdate(modelHash);
          break;
        }
        case 'add': {
          if (isEmpty(model) && isEmpty(modelHash)) {
            break;
          }
          Object.assign(state.workbenchModelHash, modelHash);
          if (state.workbenchModel !== null) {
            model.forEach((o: THREE.Object3D) => state.workbenchModel!.add(o));
          } else {
            const group = new Group();
            model.forEach((o: THREE.Object3D) => group.add(o));
            state.workbenchModel = group;
            window.scene.add(group);
          }
          break;
        }
        case 'delete': {
          if (typeof id == 'undefined') {
            break;
          }
          // 如果当前模型被选中
          if (state.selectedModel?.id === id) {
            state.selectedModel = null;
          }
          state.workbenchModelHash[id].removeFromParent();
          // freeModelMemory(state.workbenchModelHash[id]);
          state.workbenchModelHash[id].traverse((child) => {
            delete state.workbenchModelHash[child.id];
            if ('isMesh' in child) {
              // @ts-ignore
              child.geometry.dispose(); // 删除几何体
              //@ts-ignore
              if (child.material.dispose instanceof Function) {
                //@ts-ignore
                child.material.dispose(); // 删除材质
              }
            }
          });
          break;
        }
        default:
          break;
      }

      state.forceUpdateModel = !state.forceUpdateModel;
    },

    updateSelectedModel: (state, action) => {
      // console.log('action', action);
      // return;
      const { payload } = action;

      if (
        state.selectedModel === null ||
        payload === null ||
        payload.id !== state.selectedModel.id
      ) {
        state.selectedModel = payload;
        // 如果曾经在 outlinePass 中添加过模型，从场景从删除
        if (state.outlinePassModel !== null) {
          window.scene.remove(state.outlinePassModel);
          freeModelMemory(state.outlinePassModel);
        }
        // console.log('payload', payload);
        if (payload === null || payload.isGroup) {
          state.outlinePassModel = null;
        } else {
          // 赋予场景独立的边框高亮模型对象
          // 模型轴指向未解决，故取消 outlinePass 高亮模型的引用
          let outlinePassModel = new Mesh(
            payload.geometry,
            new MeshBasicMaterial({
              transparent: true,
              opacity: 0,
            }),
          );
          calculateWorldSet(payload, outlinePassModel);
          state.outlinePassModel = outlinePassModel;
          window.scene.add(outlinePassModel);
        }
      }
    },

    // 传过来的是一条树分支上的 modelHash 数据, eg: [层一ID, 层二ID]
    modifyModel: (state, action) => {
      const modelIdList = action.payload.modifyList,
        attribute = action.payload.attribute;
      const attrKeys = Object.keys(attribute) as 'name'[];

      state.workbenchModel!.remove(state.workbenchModelHash[modelIdList[0]]); // 顶部储存根节点

      for (let i = modelIdList.length; i > 0; i--) {
        // 尾节点为需要直接修改的点
        if (i == modelIdList.length) {
          attrKeys.forEach((attr) => {
            state.workbenchModelHash[modelIdList[i - 1]][attr] =
              attribute[attr];
          });
        } else {
          // 其他节点为尾节点的父节点
          let targetChildren = state.workbenchModelHash![
            modelIdList[i - 1]
          ].children.find((child) => child.id == modelIdList[i]);
          state.workbenchModelHash[modelIdList[i - 1]].remove(targetChildren!);
          state.workbenchModelHash[modelIdList[i - 1]].add(
            state.workbenchModelHash[modelIdList[i]],
          );
        }
      }
      state.workbenchModel!.add(state.workbenchModelHash[modelIdList[0]]);
    },

    // 属性编辑出修改模型有所不同，直接通过原模型上增删修改元素便可，其他引用到该修改模型的模型，数据自动变化自动
    modifySelectedModel: (state, action) => {
      // console.log('modifySelectedModel', action.payload);

      for (let attr in action.payload) {
        // 模型属性不是简单的赋值，需要调用特定的方法，所以需要逐个判定
        if (attr === 'position') {
          state.selectedModel!.position.copy(action.payload[attr]);
          // 如果选中的是整个 group 则不需要借助 outlinePassModel 实现高亮，它为 null
          state.outlinePassModel !== null &&
            state.outlinePassModel.position.copy(
              state.selectedModel!.getWorldPosition(window.vector3),
            );
          break;
        } else if (attr === 'scale') {
          state.selectedModel!.scale.copy(action.payload[attr]);
          state.outlinePassModel !== null &&
            state.outlinePassModel.scale.copy(action.payload[attr]);
          break;
        } else if (attr === 'rotate') {
          const { x, y, z } = action.payload.rotate;
          // 创建一个Euler对象
          const euler = new Euler(
            degreesToRadians(x),
            degreesToRadians(y),
            degreesToRadians(z),
            'XYZ',
          );

          state.selectedModel!.quaternion.setFromEuler(euler);
          state.outlinePassModel !== null &&
            state.outlinePassModel.quaternion.copy(
              state.selectedModel!.getWorldQuaternion(window.quaternion),
            );
          break;
        } else if (attr === 'material') {
          const { material } = action.payload;
          // @ts-ignore
          if (Array.isArray(state.selectedModel.material)) {
            if (
              // @ts-ignore
              state.selectedModel.material[material.side].dispose instanceof
              Function
            ) {
              // @ts-ignore
              state.selectedModel.material[material.side].dispose(); // 删除材质
            }
            // @ts-ignore
            state.selectedModel.material[material.side] = material.current;
          } else {
            // @ts-ignore
            if (state.selectedModel.material.dispose instanceof Function) {
              // @ts-ignore
              state.selectedModel.material.dispose(); // 删除材质
            }
            // @ts-ignore
            state.selectedModel.material = material;
          }
        } else {
          // 其他属性暂且直接赋值
          // @ts-ignore
          state.selectedModel[attr] = action.payload[attr];
        }
      }

      state.sceneRefreshTrigger++;

      // 更正！修改属性值不需要内存管理，因为引用的是同一个对象地址
      // const oldModel = state.workbenchModel.getObjectById(state.selectedModel.id);
      // state.workbenchModel.remove(oldModel);
    },

    // 修改模型材质, 单材质
    modifySelectedModelMaterialSingle: (state, action) => {
      // console.log('modifySelectedModelMaterialSingle', action.payload);

      if (action.payload.material) {
        // @ts-ignore
        state.selectedModel.material = action.payload.material;
      } else {
        for (let attr in action.payload.attribute) {
          // @ts-ignore
          state.selectedModel.material[attr] = action.payload.attribute[attr];
          // @ts-ignore
          const { metalness, roughness } = state.selectedModel.material;
          if (attr === 'roughness') {
            // @ts-ignore
            state.selectedModel.material.name = `standar-${metalness}-${action.payload.attribute[attr]}`;
          } else if (attr === 'metalness') {
            // @ts-ignore
            state.selectedModel.material.name = `standar-${action.payload.attribute[attr]}-${roughness}`;
          }
        }
      }

      state.sceneRefreshTrigger++;
    },

    // 修改模型材质, 复合材质
    modifySelectedModelMaterialMultiple: (state, action) => {
      // console.log('modifySelectedModelMaterialMultiple', action.payload);

      if (action.payload.material) {
        // @ts-ignore
        state.selectedModel.material[action.payload.side] =
          action.payload.material;
      } else {
        for (let attr in action.payload.attribute) {
          // @ts-ignore
          state.selectedModel.material[action.payload.side][attr] =
            action.payload.attribute[attr];
        }
      }

      state.sceneRefreshTrigger++;
    },

    // 同步边缘高亮对象和 selectedModel 的更改
    synchronousModelChange: (state) => {
      if (state.selectedModel !== null && state.outlinePassModel !== null) {
        switch (state.transformControlMode) {
          case 'translate': {
            state.outlinePassModel.position.copy(
              state.selectedModel.getWorldPosition(window.vector3),
            );
            break;
          }
          case 'scale': {
            state.outlinePassModel.scale.copy(
              state.selectedModel.getWorldScale(window.vector3),
            );
            // https://github.com/alindas/3d-editor/issues/3
            state.outlinePassModel.quaternion.copy(
              state.selectedModel.getWorldQuaternion(window.quaternion),
            );
            break;
          }
          case 'rotate': {
            state.outlinePassModel.quaternion.copy(
              state.selectedModel.getWorldQuaternion(window.quaternion),
            );
            break;
          }
          default:
            break;
        }
      }
    },

    // 刷新属性面板
    refreshAttrBoard(state) {
      state.sceneRefreshTrigger++;
    },

    // 改变当前工程的模型配置
    // changeModelConfigList(state, action) {
    //   // xxxx
    //   let temp = state.modelsConfig.map((i) => ({ ...i }));
    //   let temp1 = state.cfgFileMdlUniqueKey;
    //   temp.map((item, index) => {
    //     if (item.saveUniqueKey == temp1) {
    //       temp.splice(index, 1);
    //     }
    //   });
    //   temp.map((item, index) => {
    //     // 无法根据name+时间戳进行判断，因为前一个时间戳和后一个时间戳不一样
    //     if (item.ID == action.payload.ID) {
    //       temp.splice(index, 1);
    //     }
    //   });
    //   temp.push(action.payload);
    //   // console.log('scene-temp', temp);
    //   state.modelsConfig = temp;
    // },

    saveOldUniqueKey: (state, action) => {
      state.cfgFileMdlUniqueKey = action.payload;
    },

    updateWorkbenchModelHash(state, action) {
      state.workbenchModelHash = action.payload;
    },

    updateSceneEnv(state, action) {
      state.sceneEnv = action.payload;
    },

    // 更新场景贴图列表
    updateCustomSceneEnvList(state, action) {
      state.sceneEnv = action.payload.url;
      state.customSceneEnvList.push(action.payload.option);
    },
  },
};

export default SceneModel;

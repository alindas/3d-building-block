import { ModelType } from '@/common/type';

type ProjectObj = {
  name: string;
  models: {
    name: string;
    url: string;
  }[];
} | null;

export interface ProjectState {
  projectInfo: ProjectObj;
  lightConfig: object;
  cameraConfig: {
    position?: number[];
    orbitControlTarget?: number[];
  };
  modelsConfig: object[];
}

const ProjectState: ModelType<ProjectState> = {
  namespace: 'project',

  state: {
    projectInfo: null, //工程信息
    lightConfig: {}, // 工程灯光配置
    cameraConfig: {}, // 工程相机配置
    modelsConfig: [], //工程模型配置
  },

  effects: {},

  reducers: {
    // 保存工程信息，当新建工程时
    saveProject: (state, action) => {
      const { config, ...rest } = action.payload;
      window.projectInfo = rest;
      return {
        projectInfo: rest,
        lightConfig: config.lightConfig,
        cameraConfig: config.cameraConfig,
        modelsConfig: config.modelsConfig,
      };
    },

    updateProject: (state, action) => {
      window.projectInfo = action.payload.projectInfo;
      return { ...state, ...action.payload };
    },

    // 设置当前工程的摄像机配置
    setCameraConfig(state, action) {
      state.cameraConfig = action.payload;
    },

    // 赋值当前工程的灯光配置
    initLightConfig(state, action) {
      state.lightConfig = action.payload;
    },

    // 改变当前工程的灯光配置
    changeLightConfig(state, action) {
      state.lightConfig = {
        ...state.lightConfig,
        ...action.payload,
      };
    },

    // 赋值当前工程的模型配置
    initModelConfigList(state, action) {
      state.modelsConfig = action.payload;
    },
  },
};

export default ProjectState;

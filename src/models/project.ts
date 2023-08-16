import { ModelType } from '@/common/type';

type ProjectObj = {
  name: string;
  open: boolean;
};

export type TConfig = {
  modelConfig?: {
    files?: {
      name: string;
      url: string;
    }[];
  };
  cameraConfig?: {
    position?: number[];
    orbitControlTarget?: number[];
  };
  lightConfig?: {
    name: string;
    type: 'AmbientLight' | 'DirectionalLight' | 'PointLight' | 'SpotLight';
    position: number[];
    rotate: number[];
    intensity: number;
    color: string;
    castShadow: boolean;
    visible: boolean;
  }[];
};

export interface ProjectState {
  projectId: number;
  projectInfo: ProjectObj;
  lightConfig: TConfig['lightConfig'];
  cameraConfig: TConfig['cameraConfig'];
  modelsConfig: TConfig['modelConfig'];
}

const ProjectState: ModelType<ProjectState> = {
  namespace: 'project',

  state: {
    projectId: -1,
    projectInfo: {
      name: '',
      open: false,
    }, //工程信息
    lightConfig: [], // 工程灯光配置
    cameraConfig: {}, // 工程相机配置
    modelsConfig: {}, //工程模型配置
  },

  effects: {},

  reducers: {
    // 保存工程信息，当新建工程时
    saveProject: (state, action) => {
      const { id, config, ...rest } = action.payload;
      window.projectId = id;
      return {
        projectId: id,
        projectInfo: rest,
        lightConfig: config.lightConfig ?? [],
        cameraConfig: config.cameraConfig ?? {},
        modelsConfig: config.modelsConfig ?? {},
      };
    },

    updateProject: (state, action) => {
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

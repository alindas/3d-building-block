import { ModelType } from '@/common/type';

export interface IEffectState {
  lightEffect: boolean;
  configEffect: boolean;
}

const EffectState: ModelType<IEffectState> = {
  namespace: 'effect',

  state: {
    lightEffect: false, // 动态更新light配置
    configEffect: false, // 配置文件更新响应扳机
  },

  effects: {},

  reducers: {
    updateLightEffect: (state) => {
      state.lightEffect = !state.lightEffect;
    },
    updateConfigEffect: (state) => {
      state.configEffect = !state.configEffect;
    },
  },
};

export default EffectState;

import { ModelType } from '@/common/type';

export interface IEffectState {
  lightEffect: boolean;
}

const EffectState: ModelType<IEffectState> = {
  namespace: 'effect',

  state: {
    lightEffect: false, // 动态更新light配置
  },

  effects: {},

  reducers: {
    updateLightEffect: (state) => {
      state.lightEffect = !state.lightEffect;
    },
  },
};

export default EffectState;

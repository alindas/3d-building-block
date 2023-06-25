import { Dispatch, Effect } from 'umi';

// dva model 类型
export interface ModelType<T> {
  namespace: string;
  state: T;
  effects?: {
    [k: string]: Effect;
  };
  reducers: {
    [k: string]: (S: T, A: any) => T | void;
  };
}

// dva model 连接组件的 props 类型
export type ConnectProps<T extends object> = {
  [k in keyof T]: T[k];
} & {
  dispatch: Dispatch;
};

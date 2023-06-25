import { ModelType } from '@/common/type';

export interface AttributeState {
  [k: string]: any;
}

const AttributeModel: ModelType<AttributeState> = {
  namespace: 'attribute',
  state: {},
  effects: {},
  reducers: {},
};
export default AttributeModel;

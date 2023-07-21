import { getDvaApp } from 'umi';

/** 需要为上命令记录的 model 操作 */
let dispatch: any;
window.onload = () => {
  dispatch = getDvaApp()._store.dispatch;
};

export function updateSelectedModel(payload: any) {
  window.cmd.executeCommand(() =>
    dispatch({
      type: 'scene/updateSelectedModel',
      payload,
    }),
  );
}

// 修改复合材质
export function modifySelectedModelMaterialMultiple(payload: any) {
  window.cmd.executeCommand(() =>
    dispatch({
      type: 'scene/modifySelectedModelMaterialMultiple',
      payload,
    }),
  );
}

// 修改单个材质
export function modifySelectedModelMaterialSingle(payload: any) {
  window.cmd.executeCommand(() =>
    dispatch({
      type: 'scene/modifySelectedModelMaterialSingle',
      payload,
    }),
  );
}

// 修改模型属性
export function modifySelectedModel(payload: any) {
  window.cmd.executeCommand(() =>
    dispatch({
      type: 'scene/modifySelectedModel',
      payload,
    }),
  );
}

import { getDvaApp } from 'umi';

/** 需要上记录的 model 操作 */
// 拆包下失效
// let dispatch: any;
// window.onload = () => {
//   dispatch = getDvaApp()._store.dispatch;
// };

const dispatch = getDvaApp()._store.dispatch;

export function updateSelectedModel(payload: any) {
  window.cmd.executeCommand(() =>
    dispatch({
      type: 'scene/updateSelectedModel',
      payload,
    }),
  );
}

export function updateWorkbenchModel(payload: any) {
  window.cmd.executeCommand(
    () =>
      dispatch({
        type: 'scene/updateWorkbenchModel',
        payload,
      }),
    payload?.type === 'update' ? undefined : () => null,
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

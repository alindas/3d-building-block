import { getDvaApp } from 'umi';

let dispatch: any;
window.onload = () => {
  dispatch = getDvaApp()._store.dispatch;
};

export function modifyTransformControlMode(type: string) {
  window.cmd.executeCommand(() =>
    dispatch({
      type: 'scene/modifyTransformControlMode',
      payload: type,
    }),
  );
}

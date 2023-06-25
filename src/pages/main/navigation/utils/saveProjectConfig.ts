import { getDvaApp } from 'umi';

// 保存当前工程配置信息
function saveProjectConfig() {
  let position: number[] = [0, 0, 0];
  let orbitControlTarget: any = window.orbitControl.target.toArray() ?? [
    0, 0, 0,
  ];
  for (let o of window.scene.children) {
    if (o.type === 'PerspectiveCamera') {
      position = o.position.toArray();
      break;
    }
  }

  getDvaApp()._store.dispatch({
    type: 'project/setCameraConfig',
    payload: {
      position,
      orbitControlTarget,
    },
  });
}

export default saveProjectConfig;

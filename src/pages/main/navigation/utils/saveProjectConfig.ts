import { getDvaApp } from 'umi';

// 获取当前场景配置数据
export function getConfig() {
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

  return {
    position,
    orbitControlTarget,
  };
}

// 保存当前工程配置信息
function saveProjectConfig() {
  getDvaApp()._store.dispatch({
    type: 'project/setCameraConfig',
    payload: getConfig(),
  });
}

export default saveProjectConfig;

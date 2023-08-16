import { Euler, MathUtils } from 'three';
import { getDvaApp, ProjectState } from 'umi';

// 获取当前场景配置数据
export function getConfig(): ProjectState {
  // console.log(window.scene)
  let position: number[] = [0, 0, 0];
  let lights = [];
  let orbitControlTarget: any = window.orbitControl.target.toArray() ?? [
    0, 0, 0,
  ];
  for (let o of window.scene.children) {
    if (o.type === 'PerspectiveCamera') {
      position = o.position.toArray();
    }
    // @ts-ignore
    if (o.isLight) {
      let euler = new Euler().setFromQuaternion(o.quaternion, 'XYZ');
      lights.push({
        type: o.type,
        name: o.name,
        position: o.position.toArray(),
        rotate: [
          MathUtils.radToDeg(euler.x),
          MathUtils.radToDeg(euler.x),
          MathUtils.radToDeg(euler.x),
        ],
        // @ts-ignore
        intensity: o.intensity,
        // @ts-ignore
        color: o.color.getStyle(),
        castShadow: o.castShadow,
        visible: o.visible,
      });
    }
  }

  return {
    // @ts-ignore
    lightConfig: lights,
    cameraConfig: {
      position,
      orbitControlTarget,
    },
  };
}

// 保存当前工程配置信息
function saveProjectConfig() {
  const config = getConfig();
  const store = getDvaApp()._store;
  store.dispatch({
    type: 'project/updateProject',
    payload: config,
  });
  store.dispatch({
    type: 'effect/updateConfigEffect',
  });
  return config;
}

export default saveProjectConfig;

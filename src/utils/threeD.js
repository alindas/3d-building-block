import * as THREE from 'three';
import { message } from 'antd';

export function parseModelUrl(url, config) {
  switch (url) {
    case 'ambient': {
      message.info('模型缺失');
      break;
    }

    case 'direction': {
      const direction = new THREE.DirectionalLight();
      direction.position.copy(config.position);
      window.scene.add(direction);

      const directionalLightHelper = new THREE.DirectionalLightHelper(
        direction,
        5,
      );
      directionalLightHelper.position.copy(direction.position);
      window.scene.add(directionalLightHelper);
      break;
    }

    case 'point': {
      const point = new THREE.PointLight();
      point.position.copy(config.position);
      window.scene.add(point);

      const pointLightHelper = new THREE.PointLightHelper(point, 5);
      pointLightHelper.position.copy(point.position);
      point.userData.helper = pointLightHelper.id;
      window.scene.add(pointLightHelper);

      break;
    }

    case 'hemisphere': {
      message.info('模型缺失');
      break;
    }

    case 'spot': {
      const spot = new THREE.SpotLight();
      spot.position.copy(config.position);
      window.scene.add(spot);

      const spotLightHelper = new THREE.SpotLightHelper(spot);
      spotLightHelper.position.copy(spot.position);
      window.scene.add(spotLightHelper);
      break;
    }

    default:
      break;
  }
}

/**
 * 将 current 模型与 origin 模型的位置对应
 * @param {THREE.Object3D} origin
 * @param {THREE.Object3D} current
 */
export function calculateWorldSet(origin, current) {
  current.position.copy(origin.getWorldPosition(new THREE.Vector3()));
  current.quaternion.copy(origin.getWorldQuaternion(new THREE.Quaternion()));
  current.scale.copy(origin.getWorldScale(new THREE.Vector3()));
}

// 将 THREE.Group 结构转换成 Hash 结构，取 id 值作为 key
export function TransformArrayToHash(array) {
  const target = {};

  const loopSet = (_array) => {
    _array?.forEach((item) => {
      target[item.id] = item;
      if (item.children.length != 0) {
        loopSet(item.children);
      }
    });
  };

  loopSet(array);

  return target;
}

// 创建文本贴图
export function makeTextTexture(text, color) {
  let canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 24;
  let context = canvas.getContext('2d');
  context.font = '900 18px serif';
  context.fillStyle = color;
  context.fillText(text, 0, 24);

  return canvas;
}

// 判断材质属性是否被修改过，没被修改过则返回一个全新的材质对象
export function checkMaterialModifyTime(material) {
  if (!material.userData.haveModify) {
    const newMaterial = material.clone();
    newMaterial.userData.haveModify = true;
    return newMaterial;
  }
  return true;
}

// 删除模型时回收其材质和几何体内存
export function freeModelMemory(model) {
  if (typeof model === 'undefined' || model === null) return;
  model.traverse((child) => {
    if (child.isMesh) {
      child.geometry.dispose(); // 删除几何体
      if (child.material.dispose instanceof Function) {
        child.material.dispose(); // 删除材质
      }
    }
  });
}

// 如果当前选择的模型控件存在父子关系的父控件，则改为选择其父控件
export function loopUpBind(model) {
  if (model && model.parent) {
    if (model.parent?.isGroup) {
      return model;
    } else {
      return loopUpBind(model.parent);
    }
  } else {
    return undefined;
  }
}

// 找出某个树支点对应的整条树分支线 id 并更新原数组
export function updateModelFromName(array, keyArray, newValue) {
  const idList = [];

  const loopSet = (_array, keyArray, newValue, idArray, level) => {
    for (let i = 0; i < _array.length; i++) {
      if (i == keyArray[level]) {
        idArray.push(_array[i].id);

        if (level !== keyArray.length - 1) {
          level++;
          loopSet(_array[i].children, keyArray, newValue, idArray, level);
        } else {
          _array[i].title = newValue;
        }

        break;
      }
    }
  };

  loopSet(array, keyArray, newValue, idList, 1);

  return [array, idList];
}

/**
 * 创建坐标轴视图
 * @param {HTMLElement} ele 挂载的节点
 * @param {THREE.camera} camera 建立联系的目标场景相机
 * @return 重新渲染函数
 * @param {THREE.Vector3} obCenter 目标场景控制中心点
 */
export const initAxesScene = (ele, camera) => {
  let axesScene = new THREE.Scene();
  let axesCamera = new THREE.OrthographicCamera(-50, 50, 50, -50, 0.1, 50000);
  axesCamera.position.copy(camera.position);
  axesCamera.up.copy(camera.up);

  axesScene.add(axesCamera);

  let axesRenderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  axesRenderer.setPixelRatio(window.devicePixelRatio);
  axesRenderer.setSize(100, 100);
  if (ele.children.length != 0) {
    ele.removeChild(ele.children[0]);
  }
  ele.appendChild(axesRenderer.domElement);
  ele.style.pointerEvents = 'none';

  // 通过事件穿透代替使用控制器
  // axesControl = new OrbitControls(camera, axesRenderer.domElement);
  // axesControl.enableDamping = true; // 阻尼
  // axesControl.enablePan = false; // 右键拖拽
  // axesControl.enableZoom = false; // 缩放
  // axesControl.target.copy(orbitControl.target);

  const origin = new THREE.Vector3(0, 0, 0),
    length = 38,
    headLength = 8,
    headWidth = 5,
    xDir = new THREE.Vector3(1, 0, 0),
    yDir = new THREE.Vector3(0, 1, 0),
    zDir = new THREE.Vector3(0, 0, 1),
    xHex = 0xc80000, // 红
    yHex = 0x009c00, // 黄
    zHex = 0x0000c3; // 蓝
  const xArrowHelper = new THREE.ArrowHelper(
      xDir,
      origin,
      length,
      xHex,
      headLength,
      headWidth,
    ),
    yArrowHelper = new THREE.ArrowHelper(
      yDir,
      origin,
      length,
      yHex,
      headLength,
      headWidth,
    ),
    zArrowHelper = new THREE.ArrowHelper(
      zDir,
      origin,
      length,
      zHex,
      headLength,
      headWidth,
    );
  axesScene.add(xArrowHelper, yArrowHelper, zArrowHelper);

  const xSpriteMaterial = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(makeTextTexture('X', '#c80000')),
    }),
    ySpriteMaterial = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(makeTextTexture('Y', '#009c00')),
    }),
    zSpriteMaterial = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(makeTextTexture('Z', '#0000c3')),
    });
  const xSprite = new THREE.Sprite(xSpriteMaterial),
    ySprite = new THREE.Sprite(ySpriteMaterial),
    zSprite = new THREE.Sprite(zSpriteMaterial);
  xSprite.position.set(38, 15, 3);
  xSprite.scale.set(20, 20, 0);
  ySprite.position.set(15, 38, 3);
  ySprite.scale.set(20, 20, 0);
  zSprite.position.set(-3, 15, 38);
  zSprite.scale.set(20, 20, 0);

  axesScene.add(xSprite, ySprite, zSprite);

  return (orbitControlCenter) => {
    // 坐标轴跟随移动, 需要减去 orbitControl 的控制中心
    // axesCamera.position.copy(camera.position.add(orbitControl.target.negate())); // Vector3.negate() 会改变自身值
    axesCamera.position.subVectors(
      camera.position,
      orbitControlCenter ?? new THREE.Vector3(0, 0, 0),
    );
    axesCamera.position.clampLength(50, 50); // 限制成像大小
    axesCamera.lookAt(0, 0, 0);

    // 默认点光源跟随移动
    // spotLight.position.copy(camera.position);

    axesRenderer.render(axesScene, axesCamera);
  };
};

/**
 * 获取模型 orbitControl 中心点和摄像机中心成像位置
 * @param {THREE.Object3D} model 需要计算的模型对象
 * @return 模型中心及模型半径
 */
export function getModelCenter(model) {
  const boxHelper = new THREE.BoxHelper(model);
  const radius = boxHelper.geometry.boundingSphere.radius;
  const center = boxHelper.geometry.boundingSphere.center;

  return {
    center,
    radius,
  };
}

// 各个方向为近 30 度偏转
const ViewingAngle = [
  new THREE.Vector3(0, 1, 2).normalize(), // 前上
  new THREE.Vector3(0, -1, 2).normalize(), // 前下
  new THREE.Vector3(-2, 0, 1).normalize(), // 前左
  new THREE.Vector3(2, 0, -1).normalize(), // 前右
  new THREE.Vector3(0, 1, -2).normalize(), // 后上
  new THREE.Vector3(0, -1, -2).normalize(), // 后下
  new THREE.Vector3(-2, 0, -1).normalize(), // 后左
  new THREE.Vector3(2, 0, -1).normalize(), // 后右
  new THREE.Vector3(0, 1, 2).normalize(), // 上前
  new THREE.Vector3(0, 1, -2).normalize(), // 上后
  new THREE.Vector3(-2, 1, 0).normalize(), // 上左
  new THREE.Vector3(2, 1, 0).normalize(), // 上右
  new THREE.Vector3(-1, 0, 2).normalize(), // 左前
  new THREE.Vector3(-1, 0, -2).normalize(), // 左后
  new THREE.Vector3(-1, 2, 0).normalize(), // 左上
  new THREE.Vector3(-1, -2, 0).normalize(), // 左下
  new THREE.Vector3(1, 0, 2).normalize(), // 右前
  new THREE.Vector3(1, 0, -2).normalize(), // 右后
  new THREE.Vector3(1, 2, 0).normalize(), // 右上
  new THREE.Vector3(1, -2, 0).normalize(), // 右下
];
const HESAGON = [
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(1, 0, 0),
];
/**
 * 计算物体中心距离其六个表面所穿过的模型数量，返回最小的面对应的点(最佳观看角度)
 * @param model 模型
 * @param {THREE.Vector3} center 模型包围盒中心点
 * @param {number} radius 模型包围盒半径
 * @return Vector3
 */

export function getBestViewingPosition(model, center, radius) {
  let bestPos = new THREE.Vector3();
  let bestDirection = new THREE.Vector3();
  let intersectsCount = 10000;
  const sideCenter = HESAGON.map((agon) =>
    new THREE.Vector3().copy(center).addScaledVector(agon, radius),
  );
  ViewingAngle.forEach((side, index) => {
    const raycaster = new THREE.Raycaster(
      sideCenter[index % 4],
      side,
      0,
      radius * 1.5,
    );
    // const raycaster = new THREE.Raycaster(center, side, 0, radius * 2);
    let intersects = raycaster.intersectObjects(model.children);
    // console.log('o', intersects.length);

    if (intersects.length < intersectsCount) {
      intersectsCount = intersects.length;
      bestDirection.copy(side);
    }
  });

  bestPos.copy(center);
  return bestPos.addScaledVector(bestDirection, radius * 1.5);
}

import * as THREE from 'three';

function getAxisMaterial(color) {
  return new THREE.MeshBasicMaterial({ color: color, toneMapped: false });
}

function getSpriteMaterial(color, text = null) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;

  const context = canvas.getContext('2d');
  context.beginPath();
  context.arc(32, 32, 16, 0, 2 * Math.PI);
  context.closePath();
  context.fillStyle = color.getStyle();
  context.fill();

  if (text !== null) {
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.fillStyle = '#000000';
    context.fillText(text, 32, 41);
  }

  const texture = new THREE.CanvasTexture(canvas);

  return new THREE.SpriteMaterial({ map: texture, toneMapped: false });
}

/**
 * 创建坐标轴视图-v2
 * @param {HTMLElement} ele 挂载的节点，100size
 * @param {THREE.camera} camera 建立联系的目标场景相机
 * @param up 方位改变时
 * @return 重新渲染函数
 * @param {THREE.Vector3} obCenter 目标场景控制中心点
 */
const initViewHelper = (ele, camera, changeUp) => {
  const { width, height, left, top } = ele.getBoundingClientRect();
  const { far, near } = camera;
  const size = width > height ? height : width;
  const axis_length = size * 0.325;
  const axis_width = size * 0.1625;
  const axis_pos = size * 0.4;
  const axis_text = size * 0.3;
  const axis_text_ng = size * 0.25;
  let scene = new THREE.Scene();
  let axesCamera = new THREE.OrthographicCamera(
    size / -2,
    size / 2,
    size / 2,
    size / -2,
    near,
    far,
  );
  axesCamera.position.copy(camera.position);
  axesCamera.up.copy(camera.up);
  scene.add(axesCamera);

  const interactiveObjects = [];
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  if (ele.children.length != 0) {
    ele.removeChild(ele.children[0]);
  }
  ele.appendChild(renderer.domElement);
  // ele.style.pointerEvents = 'none';
  renderer.domElement.addEventListener(
    'click',
    function (ev) {
      mouse.x = ((ev.clientX - left) / width) * 2 - 1;
      mouse.y = -((ev.clientY - top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, axesCamera);
      const intersects = raycaster.intersectObjects(interactiveObjects);
      if (intersects.length > 0) {
        changeUp(intersects[0].object.userData.type);
        return true;
      } else {
        return false;
      }
    },
    true,
  );

  const geometry = new THREE.BoxGeometry(axis_length, 1, 1).translate(
    axis_width,
    0,
    0,
  );

  const color1 = new THREE.Color('#ff3653');
  const color2 = new THREE.Color('#8adb00');
  const color3 = new THREE.Color('#2c8fff');
  const xAxis = new THREE.Mesh(geometry, getAxisMaterial(color1));
  const yAxis = new THREE.Mesh(geometry, getAxisMaterial(color2));
  const zAxis = new THREE.Mesh(geometry, getAxisMaterial(color3));

  yAxis.rotation.z = Math.PI / 2;
  zAxis.rotation.y = -Math.PI / 2;

  scene.add(xAxis);
  scene.add(zAxis);
  scene.add(yAxis);

  const posXAxisHelper = new THREE.Sprite(getSpriteMaterial(color1, 'X'));
  posXAxisHelper.userData.type = 'posX';
  const posYAxisHelper = new THREE.Sprite(getSpriteMaterial(color2, 'Y'));
  posYAxisHelper.userData.type = 'posY';
  const posZAxisHelper = new THREE.Sprite(getSpriteMaterial(color3, 'Z'));
  posZAxisHelper.userData.type = 'posZ';
  const negXAxisHelper = new THREE.Sprite(getSpriteMaterial(color1));
  negXAxisHelper.userData.type = 'negX';
  const negYAxisHelper = new THREE.Sprite(getSpriteMaterial(color2));
  negYAxisHelper.userData.type = 'negY';
  const negZAxisHelper = new THREE.Sprite(getSpriteMaterial(color3));
  negZAxisHelper.userData.type = 'negZ';

  posXAxisHelper.position.x = axis_pos;
  posXAxisHelper.scale.setScalar(axis_text);
  posYAxisHelper.position.y = axis_pos;
  posYAxisHelper.scale.setScalar(axis_text);
  posZAxisHelper.position.z = axis_pos;
  posZAxisHelper.scale.setScalar(axis_text);
  negXAxisHelper.position.x = -axis_pos;
  negXAxisHelper.scale.setScalar(axis_text_ng);
  negYAxisHelper.position.y = -axis_pos;
  negYAxisHelper.scale.setScalar(axis_text_ng);
  negZAxisHelper.position.z = -axis_pos;
  negZAxisHelper.scale.setScalar(axis_text_ng);

  scene.add(posXAxisHelper);
  scene.add(posYAxisHelper);
  scene.add(posZAxisHelper);
  scene.add(negXAxisHelper);
  scene.add(negYAxisHelper);
  scene.add(negZAxisHelper);

  interactiveObjects.push(posXAxisHelper);
  interactiveObjects.push(posYAxisHelper);
  interactiveObjects.push(posZAxisHelper);
  interactiveObjects.push(negXAxisHelper);
  interactiveObjects.push(negYAxisHelper);
  interactiveObjects.push(negZAxisHelper);

  const point = new THREE.Vector3();

  return (orbitControlCenter) => {
    // 坐标轴跟随移动, 需要减去 orbitControl 的控制中心
    axesCamera.position.subVectors(
      camera.position,
      orbitControlCenter ?? new THREE.Vector3(0, 0, 0),
    );
    axesCamera.position.clampLength(size / 2, size / 2); // 限制成像大小
    axesCamera.lookAt(0, 0, 0);

    point.set(0, 0, 1);
    point.applyQuaternion(camera.quaternion);

    if (point.x >= 0) {
      posXAxisHelper.material.opacity = 1;
      negXAxisHelper.material.opacity = 0.5;
    } else {
      posXAxisHelper.material.opacity = 0.5;
      negXAxisHelper.material.opacity = 1;
    }

    if (point.y >= 0) {
      posYAxisHelper.material.opacity = 1;
      negYAxisHelper.material.opacity = 0.5;
    } else {
      posYAxisHelper.material.opacity = 0.5;
      negYAxisHelper.material.opacity = 1;
    }

    if (point.z >= 0) {
      posZAxisHelper.material.opacity = 1;
      negZAxisHelper.material.opacity = 0.5;
    } else {
      posZAxisHelper.material.opacity = 0.5;
      negZAxisHelper.material.opacity = 1;
    }
    renderer.render(scene, axesCamera);
  };
};

export default initViewHelper;

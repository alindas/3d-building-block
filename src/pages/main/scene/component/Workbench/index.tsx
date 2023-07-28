import { connect, ProjectState, SceneState } from 'umi';
import { message } from 'antd';
import { useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import TWEEN from '@tweenjs/tween.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';

import { OutlinePass } from '@/utils/three-correct/outlinePass';
import {
  getBestViewingPosition,
  getModelCenter,
  initAxesScene,
} from '@/utils/threeD';
import ViewHelper from '@/utils/viewHelper2';
import style from './index.less';
import { isUndefinedOrNull, getClientXY } from '@/utils/common';
import { ConnectProps } from '@/common/type';
import { updateSelectedModel } from '@/models/proxy';

export type TMode = 'translate' | 'rotate' | 'scale';

const NEAR = 0.1,
  FAR = 20000;
let scene: THREE.Scene,
  renderAxes: any,
  viewHelper: any,
  orbitControl: any,
  transformControl: any,
  mouse: any = new THREE.Vector2(),
  raycaster: any, // 点击射线
  camera: THREE.PerspectiveCamera,
  composer: any,
  renderPass: any,
  outlinePass: any,
  effectFXAA: any,
  renderer: THREE.WebGLRenderer,
  spotLight: THREE.SpotLight,
  enableCatch = true,
  offset: [number, number],
  width: number,
  height: number;

/**
 * @param position1 相机当前的位置
 * @param position2 相机的目标位置
 * @param target 需要变更的controls的target
 * @param quaternion 需要变更的相机的quaternion
 */
function animateCamera(
  position1: THREE.Vector3,
  position2: THREE.Vector3,
  target?: THREE.Vector3,
  quaternion?: THREE.Quaternion,
) {
  const QuaternionStart = camera.quaternion.clone();
  const QuaternionEnd = quaternion ?? camera.quaternion.clone();

  new TWEEN.Tween({
    px: position1.x, // 相机当前位置x
    py: position1.y, // 相机当前位置y
    pz: position1.z, // 相机当前位置z
    t: 0,
  })
    .to(
      {
        px: position2.x, // 相机当前位置x
        py: position2.y, // 相机当前位置y
        pz: position2.z, // 相机当前位置z
        t: 1,
      },
      1000,
    )
    .onStart(() => {
      orbitControl.enabled = false;
    })
    .onUpdate(function (this: any) {
      camera.position.set(this._object.px, this._object.py, this._object.pz);
      // camera.quaternion.rotateTowards( QuaternionEnd, this.t * 2 * Math.PI );
      // camera.quaternion.slerp(QuaternionEnd, this.t)
      // camera.quaternion.slerpQuaternions(QuaternionStart, QuaternionEnd, this.t); // 通过slerpQuaternions实现平滑旋转
    })
    .onComplete(function (this: any) {
      orbitControl.enabled = true;
      target && orbitControl.target.copy(target);
      quaternion && camera.quaternion.copy(quaternion);
    })
    .easing(TWEEN.Easing.Cubic.InOut)
    .start();
}

function prepareAnimationData(up: string) {
  const { x, y, z } = camera.position;
  const { x: x2, y: y2, z: z2 } = orbitControl.target;
  const max = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
  const targetQuaternion = new THREE.Quaternion();
  switch (up) {
    case 'posX':
      targetQuaternion.setFromEuler(new THREE.Euler(0, Math.PI * 0.5, 0));
      console.log(camera.quaternion, targetQuaternion);
      animateCamera(
        camera.position,
        new THREE.Vector3(max, y2, z2),
        undefined,
        targetQuaternion,
      );
      break;

    case 'posY':
      targetQuaternion.setFromEuler(new THREE.Euler(-Math.PI * 0.5, 0, 0));
      animateCamera(
        camera.position,
        new THREE.Vector3(x2, max, z2),
        undefined,
        targetQuaternion,
      );
      break;

    case 'posZ':
      targetQuaternion.setFromEuler(new THREE.Euler());
      animateCamera(
        camera.position,
        new THREE.Vector3(x2, y2, max),
        undefined,
        targetQuaternion,
      );
      break;

    case 'negX':
      targetQuaternion.setFromEuler(new THREE.Euler(0, -Math.PI * 0.5, 0));
      animateCamera(
        camera.position,
        new THREE.Vector3(-max, y2, z2),
        undefined,
        targetQuaternion,
      );
      break;

    case 'negY':
      targetQuaternion.setFromEuler(new THREE.Euler(Math.PI * 0.5, 0, 0));
      animateCamera(
        camera.position,
        new THREE.Vector3(x2, -max, z2),
        undefined,
        targetQuaternion,
      );
      break;

    case 'negZ':
      targetQuaternion.setFromEuler(new THREE.Euler(0, Math.PI, 0));
      animateCamera(
        camera.position,
        new THREE.Vector3(x2, y2, -max),
        undefined,
        targetQuaternion,
      );
      break;

    default:
      console.error('ViewHelper: Invalid axis.');
  }
}
const clock = new THREE.Clock();
function animateViewHelper() {
  const delta = clock.getDelta();

  // View Helper

  if (viewHelper.animating === true) {
    viewHelper.update(delta);
  }
}

/**
 * 定位机器人，显示选中信息
 * @param model
 */
function locateModel(model: any, config: any) {
  const realID = model.material.name;
  if (realID in config) {
    message.success(`${config[realID].curValue}-${config[realID].api}`);
  } else if (model.parent !== null) {
    locateModel(model.parent, config);
  }
}

// 设置多通道，当选定模型组成部分时，高亮其边框
function highlightModel() {
  renderPass = new RenderPass(scene, camera);
  outlinePass = new OutlinePass(
    new THREE.Vector2(width, height),
    scene,
    camera,
  );

  outlinePass.edgeStrength = 2.5; // 边框的亮度
  outlinePass.edgeGlow = 1; // 光晕[0,1]
  outlinePass.usePatternTexture = false; // 是否使用父级的材质
  outlinePass.edgeThickness = 1.0; // 边框宽度
  outlinePass.downSampleRatio = 2; // 边框弯曲度
  outlinePass.pulsePeriod = 0; // 呼吸闪烁的速度
  outlinePass.visibleEdgeColor.set(0x39ffff); // 呼吸显示的颜色
  outlinePass.clear = true;

  // 自定义的着色器通道 作为参数
  effectFXAA = new ShaderPass(FXAAShader);
  effectFXAA.uniforms.resolution.value.set(1 / width, 1 / height);
  // effectFXAA.renderToScreen = true;

  composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(outlinePass);
  composer.addPass(effectFXAA);
}

function render() {
  if (composer?.render) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
  // renderAxes(orbitControl.target);
  viewHelper.render(orbitControl.target);
  animateViewHelper();
  orbitControl.update();
}

function autoRefresh() {
  TWEEN.update();
  // 使用通道渲染
  render();

  window.requestAnimationFrame(autoRefresh);
}

function Workbench(
  props: ConnectProps<{
    sceneModel: SceneState;
    projectModel: ProjectState;
  }>,
) {
  const { dispatch } = props;
  const {
    transformControlMode,
    workbenchModel,
    selectedModel,
    outlinePassModel,
  } = props.sceneModel;

  const { cameraConfig } = props.projectModel; //菜单menu中的工程数据

  const threeDom = useRef<null | HTMLDivElement>(null);
  const axesDom = useRef<null | HTMLDivElement>(null);

  // 初始化场景
  useEffect(() => {
    initScene();

    // 主场景在移动过过程中无法捕获模型
    renderer.domElement.addEventListener(
      'mousedown',
      debounce(
        () => {
          enableCatch = true;
          renderer.domElement.onmousemove = debounce(
            () => {
              enableCatch = false;
            },
            800,
            { leading: true },
          );
        },
        500,
        { leading: true },
      ),
      true,
    );

    renderer.domElement.addEventListener(
      'mouseup',
      debounce(
        () => {
          renderer.domElement.onmousemove = null;
        },
        500,
        { leading: true },
      ),
      true,
    );
  }, []);

  // 模型控制器
  useEffect(() => {
    if (
      transformControlMode === 'disable' ||
      transformControlMode === 'focus'
    ) {
      transformControl.enabled = false;
      transformControl.showX = false;
      transformControl.showY = false;
      transformControl.showZ = false;
    } else {
      if (transformControl.enabled === false) {
        transformControl.enabled = true;
        transformControl.showX = true;
        transformControl.showY = true;
        transformControl.showZ = true;
      }
      transformControl.setMode(transformControlMode);
    }

    if (transformControlMode === 'focus' && !isUndefinedOrNull(selectedModel)) {
      focusSelectedModel();
    }
  }, [transformControlMode]);

  // 相机坐标变化后更新相机
  useEffect(() => {
    updateCamera();
  }, [cameraConfig]);

  useEffect(() => {
    if (workbenchModel !== null) {
      // console.log('secene in workbench: ', scene);
      // console.log('workbenchModel---saveModelConfigList', saveModelConfigList);

      // console.log('oldModelId in workbench: ', oldModelId);

      renderer.domElement.addEventListener('mouseup', onModelClick, true); // PC
      renderer.domElement.addEventListener('touchstart', onModelClick, false); // Mobile

      updateCamera();
    }

    return () => {
      renderer.domElement.removeEventListener('mouseup', onModelClick, true); // PC
      renderer.domElement.removeEventListener(
        'touchstart',
        onModelClick,
        false,
      ); // Mobile
    };
  }, [workbenchModel]);

  // redux 上选中的模型变化时更新
  useEffect(() => {
    // console.log('selectedModel', selectedModel);

    if (isUndefinedOrNull(selectedModel)) {
      cancelModelSelect();
    } else {
      // @ts-ignore
      if (selectedModel.isMesh) {
        // 如果选中的是某个物体
        // console.log('outlinePass', outlinePassModel)
        outlinePass.selectedObjects = [outlinePassModel];
        // outlinePass.selectedObjects = [];
      } else {
        outlinePass.selectedObjects = [selectedModel];
      }

      transformControlMode === 'focus' && focusSelectedModel();

      transformControl.attach(selectedModel);
    }
  }, [selectedModel]);

  const initScene = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);

    // scene.add(new THREE.AxesHelper(388));
    scene.add(new THREE.GridHelper(200, 20, 0x000000));

    raycaster = new THREE.Raycaster();

    width = threeDom.current!.clientWidth;
    height = threeDom.current!.clientHeight;
    offset = getClientXY(threeDom.current!, 'leftTop') as [number, number];

    camera = new THREE.PerspectiveCamera(60, width / height, NEAR, FAR);
    camera.position.set(0, 78, 275);
    // camera.position.set(78, 78, 275);
    // camera.up.set(0, 0, 1); // 设置 z 轴朝上
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      logarithmicDepthBuffer: true,
    });
    // renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    if (threeDom.current!.children.length != 0) {
      threeDom.current!.removeChild(threeDom.current!.children[0]);
    }
    threeDom.current!.appendChild(renderer.domElement);

    // 设置半球光
    // scene.add(new THREE.HemisphereLight(0xffffff, 0.5));

    // 设置环境光
    scene.add(new THREE.AmbientLight(0xffffff));

    // 设置相机灯光
    camera.add(new THREE.PointLight(0xffffff, 0.8));

    // 设置默认摄像机跟随灯光
    // spotLight = new THREE.SpotLight(0xffffff, 1);
    // spotLight.position.copy(camera.position);
    // spotLight.angle = Math.PI / 2; // 从聚光灯的位置以弧度表示聚光灯的最大范围
    // spotLight.penumbra = 0.1; // 聚光锥的半影衰减百分比
    // spotLight.decay = 1; // 沿着光照距离的衰减量
    // spotLight.distance = FAR; // 从光源发出光的最大距离
    // scene.add(spotLight);

    // 添加平面光
    // RectAreaLightUniformsLib.init();
    // const rectLight = new THREE.RectAreaLight(0xffffff, 1, 5000, 2000);
    // rectLight.position.set(0, 900, 1050);
    // rectLight.rotation.set(-Math.PI / 10, 0, 0);

    // scene.add(rectLight);
    // const rectLight2 = new THREE.RectAreaLight(0xffffff, 0.5, 5000, 2000);
    // rectLight2.position.set(0, 900, -1350);
    // // rectLight2.position.set(0, 1600, -1850);
    // // rectLight2.rotation.set(Math.PI / 4, Math.PI, 0);
    // rectLight2.rotation.set(Math.PI / 10, Math.PI, 0);
    // scene.add(rectLight2);

    // const rectLightHelper = new RectAreaLightHelper(rectLight);
    // rectLight.add(rectLightHelper);

    // const rectLightHelper2 = new RectAreaLightHelper(rectLight2);
    // rectLight2.add(rectLightHelper2);

    // 添加多通道渲染
    highlightModel();

    // 设置场景控制器
    orbitControl = new THREE.Scene();
    orbitControl = new OrbitControls(camera, renderer.domElement);
    orbitControl.enableDamping = true;
    orbitControl.minDistance = NEAR;
    orbitControl.maxDistance = FAR;
    orbitControl.enablePan = true;
    // orbitControl.maxPolarAngle = Math.PI / 2;

    // 模型调整控制器
    transformControl = new TransformControls(camera, renderer.domElement);
    transformControl.traverse((obj: any) => {
      // 不被 outlinePass 检测
      obj.isTransformControls = true;
    });
    transformControl.setSize(1.3);
    transformControl.addEventListener('change', () => {
      dispatch({
        type: 'scene/synchronousModelChange',
      });
    });
    transformControl.addEventListener('mouseDown', () => {
      orbitControl.enabled = false;
    });
    transformControl.addEventListener('mouseUp', () => {
      dispatch({
        type: 'scene/refreshAttrBoard',
      });

      orbitControl.enabled = true;
    });

    scene.add(transformControl);

    // renderAxes = initAxesScene(axesDom.current!, camera);
    viewHelper = new ViewHelper(camera, axesDom.current!);
    window.scene = scene;
    window.orbitControl = orbitControl;

    window.addEventListener('resize', onWindowResize);
    window.addEventListener(
      'resize',
      debounce(() => {
        offset = getClientXY(threeDom.current!, 'leftTop') as [number, number];
      }, 800),
    );

    window.addEventListener('mouseup', (e) => {
      // 如果键下的是鼠标右键
      if (e.button == 2 && enableCatch) {
        updateSelectedModel(null);
        // dispatch({
        //   type: 'scene/updateSelectedModel',
        //   payload: null,
        // });
      }
    });

    // 渲染动画
    window.requestAnimationFrame(autoRefresh);
  };

  // 跟踪模型的观察视觉
  function focusSelectedModel() {
    const { center, radius } = getModelCenter(selectedModel!);
    const bestPos = getBestViewingPosition(workbenchModel, center, radius);

    animateCamera(camera.position, bestPos, center);
    camera.lookAt(center);
  }

  function onWindowResize() {
    width = threeDom.current!.clientWidth;
    height = threeDom.current!.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);

    effectFXAA.uniforms.resolution.value.set(1 / width, 1 / height);
  }

  // 监听 3d 展示区域的点击
  function onModelClick(event: any) {
    if (!enableCatch) {
      return;
    }

    event.preventDefault();

    if (event.touches) {
      // 是否是移动端触摸事件
      mouse.x =
        ((event.touches[0].clientX - offset[0]) /
          threeDom.current!.offsetWidth) *
          2 -
        1;
      mouse.y =
        -(
          (event.touches[0].clientY - offset[1]) /
          threeDom.current!.offsetHeight
        ) *
          2 +
        1;
    } else {
      mouse.x =
        ((event.clientX - offset[0]) / threeDom.current!.offsetWidth) * 2 - 1;
      mouse.y =
        -((event.clientY - offset[1]) / threeDom.current!.offsetHeight) * 2 + 1;
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(workbenchModel!.children);

    // console.log('intersects', intersects);

    if (intersects.length > 0) {
      updateSelectedModel(intersects[0].object);
      // dispatch({
      //   type: 'scene/updateSelectedModel',
      //   payload: intersects[0].object,
      // });
    }
  }

  function cancelModelSelect() {
    transformControl.detach();
    outlinePass.selectedObjects = [];
  }

  //取消本地运行
  function cancelLocalRun() {
    dispatch({
      type: 'scene/changeRunState',
      payload: false,
    });
  }

  // 动态添加模型时，调整相机使其展示整个模型全景
  function setCamera() {
    if (workbenchModel !== null && workbenchModel.children.length > 0) {
      const { center, radius } = getModelCenter(workbenchModel!);
      camera.lookAt(center);
      camera.position.set(
        workbenchModel.position.x + center.x + radius * 0.8,
        workbenchModel.position.y + center.y + radius,
        workbenchModel.position.z + center.z + radius * 1.2,
      ),
        orbitControl.target.copy(center);
    } else {
      camera.position.set(0, 78, 275);
      camera.lookAt(0, 0, 0);
      orbitControl.target.set(0, 0, 0);
    }
  }

  // 更新相机坐标
  function updateCamera() {
    // 如果配置表里有摄像机的配置信息
    if (cameraConfig?.position && cameraConfig?.orbitControlTarget) {
      // 避免配置文件坐标数据不合法导致的崩溃
      try {
        const [x, y, z] = cameraConfig.position;
        const [x1, y1, z1] = cameraConfig.orbitControlTarget;
        camera.position.set(x, y, z);
        orbitControl.target.set(x1, y1, z1);
      } catch {
        setCamera();
      }
    } else {
      setCamera();
    }

    orbitControl.update();
  }

  return (
    <div className={style['workbench-wrapper']}>
      <div className={style['container']}>
        <div ref={threeDom} className={style['main']}></div>
        <div ref={axesDom} className={style['axes']}></div>
      </div>
    </div>
  );
}

export default connect((state: any) => ({
  sceneModel: state.scene,
  projectModel: state.project,
}))(Workbench);

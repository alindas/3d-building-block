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

import { OutlinePass } from '@/utils/correct-package/three/outlinePass';
import {
  getBestViewingPosition,
  getModelCenter,
  parseModelUrl,
  TransformArrayToHash,
} from '@/utils/threeD';
import ViewHelper from '@/utils/viewHelper2';
import style from './index.less';
import { isEmpty, getClientXY } from '@/utils/common';
import { ConnectProps } from '@/common/type';
import { updateSelectedModel } from '@/models/proxy';
import { Object3D } from 'three';

export type TMode = 'translate' | 'rotate' | 'scale';

const NEAR = 0.1,
  FAR = 20000,
  minDistance = 10,
  maxDistance = 10000;

let scene: THREE.Scene,
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
 * @param target1 需要变更的controls的原target
 * @param target2 需要变更的controls的当前target
 */
function animateCamera(
  position1: THREE.Vector3,
  position2: THREE.Vector3,
  target1: THREE.Vector3,
  target2: THREE.Vector3,
) {
  new TWEEN.Tween({
    px: position1.x, // 相机位置
    py: position1.y,
    pz: position1.z,
    tx: target1.x, // 控制器中心
    ty: target1.y,
    tz: target1.z,
  })
    .to(
      {
        px: position2.x,
        py: position2.y,
        pz: position2.z,
        tx: target2.x,
        ty: target2.y,
        tz: target2.z,
      },
      1000,
    )
    // .onStart(() => {
    //   orbitControl.enabled = false;
    // })
    .onUpdate(function (this: any) {
      camera.position.set(this._object.px, this._object.py, this._object.pz);
      orbitControl.target.set(
        this._object.tx,
        this._object.ty,
        this._object.tz,
      );
    })
    // .onComplete(function (this: any) {
    //   // orbitControl.enabled = true;
    //   // target && orbitControl.target.copy(target);
    // })
    .easing(TWEEN.Easing.Cubic.InOut)
    .start();
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
  viewHelper.render(orbitControl.target);
  if (!viewHelper.animating) {
    orbitControl.update();
  }
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
    forceUpdateModel,
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

    renderer.domElement.addEventListener('dragover', (e) => {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';
    });

    renderer.domElement.addEventListener('drop', function (e) {
      e.stopPropagation();
      e.preventDefault();
      if (window.projectId === -1) {
        message.info('请先创建工程');
        return;
      }
      if (e.dataTransfer!.files.length < 1) {
        return;
      }
      if (window.loader.loading) {
        message.info('任务正在处理');
        return;
      }
      // check file
      let files;
      let modelUrl = window.modelUrl;
      window.modelUrl = undefined;
      mouse.x =
        ((e.clientX - offset[0]) / threeDom.current!.offsetWidth) * 2 - 1;
      mouse.y =
        -((e.clientY - offset[1]) / threeDom.current!.offsetHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const enterPos =
        raycaster.intersectObjects(scene.children)[0]?.point ??
        new THREE.Vector3();

      if (modelUrl) {
        // 如果是从模型库拖入的，分析出其远端真实的模型url
        if (modelUrl.type === 'local') {
          parseModelUrl(modelUrl.value, {
            position: enterPos,
          });
          dispatch({ type: 'effect/updateLightEffect' });

          return;
        } else {
          files = [
            {
              name: modelUrl.name,
              url: encodeURIComponent(modelUrl.value),
            },
          ];
        }
      }
      window.loader.loadModel(
        files ?? e.dataTransfer!.files,
        (model: Object3D[]) => {
          // 位置
          model.forEach((m) => {
            m.position.copy(enterPos);
          });
          dispatch({
            type: 'scene/updateWorkbenchModel',
            payload: {
              model,
              type: 'add',
              modelHash: TransformArrayToHash(model),
            },
          });
          message.success('加载完成');
        },
      );
    });

    const Performance = debounce(
      () => {
        onWindowResize();
        viewHelper.resize();
        offset = getClientXY(threeDom.current!, 'leftTop') as [number, number];
      },
      800,
      { leading: true },
    );
    const resizeObserver = new ResizeObserver(Performance);
    resizeObserver.observe(threeDom.current!);

    return () => {
      resizeObserver.disconnect();
    };
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

    if (transformControlMode === 'focus' && !isEmpty(selectedModel)) {
      focusSelectedModel();
    }
  }, [transformControlMode]);

  // 相机坐标变化后更新相机
  useEffect(() => {
    updateCamera();
  }, [cameraConfig]);

  useEffect(() => {
    if (workbenchModel !== null) {
      // console.log('scene in workbench: ', scene);
      // console.log('workbenchModel---saveModelConfigList', saveModelConfigList);

      // console.log('oldModelId in workbench: ', oldModelId);

      renderer.domElement.addEventListener('mouseup', onModelClick, true); // PC
      renderer.domElement.addEventListener('touchstart', onModelClick, false); // Mobile

      // updateCamera();
    }

    return () => {
      renderer.domElement.removeEventListener('mouseup', onModelClick, true); // PC
      renderer.domElement.removeEventListener(
        'touchstart',
        onModelClick,
        false,
      ); // Mobile
    };
  }, [forceUpdateModel]);

  // redux 上选中的模型变化时更新
  useEffect(() => {
    // console.log('selectedModel', selectedModel);

    if (isEmpty(selectedModel)) {
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
    // renderer.setClearAlpha(0); // 设置背景为透明

    if (threeDom.current!.children.length != 0) {
      threeDom.current!.removeChild(threeDom.current!.children[0]);
    }
    threeDom.current!.appendChild(renderer.domElement);

    // 设置半球光
    // scene.add(new THREE.HemisphereLight(0xffffff, 0.5));

    // 设置环境光
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));

    // 设置相机灯光
    camera.add(new THREE.PointLight(0xffffff, 0.1));

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
    orbitControl = new OrbitControls(camera, renderer.domElement);
    orbitControl.enableDamping = true;
    orbitControl.minDistance = minDistance;
    orbitControl.maxDistance = maxDistance;
    // orbitControl.maxPolarAngle = Math.PI / 2;

    // 模型调整控制器
    transformControl = new TransformControls(camera, renderer.domElement);
    transformControl.traverse((obj: any) => {
      // 不被 outlinePass 检测
      obj.isTransformControls = true;
    });
    transformControl.setSize(1.3);
    transformControl.addEventListener('objectChange', () => {
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

    viewHelper = new ViewHelper(camera, axesDom.current!);
    window.scene = scene;
    window.orbitControl = orbitControl;
    window.transformControl = transformControl;

    window.addEventListener('mouseup', (e) => {
      // 如果键下的是鼠标右键
      if (e.button == 2 && enableCatch && !window.multiple) {
        dispatch({
          type: 'scene/updateSelectedModel',
          payload: null,
        });
      }
    });

    // 渲染动画
    window.requestAnimationFrame(autoRefresh);
  };

  // 跟踪模型的观察视觉
  function focusSelectedModel() {
    const { center, radius } = getModelCenter(selectedModel!);
    const bestPos = getBestViewingPosition(workbenchModel, center, radius);

    animateCamera(camera.position, bestPos, orbitControl.target, center);
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
    if (!enableCatch || window.multiple) {
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
      // 响应 model click 脚本
      window.globalEnv.events.click.validate(intersects[0].object.id);
    }
  }

  function cancelModelSelect() {
    console.log('cancel');
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

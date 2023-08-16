import { connect, ProjectState, SceneState, TConfig, useParams } from 'umi';
import { useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

import style from './index.less';
import { OutlinePass } from '@/utils/correct-package/three/outlinePass';
import { getClientXY, isEmpty } from '@/utils/common';
import { ConnectProps } from '@/common/type';
import Blank from './blank';
import request from '@/service/request';
import { sse } from '@/service/ipConfig';
import { freeModelMemory } from '@/utils/threeD';

export type TMode = 'translate' | 'rotate' | 'scale';

const NEAR = 0.1,
  FAR = 50000;
let scene: THREE.Scene,
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
  enableCatch = true,
  offset: [number, number],
  width: number,
  height: number;

// 云端配置
let config: TConfig = {};
let workbenchModel: THREE.Object3D = new THREE.Group();
let sseClient: EventSource;

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

  orbitControl.update();
}

function autoRefresh() {
  // 使用通道渲染
  render();

  window.requestAnimationFrame(autoRefresh);
}

/**
 * 展示页。也可根据不同定制需求基于此页面开发不同版本
 * 下列数据后面要用云数据
 * workbench。
 * config 数据。
 */

function Exhibit(
  props: ConnectProps<{
    sceneModel: SceneState;
  }>,
) {
  const [loading, setLoading] = useState('加载中..');
  const { project }: any = useParams();
  const { dispatch } = props;
  const { selectedModel, outlinePassModel } = props.sceneModel;

  const threeDom = useRef<null | HTMLDivElement>(null);

  // 初始化
  useEffect(() => {
    // 如果浏览器不支持sse(没错，IE你这个垃圾, 说得就是你)
    if (!('EventSource' in window)) {
      alert('当前浏览器尚不支持sse 技术，请卸载它并安装Chrome 浏览器（推荐）');
    } else {
      // 开启sse 实时通讯用于接收服务端的动态信息
      sseClient = new EventSource(`${sse}test/sse/status?projectId=${project}`);
      sseClient.onopen = () => {
        console.log('Connection Success');
      };
      // sse 连接出错处理
      sseClient.onerror = (event) => {
        console.log(`sse 连接出错--${event}`);
      };
      // 监听服务端实时更新的默认事件，并作出相应处理
      sseClient.onmessage = (event) => {
        console.log('event data', event.data);
      };
      // 监听服务端自定义事件，并作出相应处理
      // 用户账号信息更新
      sseClient.addEventListener(`${project}-status`, (event) => {
        setLoading(JSON.parse(event.data) ? '' : '页面未开放');
        console.log(event.type + ' 事件已响应，数据' + event.data);
      });
    }
    request
      .get('test/exhibit?project=' + project)
      .then((res: any) => {
        if (res === 'no exit') {
          setLoading('页面未开放');
        } else {
          console.log(res); // 按道理是配置文件和模型资源
          config = res;
          setLoading('');
          // 从云资源里加载 model 和配置文件
          window.loader.loadModel(
            config?.modelConfig?.files ?? [],
            (models) => {
              models.forEach((o) => workbenchModel.add(o));
            },
          );
        }
      })
      .catch(() => {
        setLoading('页面未开放');
      });

    return () => {
      if (typeof sseClient !== 'undefined') {
        sseClient.close();
      }
    };
  }, []);

  useEffect(() => {
    if (loading === '') {
      initScene();
      scene.add(workbenchModel);
      renderer.domElement.addEventListener('mouseup', onModelClick, true); // PC
      renderer.domElement.addEventListener('touchstart', onModelClick, false); // Mobile
    } else {
      freeModelMemory(scene);
      // @ts-ignore
      scene = null;
    }
  }, [loading]);

  // 高亮选中物体
  useEffect(() => {
    if (!isEmpty(outlinePass)) {
      if (isEmpty(selectedModel)) {
        outlinePass.selectedObjects = [];
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
      }
    }
  }, [selectedModel]);

  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);

    scene.add(new THREE.GridHelper(600, 20, 0x000000));
    raycaster = new THREE.Raycaster();
    width = threeDom.current!.clientWidth;
    height = threeDom.current!.clientHeight;
    offset = getClientXY(threeDom.current!, 'leftTop') as [number, number];

    camera = new THREE.PerspectiveCamera(60, width / height, NEAR, FAR);
    const [x, y, z] = config?.cameraConfig?.position ?? [43, 405, 365];
    camera.position.set(x, y, z);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      logarithmicDepthBuffer: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    if (threeDom.current!.children.length != 0) {
      threeDom.current!.removeChild(threeDom.current!.children[0]);
    }
    threeDom.current!.appendChild(renderer.domElement);

    // 从配置中设置灯光
    (config.lightConfig ?? []).forEach((l) => {
      // const Constructor = THREE[l.type] as any
      const light = new THREE[l.type]();
      light.name = l.name;
      light.intensity = l.intensity;
      light.castShadow = l.castShadow;
      light.visible = l.visible;
      light.color.setStyle(l.color);
      light.position.copy(new THREE.Vector3().fromArray(l.position));
      // todo rotate
      let radians = l.rotate.map((degree) => (degree * Math.PI) / 180);
      light.rotation.x = radians[0];
      light.rotation.y = radians[1];
      light.rotation.z = radians[2];
      // console.log(light)
      scene.add(light);
    });

    // 添加多通道渲染
    highlightModel();

    // 设置场景控制器
    const [_x, _y, _z] = config?.cameraConfig?.orbitControlTarget ?? [
      1, 192, 2,
    ];
    orbitControl = new OrbitControls(camera, renderer.domElement);
    orbitControl.enableDamping = true;
    orbitControl.minDistance = NEAR;
    orbitControl.maxDistance = FAR;
    orbitControl.maxPolarAngle = Math.PI / 2;
    orbitControl.target.set(_x, _y, _z);

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
        dispatch({
          type: 'scene/updateSelectedModel',
          payload: null,
        });
      }
    });

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

    // 渲染动画
    window.requestAnimationFrame(autoRefresh);
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
      dispatch({
        type: 'scene/updateSelectedModel',
        payload: intersects[0].object,
      });
    }
  }

  if (loading !== '') {
    return <Blank msg={loading} />;
  }

  return (
    <div className={style['stage-wrapper']}>
      <div className={style['container']}>
        <div ref={threeDom} className={style['main']}></div>
      </div>
    </div>
  );
}

export default connect((state: any) => ({
  sceneModel: state.scene,
}))(Exhibit);

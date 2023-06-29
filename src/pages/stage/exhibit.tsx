import { connect, ProjectState, SceneState, useParams } from 'umi';
import { useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Space, Switch } from 'antd';

import style from './index.less';
import { OutlinePass } from '@/utils/three-correct/outlinePass';
import { getClientXY, isUndefinedOrNull } from '@/utils/common';
import { ConnectProps } from '@/common/type';
import Blank from './blank';
import request from '@/service/request';

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

let cameraConfig = {
  // 默认相机配置
  position: [43, 405, 365],
  orbitControlTarget: [1, 192, 2],
};

// test 管道水流用
const texture = new THREE.TextureLoader().load('/texture/flow.jpg');
// const texture = new THREE.TextureLoader().load('/texture/test2.png');
// 设置阵列模式为 RepeatWrapping
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(5, 1); // 重复数量
// texture.offset.x = 0.5;

const tubeMaterial = new THREE.MeshBasicMaterial({
  map: texture,
  transparent: true,
  // color: 0x47d8fa,
  // side: THREE.DoubleSide,
  opacity: 0.4,
});

let openFlow = false; // 水流开关
let target: THREE.Mesh;

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

function arrayToVector3(array: ArrayLike<number>) {
  const Array = [];
  // for(let i = 0; i <= array.length-2; i+3) {
  //   Array.push(new THREE.Vector3(array[i], array[i+1], array[i+2]))
  // }
  for (let i = 0; i < array.length; i += 3) {
    Array.push(new THREE.Vector3(array[i], array[i + 1], array[i + 2]));
  }
  return Array;
}

function render() {
  if (composer?.render) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
  if (openFlow) {
    texture.offset.x += 0.01;
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
  const [workbenchModel, setWorkbenchModel] = useState<null | THREE.Object3D>(
    null,
  );
  const { project }: any = useParams();
  const { dispatch } = props;
  const { selectedModel, outlinePassModel } = props.sceneModel;

  const threeDom = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (project === 'test') {
      const loader = new FBXLoader();

      loader.load(`/projects/test_pipe/model.fbx`, function (object) {
        setWorkbenchModel(object);
        setLoading('');
      });
    } else {
      request
        .get('/api/model?project=' + project)
        .then((res: any) => {
          if (res === 'no exit') {
            setLoading('页面未开放');
          } else {
            console.log(res); // 按道理是配置文件和模型资源
            cameraConfig = res;
            // 从云资源里加载 model 和配置文件
            const loader = new FBXLoader();

            loader.load(`/projects/${project}/model.fbx`, function (object) {
              setWorkbenchModel(object);
              setLoading('');
            });
          }
        })
        .catch(() => {
          setLoading('页面未开放');
        });
    }
  }, []);

  useEffect(() => {
    if (loading === '') {
      initScene();
      scene.add(workbenchModel!);
      renderer.domElement.addEventListener('mouseup', onModelClick, true); // PC
      renderer.domElement.addEventListener('touchstart', onModelClick, false); // Mobile
    }
  }, [loading]);

  // 高亮选中物体
  useEffect(() => {
    if (!isUndefinedOrNull(outlinePass)) {
      if (isUndefinedOrNull(selectedModel)) {
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
    const [x, y, z] = cameraConfig.position!;
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

    // 设置半球光
    scene.add(new THREE.HemisphereLight(0xffffff, 0.5));

    // 设置环境光
    scene.add(new THREE.AmbientLight(0xffffff));

    // 添加平面光
    RectAreaLightUniformsLib.init();
    const rectLight = new THREE.RectAreaLight(0xffffff, 1, 5000, 2000);
    rectLight.position.set(0, 900, 1050);
    rectLight.rotation.set(-Math.PI / 10, 0, 0);

    scene.add(rectLight);
    const rectLight2 = new THREE.RectAreaLight(0xffffff, 0.5, 5000, 2000);
    rectLight2.position.set(0, 900, -1350);
    // rectLight2.position.set(0, 1600, -1850);
    // rectLight2.rotation.set(Math.PI / 4, Math.PI, 0);
    rectLight2.rotation.set(Math.PI / 10, Math.PI, 0);
    scene.add(rectLight2);

    // 添加多通道渲染
    highlightModel();

    // 设置场景控制器
    const [_x, _y, _z] = cameraConfig.orbitControlTarget!;
    orbitControl = new THREE.Scene();
    orbitControl = new OrbitControls(camera, renderer.domElement);
    orbitControl.enableDamping = true;
    orbitControl.minDistance = NEAR;
    orbitControl.maxDistance = FAR;
    orbitControl.enablePan = true;
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

  // 管道液体流动(针对不同定制需要，做演示用)
  function setFlow(checked: boolean) {
    // 开水
    if (!target) {
      target = workbenchModel!.getObjectByName(
        '3DXY_geometry_002',
      ) as THREE.Mesh;

      // 管道物体需要是 tubeGeometry
      // const positionAttribute = target.geometry.getAttribute('position').array
      // const path = new THREE.CatmullRomCurve3(arrayToVector3(positionAttribute))
      // // const path = new THREE.QuadraticBezierCurve3(arrayToVector3(positionAttribute))
      // target.geometry = new THREE.TubeGeometry(path)
    }
    if (checked) {
      /**纹理坐标0~1之间随意定义*/
      // const uvs = new Float32Array([
      //   0, 0, //图片左下角
      //   0.25, 0, //图片右下角
      //   0.25, 0.25, //图片右上角
      //   0, 0.25, //图片左上角
      // ]);
      // // 设置几何体attributes属性的位置normal属性
      // target.geometry.attributes.uv = new THREE.BufferAttribute(uvs, 2); //2个为一组,表示一个顶点的纹理坐标
      target.material = tubeMaterial;
    } else {
      // 关水
      target.material = new THREE.MeshLambertMaterial({
        color: '#000',
      });
    }
    openFlow = checked;
  }

  if (loading !== '') {
    return <Blank msg={loading} />;
  }

  return (
    <div className={style['stage-wrapper']}>
      <div className={style['container']}>
        <div ref={threeDom} className={style['main']}></div>
        <div className={style['control-panel']}>
          <Space direction="vertical">
            <Switch
              checkedChildren="开水"
              unCheckedChildren="关水"
              onChange={setFlow}
            />
          </Space>
        </div>
      </div>
    </div>
  );
}

export default connect((state: any) => ({
  sceneModel: state.scene,
}))(Exhibit);

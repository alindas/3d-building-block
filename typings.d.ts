declare module '*.css';
declare module '*.less';
declare module '*.png';

interface Window {
  TWEEN: any;
  autoSave: boolean;
  scene: THREE.Scene;
  orbitControl: any;
  transformControl: any;
  vector3: THREE.Vector3;
  quaternion: THREE.Quaternion;
  cmd: TProcess.default;
  projectId: number;
  loader: TLoader.default;
  multiple: boolean;
  globalEnv: any; // 脚本本地变量
  cloudEnv: any; // 云端数据
  myScript: TMyScript.default; // 脚本绑定
  myService: TMyServices.default; // 接口更新
  modelUrl?: {
    name: string;
    value: string;
    type: string;
  };
}

declare module '*.svg' {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>,
  ): React.ReactElement;
  const url: string;
  export default url;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module 'three-fbxloader-offical' {
  const src: any;
  export default src;
}

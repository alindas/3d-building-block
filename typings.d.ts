declare module '*.css';
declare module '*.less';
declare module '*.png';
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

declare interface Window {
  simulateModel?: any;
}

interface Window {
  scene: THREE.Scene;
  orbitControl: any;
  vector3: THREE.Vector3;
  quaternion: THREE.Quaternion;
}

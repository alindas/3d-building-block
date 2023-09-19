export default class Loader {
  /**
   * @default false
   */
  loading: boolean;

  constructor();

  /**
   * @describe 加载模型
   */
  loadModel(
    files: File[] | FileList | { name: string; url: string }[],
    callback: (model: THREE.Object3D[]) => void,
    config?: {
      mode?: 'online' | 'local';
    },
  ): void;
}

export as namespace TLoader;

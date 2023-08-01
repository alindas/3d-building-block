declare interface ILoader {
  /**
   * @default false
   */
  loading: boolean;

  /**
   * @describe 添加一条命令
   */
  loadModel(
    files: File[] | FileList,
    callback: (model: THREE.Object3D[]) => void,
  ): void;
}

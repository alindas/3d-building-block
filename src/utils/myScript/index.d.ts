export default class MyScript {
  constructor();

  /**
   * @describe 绑定脚本
   */
  bind(model: THREE.Object3D, sc: number | string | (number | string)[]): void;

  /**
   * @describe 解绑脚本
   */
  unbind(id: number, sc: number | string | (number | string)[]): void;

  /**
   * @describe 获取某个模型的脚本编号
   */
  getSc(id: number): void;

  /**
   * @describe 输出字符串化的所有记录
   */
  save(): string;
}

export as namespace TMyScript;

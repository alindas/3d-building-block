declare interface IProcess {
  /**
   * @default 5
   */
  max: number;

  /**
   * @default -1
   */
  p: number;

  /**
   * @default []
   */
  history: {
    p: number;
    n: number;
    execute: () => any;
  }[];

  /**
   * @describe 添加一条命令
   */
  executeCommand(command: () => any): void;

  backup(): number;

  forward(): number;
}

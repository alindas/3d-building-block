/** 操作状态历史 */
class Process {
  constructor(max = 5) {
    this.max = max; // 最大储存值
    this.p = -1; // 指针
    this.history = []; // 操作记录
  }

  // 存入新记录
  executeCommand(execute, invoke) {
    // 命令对象需要符合指定格式
    if (typeof execute !== 'function') {
      console.error('The command should be a function');
      return;
    }
    const command = {
      p: this.p + 1,
      n: this.p,
      execute,
      invoke,
    };
    this.p++;
    this.history.splice(this.p, this.history.length - this.p, command);
    if (this.history.length > this.max) {
      // 去除顶层记录
      this.history.shift();
    }
    execute();
  }

  backup() {
    // 存在操作
    if (this.p > 0) {
      this.p--;
      let cmd = this.history.find((h) => h.p === this.p);
      if (typeof cmd.invoke === 'function') {
        console.log('invoke');
        cmd.invoke();
      } else {
        console.log('execute', cmd);
        cmd.execute();
      }
    }
    // 返回新的当前指针
    return this.p;
  }

  forward() {
    if (this.p + 1 < this.history.length) {
      this.p++;
      this.history.find((h) => h.p === this.p).execute();
    }
    return this.p;
  }
}

export default Process;

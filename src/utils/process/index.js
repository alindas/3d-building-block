/** 操作状态历史 */
class Process {
  constructor(max = 5) {
    this.max = max; // 最大储存值
    this.p = -1; // 指针
    this.history = []; // 操作记录
    this.canBack = false;
    this.canForward = false;
    this.onChange = null;
    this._base = 0;
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
      let top = this.history.shift();
      this._base = top.p;
    }
    execute();
    this.canBack = this.p > this._base;
    this.canForward = this.p + 1 < this._base + this.history.length;
    this.onChange?.();
  }

  backup() {
    // 存在操作
    this.canBack = this.p > this._base;
    if (this.canBack) {
      this.canForward = true;
      this.p--;
      this.canBack = this.p > this._base;
      let cmd = this.history.find((h) => h.p === this.p);
      if (typeof cmd.invoke === 'function') {
        console.log('invoke');
        cmd.invoke();
      } else {
        console.log('execute', cmd);
        cmd.execute();
      }
      this.onChange?.();
    }
    // 返回新的当前指针
    return this.p;
  }

  forward() {
    this.canForward = this.p + 1 < this._base + this.history.length;
    if (this.canForward) {
      this.canBack = true;
      this.p++;
      this.canForward = this.p + 1 < this._base + this.history.length;
      this.history.find((h) => h.p === this.p).execute();
      this.onChange?.();
    }
    return this.p;
  }
}

// Process.prototype.addEventListener = function(ev, cb) {
//   if (!this.events[ev]) {
//     this.events[ev] = [];
//   }

//   this.events[ev].push(cb);
// }

// Process.prototype.removeEventListener = function(ev, cb) {
//   if (!this.events[ev]) {
//     return;
//   }

//   const index = this.events[ev].indexOf(cb);
//   if (index > -1) {
//     this.events[ev].splice(index, 1);
//   }
// }

// Process.prototype.dispatchEvent  = function(ev, data) {
//   if (!this.events[ev]) {
//     return;
//   }

//   this.events[ev].forEach(callback => {
//     callback(data);
//   });
// }

export default Process;

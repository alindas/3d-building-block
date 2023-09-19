import myScripts from '@/scripts';
import { message } from 'antd';

/** 脚本绑定 */
class MyScript {
  constructor() {
    this.store = {};
    this.controls = {};
  }

  bind(model, sc) {
    if (Reflect.has(this.store, model.id)) {
      this.store[model.id].push(sc);
    } else {
      this.store[model.id] = [sc];
    }
    // 触发对应的脚本
    myScripts.find((o) => {
      if (o.id === sc) {
        try {
          if (Reflect.has(this.controls, model.id)) {
            this.controls[model.id][sc] = o.ctx(
              window.globalEnv,
              window.myService,
              model,
            );
          } else {
            this.controls[model.id] = {};
            this.controls[model.id][sc] = o.ctx(
              window.globalEnv,
              window.myService,
              model,
            );
          }
        } catch (error) {
          message.warn(error.message);
          console.log(error);
        }
      }
    });
  }

  unbind(id, sc) {
    this.store[id] = this.store[id].filter((o) => o !== sc);
    // 解除对应的脚本
    this.controls[id][sc]?.();
  }

  getSc(id) {
    return this.store[id];
  }

  clear() {
    console.log('clear all');
  }
}

export default MyScript;

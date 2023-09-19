import myScripts from '@/scripts';
import { message } from 'antd';

/** 脚本绑定 */
class MyScript {
  constructor() {
    this.store = {};
    this.controls = {};
  }

  bind(model, sc) {
    let _sc = Array.isArray(sc) ? sc : [sc];
    _sc.forEach((key) => {
      if (Reflect.has(this.store, model.id)) {
        this.store[model.id].push(key);
      } else {
        this.store[model.id] = [key];
      }
      // 触发对应的脚本
      myScripts.find((o) => {
        if (o.id === key) {
          try {
            if (Reflect.has(this.controls, model.id)) {
              this.controls[model.id][key] = o.ctx(
                window.globalEnv,
                window.myService,
                model,
              );
            } else {
              this.controls[model.id] = {};
              this.controls[model.id][key] = o.ctx(
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

  save() {
    return JSON.stringify(this.store);
  }

  clear() {
    console.log('clear all');
  }
}

export default MyScript;

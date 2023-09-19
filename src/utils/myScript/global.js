class FunctionalArray {
  constructor() {
    this.store = [];
  }

  push(obj) {
    if (!Reflect.has(obj, 'key')) {
      throw new Error('需要指定唯一 key');
    } else if (!Reflect.has(obj, 'target')) {
      throw new Error('需要指定目标 target');
    } else if (!Reflect.has(obj, 'dispose')) {
      throw new Error('需要指定响应事件 dispose');
    } else {
      this.store.push(obj);
    }
  }

  remove(key) {
    this.store.splice(
      this.store.findIndex((o) => o.key === key),
      1,
    );
  }

  validate(id) {
    this.store.every((o) => {
      if (o.target === id) {
        try {
          o?.dispose();
        } catch (error) {
          console.log(error);
        }
      }
    });
  }
}

/** 脚本变量 Global */
class GlobalEnv {
  constructor() {
    this.events = {
      hover: new FunctionalArray(),
      click: new FunctionalArray(),
      dbClick: new FunctionalArray(),
    };
  }

  clear() {
    console.log('clear all');
  }
}

export default GlobalEnv;

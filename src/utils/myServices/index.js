function decorateParams(initial) {
  return new Proxy(
    {
      type: typeof initial,
      value: initial,
      onChange: null,
    },
    {
      get: (target, key) => {
        if (key === target.type) {
          return undefined;
        }
        return target[key];
      },

      set: (target, key, value) => {
        switch (key) {
          case 'type': {
            console.warn('当前参数不受管控');
            break;
          }

          case 'value': {
            target.value = value;
            target.onChange?.(value);
            break;
          }

          default: {
            target[key] = value;
            break;
          }
        }

        return true;
      },
    },
  );
}

let timer = 1;

/** 接口数据 */
class MyServices {
  constructor() {
    this.local = {
      status: decorateParams('stop'),
    };

    // 演示用，后续删
    setInterval(() => {
      timer++;
      this.local.status.value =
        timer % 2 == 0 ? 'alarm' : timer % 3 == 0 ? 'stop' : 'run';
    }, 2000);
  }

  getSc(id) {
    return this.store[id];
  }

  clear() {
    console.log('clear all');
  }
}

export default MyServices;

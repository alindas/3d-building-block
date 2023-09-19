import { ScriptObject } from './type';

function clickShowMsg(global: any, _: any, model: THREE.Object3D) {
  let key = new Date().valueOf();
  global.events.click.push({
    key,
    target: model.id,
    dispose: () => {
      window.alert(model.name + '被点击了');
    },
  });

  return () => {
    global.events.click.remove(key);
  };
}

const data: ScriptObject[] = [
  {
    id: 4,
    type: '事件',
    title: '点击通知',
    desc: '点击触发alert通知',
    ctx: clickShowMsg,
  },
];

export default data;

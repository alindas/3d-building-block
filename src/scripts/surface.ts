import { ScriptObject } from './type';

function changeColorByStatus(_: any, services: any, model: any) {
  if (!model.isMesh) {
    throw new Error('该模型不具备材质，该效果不会生效');
  }

  const { status } = services.local;

  status.onChange = (val: any) => {
    switch (val) {
      case 'run': {
        model.material.color.set(0x008000);
        break;
      }

      case 'stop': {
        model.material.color.set(0x808080);
        break;
      }

      case 'alarm': {
        model.material.color.set(0xff0000);
        break;
      }

      default:
        break;
    }
  };

  return () => {
    status.onChange = null;
  };
}

const data: ScriptObject[] = [
  {
    id: 1,
    type: '外观',
    title: '根据status调整外观颜色',
    desc: '根据status调整外观颜色，run-绿色，alarm-红色，stop-灰色',
    ctx: changeColorByStatus,
  },
];

export default data;

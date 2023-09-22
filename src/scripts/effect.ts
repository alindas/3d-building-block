import { ScriptObject } from './type';

function robotSport(_: any, __: any, model: THREE.Object3D) {
  const targetJoint = model.getObjectByName('Axis013');
  if (!targetJoint?.isObject3D) {
    throw new Error('目标不存在数据响应节点，该脚本不会生效');
  }

  const resetFrame = new window.TWEEN.Tween(targetJoint.rotation)
    .to({ z: 0 }, 1500)
    .easing(window.TWEEN.Easing.Quadratic.Out)
    .onComplete(() => rotateFrame.start());

  const rotateFrame = new window.TWEEN.Tween(targetJoint.rotation)
    .to({ z: -Math.PI / 2 }, 2000)
    .easing(window.TWEEN.Easing.Quadratic.Out)
    .onComplete(() => resetFrame.start());

  rotateFrame.start();

  return () => {
    rotateFrame.stop();
    resetFrame.stop();
    new window.TWEEN.Tween(targetJoint.rotation)
      .to({ z: 0 }, 1500)
      .easing(window.TWEEN.Easing.Quadratic.Out)
      .start();
  };
}

const data: ScriptObject[] = [
  {
    id: 2,
    type: '动效',
    title: '机器人运行',
    desc: '模拟运行，适用于产线机器人。通过名称为 Axis013 的模型关节赋予运行数据',
    ctx: robotSport,
  },
];

export default data;

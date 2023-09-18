import { ScriptObject } from './type';

function demo() {}

const data: ScriptObject[] = [
  {
    id: 1,
    type: '外观',
    title: '根据status调整外观颜色',
    desc: '根据status调整外观颜色',
    ctx: demo,
  },
  {
    id: 2,
    type: '外观',
    title: '控制大小',
    desc: '根据status调大小',
    ctx: demo,
  },
];

export default data;

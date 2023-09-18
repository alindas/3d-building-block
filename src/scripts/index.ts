import surface from './surface';
import effect from './effect';
import event from './event';
import other from './other';

const myScripts = [...surface, ...effect, ...event, ...other];

// id 分散，不好管控。后续改进

export const scriptTypes = ['外观', '事件', '动效', '其他'];

export const scriptOps = myScripts.map((sc) => ({
  label: sc.title,
  value: sc.id,
}));

export default myScripts;

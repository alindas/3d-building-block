import local from './local';

const myCloudData = [...local];

// id 分散，不好管控。后续改进

export const cloudTypes = ['Local', 'Post', 'Get', 'WebSocket', 'Mqtt'];

export const cloudOps = myCloudData.map((sc) => ({
  label: sc.title,
  value: sc.id,
}));

export default myCloudData;

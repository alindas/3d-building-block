// 场景灯光配置选项
const sceneLightConfig = [
  {
    sceneLighConfigtId: '1',
    sceneLighConfigtName: '点光源',
    sceneLighConfigtType: 'PointLight',
    para: [0xffffff],
    position: [100, 100, 100],
  },
  {
    sceneLighConfigtId: '2',
    sceneLighConfigtName: '平行光源',
    sceneLighConfigtType: 'DirectionalLight',
    para: [0xffffff, 1.2, 100],
    position: [100, 100, 100],
  },
];

// 场景摄像头配置选项
const sceneCameraConfig: any = [];

export default { sceneLightConfig, sceneCameraConfig };

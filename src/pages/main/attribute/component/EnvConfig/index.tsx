import { Tabs } from 'antd';
import SceneMap from './SceneMap';
import Light from './Light';
import './index.css';

const TabPane = Tabs.TabPane;

export default function EnvConfig() {
  return (
    <Tabs
      // onChange={onChange}
      defaultActiveKey="light"
      type="card"
      size="small"
    >
      <TabPane tab="场景" key="scene">
        <SceneMap />
      </TabPane>
      <TabPane tab="灯光" key="light">
        <Light />
      </TabPane>
      <TabPane tab="设置" key="set"></TabPane>
    </Tabs>
  );
}

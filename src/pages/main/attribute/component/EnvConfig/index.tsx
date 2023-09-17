import { Tabs } from 'antd';
import SceneMap from './Scene';
import Light from './Light';
import './index.css';
import Setting from './Setting';

const TabPane = Tabs.TabPane;

export default function EnvConfig() {
  return (
    <Tabs
      // onChange={onChange}
      defaultActiveKey="scene"
      type="card"
      size="small"
    >
      <TabPane tab="场景" key="scene">
        <SceneMap />
      </TabPane>
      <TabPane tab="灯光" key="light">
        <Light />
      </TabPane>
      <TabPane tab="设置" key="set">
        <Setting />
      </TabPane>
    </Tabs>
  );
}

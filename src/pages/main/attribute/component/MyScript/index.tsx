import { List, Typography } from 'antd';
import React from 'react';

import style from './index.less';

const data = [
  {
    id: 1,
    type: '外观',
    desc: '根据status调整外观颜色',
    ctx: '',
  },
  {
    id: 2,
    type: '动效',
    desc: '根据joint调整运动姿态',
    ctx: '',
  },
];

const MyScript: React.FC = () => {
  return (
    <div className={style['script-config-wrapper']}>
      <List
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <Typography.Text code>{item.type}</Typography.Text> {item.desc}
          </List.Item>
        )}
      />
    </div>
  );
};

export default MyScript;

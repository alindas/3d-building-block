import React, { useState } from 'react';
import { Collapse, Segmented } from 'antd';
import style from './index.less';
import Empty from '@/components/Empty';
import Question from '@/components/Question';

const { Panel } = Collapse;

const data = [
  {
    id: 1,
    type: 'Static',
    title: '内置环境变量',
    desc: 'test',
    ctx: '',
  },
];

let isEmpty = 0;

export default function Service() {
  const [type, setType] = useState<string | number>('Static');

  function changeType(t: string | number) {
    isEmpty = 0;
    setType(t);
  }

  return (
    <div className={style['data-config-wrapper']}>
      <div className={style['config-title']}>
        接口配置
        <Question link="guidebook" />
      </div>
      <Segmented
        options={['Static', 'Post', 'Get', 'WebSocket', 'Mqtt']}
        value={type}
        onChange={changeType}
      />
      <div className={style['data-container']}>
        <Collapse accordion>
          {data.map((o) => {
            if (o.type === type) {
              isEmpty++;
              return (
                <Panel header={o.title} key={o.id}>
                  <p>{o.desc}</p>
                </Panel>
              );
            } else {
              return null;
            }
          })}
          {isEmpty < 1 && <Empty />}
        </Collapse>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Collapse, Segmented } from 'antd';
import style from './index.less';
import Empty from '@/components/Empty';
import Question from '@/components/Question';
import cloud, { cloudTypes } from '@/cloud';

const { Panel } = Collapse;

let isEmpty = 0;

export default function Service() {
  const [type, setType] = useState<string | number>('Local');

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
      <Segmented options={cloudTypes} value={type} onChange={changeType} />
      <div className={style['data-container']}>
        <Collapse accordion>
          {cloud.map((o) => {
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

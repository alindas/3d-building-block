import React, { useState } from 'react';
import { Collapse, Segmented } from 'antd';
import style from './index.less';
import Empty from '@/components/Empty';
import Question from '@/components/Question';
import myScripts, { scriptTypes } from '@/scripts';

const { Panel } = Collapse;

let isEmpty = 0;

export default function Active() {
  const [type, setType] = useState<string | number>('外观');

  function changeType(t: string | number) {
    isEmpty = 0;
    setType(t);
  }

  return (
    <div className={style['data-config-wrapper']}>
      <div className={style['config-title']}>
        脚本配置
        <Question link="guidebook" />
      </div>
      <Segmented options={scriptTypes} value={type} onChange={changeType} />
      <div className={style['data-container']}>
        <Collapse accordion>
          {myScripts.map((o) => {
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

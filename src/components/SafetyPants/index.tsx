import React from 'react';
import { SyncOutlined } from '@ant-design/icons';
import style from './index.less';
import { ErrorFallback } from '../ErrorBoundary';

export default function SafetyPants(props: ErrorFallback) {
  return (
    <div className={style['safety-pants-wrapper']}>
      <div className={style['message-box']}>
        <div>出错了，请重新加载</div>
        <SyncOutlined
          className={style['rf-btn']}
          onClick={props?.resetErrorBoundary}
        />
      </div>
    </div>
  );
}

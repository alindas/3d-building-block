import { useState } from 'react';
import { connect } from 'umi';
import { Input } from 'antd';

import style from './setting.less';

function Setting(props: any) {
  return (
    <div>
      <div className={style['set-panel']}>
        <div className={style['set-item']}>
          <div className={style['set-item-title']}>
            <span>配置文件</span>
          </div>
          <div className={style['set-item-value']}>
            <div className={style['set-item-config']}>
              <Input.TextArea allowClear autoSize defaultValue={'{}'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default connect((state: any) => ({
  menuProject: state.project,
}))(Setting);

import { useState } from 'react';
import { connect } from 'umi';
import { Input } from 'antd';

import style from './setting.less';
import helper from './helper.json';

function Setting(props: any) {
  return (
    <div>
      <div className={style['set-panel']}>
        <div className={style['set-item']}>
          <div className={style['set-item-title']}>
            <span>操作</span>
          </div>
          <div className={style['set-item-value']}>
            {helper.map((o) => (
              <div className={style['set-item-readme']} key={o.desc}>
                <div className={style['set-item-readme-item']}>
                  <span>{o.desc}</span>
                  <span>{o.ops}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

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

import React from 'react';
import { Select } from 'antd';
import { connect } from 'umi';

import style from './index.less';
import { scriptOps } from '@/scripts';

const DataBind: React.FC<any> = (props) => {
  function bindService(val, ops) {
    console.log(val, ops);
  }

  function bindScript(val, ops) {
    console.log(val, ops);
  }

  return (
    <div className={style['data-bind-wrapper']}>
      <div className={style['data-bind']}>
        <span>数据模型</span>
        <Select
          className={style.select}
          size="small"
          showArrow={true}
          bordered={false}
          mode="multiple"
          onChange={bindService}
        ></Select>
      </div>

      <div className={style['data-bind']}>
        <span>脚本模型</span>
        <Select
          className={style.select}
          size="small"
          showArrow={true}
          bordered={false}
          mode="multiple"
          options={scriptOps}
          onChange={bindScript}
        ></Select>
      </div>
    </div>
  );
};
export default connect((state: any) => ({
  sceneModel: state.scene,
  attributeModel: state.attribute,
}))(DataBind);

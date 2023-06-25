import React from 'react';
import { Select } from 'antd';
import { connect } from 'umi';

import style from './index.less';

const DataBind: React.FC<any> = (props) => {
  return (
    <div className={style['data-bind']}>
      <span>数据模型</span>
      <Select
        className={style.select}
        size="small"
        showArrow={true}
        bordered={false}
      ></Select>
    </div>
  );
};
export default connect((state: any) => ({
  sceneModel: state.scene,
  attributeModel: state.attribute,
}))(DataBind);

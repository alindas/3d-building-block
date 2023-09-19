import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import { connect } from 'umi';

import style from './index.less';
import { scriptOps } from '@/scripts';

const DataBind: React.FC<any> = ({ selectedModel }) => {
  const [scs, setSC] = useState<(string | number)[]>([]);

  useEffect(() => {
    setSC(window.myScript.getSc(selectedModel?.id) ?? []);
  }, [selectedModel]);

  function bindService(val, ops) {
    console.log(val, ops);
  }

  function bindScript(val: string | number) {
    window.myScript.bind(selectedModel, val);
    setSC([...window.myScript.getSc(selectedModel.id)]);
  }

  function unbindScript(val: string | number) {
    window.myScript.unbind(selectedModel.id, val);
    setSC([...window.myScript.getSc(selectedModel.id)]);
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
          value={scs}
          options={scriptOps}
          onSelect={bindScript}
          onDeselect={unbindScript}
        ></Select>
      </div>
    </div>
  );
};
export default connect((state: any) => ({
  selectedModel: state.scene.selectedModel,
}))(DataBind);

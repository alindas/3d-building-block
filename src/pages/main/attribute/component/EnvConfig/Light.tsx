import React from 'react';
import { connect } from 'umi';
import { Select } from 'antd';

import style from './index.less';
import sceneConfig from '@/common/sceneConfigList';

const { Option } = Select;

// 选择光源
const selectLight = (value: string) => {
  console.log(`选择的光的sceneLighConfigtId：${value}`);
  // 1 根据sceneModal中的workbenchScene.light.lightId，remove原来的光源，释放原光源的把内存
  // 2 根据选择的sceneLighConfigtId，到sceneConfig.sceneLighConfigtConfig数据中去获取到选择的光源信息，add到场景中
  // 3 sceneModal中的workbenchScene.light.lightId改为最新场景的灯光id,workbenchScene.light.sceneLighConfigtId改为选择的value
};

function Light(props: any) {
  const { dispatch, sceneModel, menuProject } = props;
  const { preProjectId } = menuProject; //菜单menu中的工程数据 当前工程id
  const {
    workbenchScene, //当前工程配置信息
  } = sceneModel;

  return (
    <div className={style['select-box']}>
      <span>环境光 </span>
      <Select
        className={style.select}
        // dropdownClassName={styles.selectLightDrop}
        // defaultValue={workbenchScene.light.sceneLighConfigtId}
        style={{ width: '75%' }}
        size="small"
        showArrow={true}
        bordered={false}
        // onChange={selectLight}
        disabled={preProjectId === ''}
      >
        {/* {sceneConfig.sceneLighConfigtConfig.map((o: any) => {
        return (
          <Option value={o.sceneLighConfigtId} key={o.sceneLighConfigtId}>
            {o.sceneLighConfigtName}
          </Option>
        );
      })} */}
      </Select>
    </div>
  );
}

export default connect((state: any) => ({
  menuProject: state.project,
  sceneModel: state.scene,
}))(Light);

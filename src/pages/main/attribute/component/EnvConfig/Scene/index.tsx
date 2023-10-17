import React, { useEffect, useState } from 'react';
import { Select, message, Checkbox } from 'antd';
import type { MessageType } from 'antd/lib/message';
import { connect, SceneState } from 'umi';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EquirectangularReflectionMapping, Color } from 'three';

import style from './index.less';
import { ConnectProps } from '@/common/type';
import ColorPicker from '@/components/ColorPicker';
const { Option, OptGroup } = Select;

// 默认贴图
const DefaultEnv = [
  {
    value: '',
    label: '无',
  },
  {
    value: '/images/envMap/982960.hdr',
    label: '仓库',
  },
  {
    value: '/images/envMap/988114.hdr',
    label: '正门',
  },
  {
    value: '/images/envMap/990774.hdr',
    label: '后门',
  },
  {
    value: '/images/envMap/991875.hdr',
    label: '地下室',
  },
];

let changeProcess: MessageType;

function SceneMap(props: ConnectProps<SceneState>) {
  const { dispatch, sceneEnv, customSceneEnvList } = props;

  const [bgColor, setBgColor] = useState('#333333');

  useEffect(() => {
    // 设置环境贴图
    if (Reflect.has(window, 'scene') && typeof sceneEnv == 'string') {
      if (sceneEnv === '') {
        window.scene.background = new Color(bgColor);
        window.scene.environment = null;
        // changeProcess instanceof Function && changeProcess();
      } else {
        changeProcess = message.loading('场景加载中...', 0);
        new RGBELoader().load(sceneEnv, function (texture) {
          texture.mapping = EquirectangularReflectionMapping;

          window.scene.background = texture;
          window.scene.environment = texture;

          texture.dispose();

          changeProcess instanceof Function && changeProcess();
        });
      }
    }
  }, [sceneEnv]);

  function selectEnv(val: string) {
    // console.log('val', val, 'op', op);

    dispatch({
      type: 'scene/updateSceneEnv',
      payload: val,
    });
  }

  // 用户上传环境贴图
  function uploadSceneMap(e: any) {
    const env = e.target.files[0];
    if (!/\.hdr$/.test(env.name)) {
      message.error('错误的文件类型！请选择 hdr 格式');
      return;
    }
    // console.log(env);
    const envUrl = window.URL.createObjectURL(env);
    // console.log(envUrl);

    dispatch({
      type: 'scene/updateCustomSceneEnvList',
      payload: {
        option: {
          value: envUrl,
          label: env.name.slice(0, -4),
        },
        url: envUrl,
      },
    });

    e.target.value = '';
  }

  function changeColor({ hex }: { hex: string }) {
    setBgColor(hex);
    if (sceneEnv === '') {
      window.scene.background = new Color(hex);
    }
  }

  function changeHelper(e: any) {
    const helper = window.scene.getObjectByProperty('type', 'GridHelper');
    if (typeof helper !== 'undefined') {
      helper.visible = e.target.checked;
    }
  }

  return (
    <div>
      <div className={style['select-box']}>
        <span>贴图</span>
        <Select
          className={style.select}
          style={{ width: '75%' }}
          value={sceneEnv}
          size="small"
          showArrow={true}
          bordered={false}
          onSelect={selectEnv}
        >
          <OptGroup label="默认">
            {DefaultEnv.map((env) => (
              <Option key={env.value} value={env.value}>
                {env.label}
              </Option>
            ))}
          </OptGroup>
          <OptGroup label="自定义">
            {customSceneEnvList.map((env) => (
              <Option key={env.value} value={env.value}>
                {env.label}
              </Option>
            ))}
            <Option value={0}>
              上传
              <input
                type="file"
                accept=".hdr"
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  opacity: 0,
                }}
                onChange={uploadSceneMap}
              />
            </Option>
          </OptGroup>
        </Select>
      </div>

      <div className={style['select-box']}>
        <span>背景</span>
        <div className={style['picker']}>
          <ColorPicker color={bgColor} onChange={changeColor} />
        </div>
      </div>

      <div className={style['select-box']}>
        <span>网格</span>
        <Checkbox onChange={changeHelper} defaultChecked={true} />
      </div>
    </div>
  );
}

export default connect(({ scene }: any) => ({
  sceneEnv: scene.sceneEnv,
  customSceneEnvList: scene.customSceneEnvList,
}))(SceneMap);

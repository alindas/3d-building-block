import MyJSONEditor from '@/components/MyJSONEditor';
import { useEffect, useMemo, useState } from 'react';
import { connect, ProjectState } from 'umi';
import { ConnectProps } from '@/common/type';
import { message } from 'antd';

import style from './config.less';
import { handleMove } from '@/utils/common';

let controlJSON: { json: object } | { text: string }; // 编辑器实时编辑的内容

function Config(
  props: ConnectProps<{
    Project: ProjectState;
    auto: boolean;
    configEffect: boolean;
  }>,
) {
  const { projectInfo, modelsConfig, lightConfig, cameraConfig } =
    props.Project;

  const [isFloat, setFloat] = useState(false);
  const [readOnly, setMode] = useState(true);
  const [hasWrong, setWrong] = useState(false);
  const [configJSON, setJSON] = useState<{ json: object }>({
    json: { projectInfo, modelsConfig, lightConfig, cameraConfig },
  });

  /**
   * 开启自动保存时，实时更新，并保存到本地
   */
  useEffect(() => {
    // console.log('auto')
    setJSON({
      json: { projectInfo, modelsConfig, lightConfig, cameraConfig },
    });
    if (window.autoSave) {
      // todo 保存到本地
    }

    // return () => {

    // }
  }, [props.configEffect]);

  function handleFloat() {
    const node = document.getElementById('config-box')!;
    const handle = document.getElementById('config-box-handle')!;
    if (isFloat) {
      handle.onmouseup = null;
      node.classList.remove(style['config-box']);
    } else {
      handle.onmousedown = (e) => handleMove(e, handle, node);
      node.classList.add(style['config-box']);
    }
    setFloat((f) => !f);
  }

  function handleEdit() {
    // 存在工程方可编辑
    if (window.projectId === -1) {
      message.info('请先创建工程');
      return;
    }
    if (!readOnly) {
      // todo 检查是否合法，去除不能被修改的地方
      if (hasWrong) {
        const node = document.querySelector('.ant-tabs-content-holder')!;
        node.scrollTop = node.scrollHeight;
        return;
      } else if (typeof controlJSON === 'object') {
        let configObj;
        if (Reflect.has(controlJSON, 'json')) {
          // @ts-ignore
          configObj = controlJSON.json;
        } else if (Reflect.has(controlJSON, 'text')) {
          // @ts-ignore
          configObj = JSON.parse(controlJSON.text);
        }
        setJSON({ json: configObj });
        props.dispatch({
          type: 'project/updateProject',
          payload: configObj,
        });
      }
    }
    setMode((m) => !m);
  }

  function handleWrite(ctn: any, prev: any, status: any) {
    // console.log(ctn, prev, status);

    controlJSON = ctn;
    setWrong(status.contentErrors !== null ? true : false);
  }

  return (
    <div id="config-box">
      <div className={style['config-options']}>
        <span>【{readOnly ? '只读' : '限制编辑'}】</span>
        <span
          id="config-box-handle"
          className={style['config-options-handle']}
        ></span>
        <div className={style['config-options-btn']}>
          <span onClick={handleFloat}>{isFloat ? <i>停靠</i> : '窗口'}</span>
          <span onClick={handleEdit}>{readOnly ? '编辑' : <i>保存</i>}</span>
          {!readOnly && (
            <span onClick={() => setMode((m) => !m)}>
              <i>取消</i>
            </span>
          )}
          {/* <span>导入</span> */}
        </div>
      </div>
      <MyJSONEditor
        // @ts-ignore，数据符合。类型报错
        content={configJSON}
        readOnly={readOnly}
        onChange={handleWrite}
      />
    </div>
  );
}

export default connect((state: any) => ({
  Project: state.project,
  configEffect: state.effect.configEffect,
}))(Config);

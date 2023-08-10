import MyJSONEditor from '@/components/MyJSONEditor';
import { useState } from 'react';
import { connect, ProjectState } from 'umi';
import { ConnectProps } from '@/common/type';

import style from './config.less';

function Config(props: ConnectProps<{ Project: ProjectState }>) {
  const { projectInfo, modelsConfig, lightConfig, cameraConfig } =
    props.Project;
  const configJSON = { projectInfo, modelsConfig, lightConfig, cameraConfig };

  const [readOnly, setMode] = useState(true);
  const [hasWrong, setWrong] = useState(false);

  function handleFloat() {}

  function handleEdit() {
    if (!readOnly) {
      // todo 检查是否合法，去除不能被修改的地方
      if (hasWrong) {
        const node = document.querySelector('.ant-tabs-content-holder')!;
        node.scrollTop = node.scrollHeight;
        return;
      } else {
        // todo save
      }
    }
    setMode((m) => !m);
  }

  function handleWrite(ctn: any, prev: any, status: any) {
    console.log(status);
    setWrong(status.contentErrors !== null ? true : false);
  }

  return (
    <div>
      <div className={style['config-options']}>
        <span>【{readOnly ? '只读' : '限制编辑'}】</span>
        <div className={style['config-options-btn']}>
          <span onClick={handleFloat}>悬浮</span>
          <span onClick={handleEdit}>{readOnly ? '编辑' : <b>保存</b>}</span>
          <span>导入</span>
        </div>
      </div>
      <MyJSONEditor
        content={{ json: configJSON }}
        readOnly={readOnly}
        onChange={handleWrite}
      />
    </div>
  );
}

export default connect((state: any) => ({
  Project: state.project,
}))(Config);

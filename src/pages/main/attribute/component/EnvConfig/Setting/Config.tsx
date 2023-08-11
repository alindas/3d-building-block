import MyJSONEditor from '@/components/MyJSONEditor';
import { useMemo, useState } from 'react';
import { connect, ProjectState } from 'umi';
import { ConnectProps } from '@/common/type';

import style from './config.less';

let controlJSON: { text: string }; // 编辑器实时编辑的内容

function Config(props: ConnectProps<{ Project: ProjectState }>) {
  const { projectInfo, modelsConfig, lightConfig, cameraConfig } =
    props.Project;

  const [readOnly, setMode] = useState(true);
  const [hasWrong, setWrong] = useState(false);
  const [configJSON, setJSON] = useState<{ json: object }>({
    json: { projectInfo, modelsConfig, lightConfig, cameraConfig },
  });

  function handleFloat() {}

  function handleEdit() {
    if (!readOnly) {
      // todo 检查是否合法，去除不能被修改的地方
      if (hasWrong) {
        const node = document.querySelector('.ant-tabs-content-holder')!;
        node.scrollTop = node.scrollHeight;
        return;
      } else {
        setJSON({ json: JSON.parse(controlJSON.text) });
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
    <div>
      <div className={style['config-options']}>
        <span>【{readOnly ? '只读' : '限制编辑'}】</span>
        <div className={style['config-options-btn']}>
          <span onClick={handleFloat}>悬浮</span>
          <span onClick={handleEdit}>{readOnly ? '编辑' : <i>保存</i>}</span>
          {!readOnly && (
            <span onClick={() => setMode((m) => !m)}>
              <i>取消</i>
            </span>
          )}
          <span>导入</span>
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
}))(Config);

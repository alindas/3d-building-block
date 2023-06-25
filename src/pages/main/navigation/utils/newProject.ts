import { getDvaApp } from 'umi';
import { Modal } from 'antd';

import saveProjectConfig from './saveProjectConfig';
import ExportProject from './exportProject';

function NewProject() {
  const store = getDvaApp()._store;

  // 点击新建按钮时，是否需要保存当前工程
  if (store.getState().project.projectInfo !== null) {
    Modal.confirm({
      title: '是否保存当前工程到本地?',
      transitionName: '',
      onCancel: () => {
        // 清空当前工作台，导入新工程
        initNewProject();
      },
      onOk: () => {
        // 保存当前工作台，导入新工程
        saveProjectConfig();
        ExportProject();
        initNewProject();
      },
    });
  } else {
    initNewProject();
  }

  // 初始化新项目
  function initNewProject() {
    const initialProjectInfo = {
      name: new Date().valueOf(),
      models: {},
      config: {},
    };

    store.dispatch({
      type: 'project/saveProject',
      payload: initialProjectInfo,
    });

    store.dispatch({
      type: 'scene/initWorkbenchModel',
      payload: null,
    });
  }
}
export default NewProject;

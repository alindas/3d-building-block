import React from 'react';
import { connect, ProjectState } from 'umi';
import { message, Modal } from 'antd';
import * as THREE from 'three';

// import { ColladaLoader } from '@/utils/ColladaLoader.js'; //导入ade模型
import getFileType from '@/utils/getFileType'; //方法：根据文件名获取文件类型
import { ConnectProps } from '@/common/type';
import ExportProject from '../../utils/exportProject';
import saveProjectConfig from '../../utils/saveProjectConfig';

// 获取配置文件方法
function getProjectConfigData(file: any) {
  return new Promise(function (resolve, reject) {
    try {
      let reader = new FileReader();
      reader.readAsText(file); //读取文件的内容,也可以读取文件的URL
      reader.onload = function () {
        if (typeof this.result === 'string') {
          resolve(JSON.parse(this.result));
        } else {
          throw new Error();
        }
      };
    } catch {
      reject('读物配置文件失败');
    }
  });
}

function ImpFiles(
  props: ConnectProps<{
    projectModel: ProjectState;
  }>,
) {
  const { dispatch } = props;
  const { projectInfo } = props.projectModel;

  const confirmBase = () => {
    // 点击导入按钮时，是否需要保存当前工程
    console.log('confirm', projectInfo);
    if (projectInfo !== null) {
      window.cmd.clear();
      Modal.confirm({
        title: '是否保存当前工程到本地?',
        // 内部方法，去除对话框过渡动画
        transitionName: '',
        onCancel: () => {
          // 清空当前工作台，导入新工程
          document.getElementById('import-input')!.click();
        },
        onOk: () => {
          // 保存当前工作台，导入新工程
          saveProjectConfig();
          ExportProject();
          document.getElementById('import-input')!.click();
        },
      });
    } else {
      document.getElementById('import-input')!.click();
    }
  };

  // 导入工程
  const initProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let model_files: File[] = []; // 模型文件
    // 没有配置文件时，模型导入后以场景全景视图为中心点
    let config = {}; // 配置文件
    const files = e.target.files; //文件夹下的文件
    const filesLength = files?.length; //文件夹长度
    // 选择了文件才往下执行
    if (filesLength && filesLength > 0 && files[0]) {
      const project_name = files[0].webkitRelativePath.split('/')[0]; //文件夹名字

      for (let i = 0; i < filesLength; i++) {
        const file = files[i]; //文件夹下的某一个文件
        const file_name = file?.name; //读取选中文件的文件名
        const file_type = getFileType(file_name); //选中文件的类型

        // 3d模型文件
        if (file_name && file_type.type === 'model') {
          model_files.push(file);
        } else if (file_name && file_type.type === 'config') {
          // 配置文件
          // 获取配置文件方法
          await getProjectConfigData(file)
            .then((res: any) => (config = res))
            .catch((err) => message.error(err));
        }
      }

      dispatch({
        type: 'project/saveProject',
        payload: {
          name: project_name,
          models: [],
          config,
        },
      });

      await loadModels(model_files);

      // 清空导入input的value,防止下次不能导入同一个工程
      e.target.value = '';
      message.destroy();
    } else {
      message.error('空文件夹');
    }
  };

  //  获取模型数据
  const loadModels = (files: File[]) => {
    return new Promise((resolve) => {
      window.loader.loadModel(files, (models) => {
        let group = new THREE.Group();
        models.forEach((o) => group.add(o));
        dispatch({
          type: 'scene/initWorkbenchModel',
          payload: group,
        });
        resolve('');
      });
    });
  };

  return (
    <div style={{ display: 'none' }}>
      <button id="import-btn" onClick={confirmBase}></button>
      <input
        type="file"
        id="import-input"
        // @ts-ignore
        webkitdirectory="true"
        onChange={initProject}
      ></input>
    </div>
  );
}

export default connect((state: any) => ({
  projectModel: state.project,
}))(ImpFiles);

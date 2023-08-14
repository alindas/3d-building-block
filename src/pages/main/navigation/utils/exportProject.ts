import { message } from 'antd';
import JSZip from 'jszip'; //导出压缩包方法
import { ColladaExporter } from '@/utils/correct-package/three/exporter/ColladaExporter'; //导出成dae方法
import { ProjectState, getDvaApp } from 'umi';
import request from '@/service/request';
import saveProjectConfig from './saveProjectConfig';

// 保存导出
function ExportProject(type: 'save' | 'export', onDone: any) {
  // console.log('type', type);
  const store = getDvaApp()._store.getState();
  const { projectInfo, modelsConfig, lightConfig, cameraConfig } =
    store.project as ProjectState;

  if (projectInfo === null) {
    message.info('无工程');
    onDone();
    return;
  }

  message.loading('执行中，请耐心等候...', 0);
  // 将下面的导出包裹在 setTimeout 函数中
  const exporter = new ColladaExporter();

  let ExpZipData: any = []; //下载的文件的信息数组

  const projectConfig = {
    lightConfig,
    cameraConfig,
    modelsConfig,
  };

  ExpZipData.push({
    name: 'projectConfig.json',
    src: new Blob([JSON.stringify(projectConfig)], {
      type: 'text/json;charset=utf-8',
    }),
  });

  const workbenchModel = store.scene.workbenchModel as THREE.Object3D;
  // 3生成模型
  if (workbenchModel !== null) {
    try {
      workbenchModel.children.forEach((o) => {
        console.log('each');
        const result = exporter.parse(o, undefined, {
          upAxis: 'Y_UP',
          unitName: 'millimeter',
          unitMeter: 0.0254,
        });
        console.log('here');
        ExpZipData.push({
          name: `${o.name}` + '.dae',
          src: new Blob([result?.data]),
        });
      });
    } catch {
      message.error('导出模型出错，请检查模型是否标准');
    }
  }
  // console.log('build');

  buildZip(ExpZipData, projectInfo.name, type ?? 'export', onDone);
}

//合成压缩包
function buildZip(
  data: any,
  name: string,
  type: 'save' | 'export',
  onDone: () => void,
) {
  let zip = new JSZip(); //初始化
  for (let i = 0; i < data.length; i++) {
    let obj = data[i];
    zip.file(obj.name, obj.src);
  }
  zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
    // 保存到云端or导出到本地
    if (type === 'save') {
      // todo 上传至云端，test config
      let config = saveProjectConfig();
      // console.log('config', config);
      request
        .post('/api/save', {
          project: name,
          config,
        })
        .then(() => {
          message.destroy();
          message.success('数据已保存到云端');
          onDone();
        })
        .catch(() => {
          message.destroy();
          message.error('数据保存失败');
          onDone();
        });
    } else if (type === 'export') {
      downloadZip(content, name);
      onDone();
      message.destroy();
    }
  });
}

// 下载压缩包
function downloadZip(content: any, proName: string) {
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  link.download = `${proName}.zip`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function AsyncExport(type?: 'save' | 'export') {
  return new Promise((resolve) => {
    ExportProject((type = 'save'), resolve);
  });
}

export default AsyncExport;

import { message } from 'antd';
import JSZip from 'jszip';
import { ProjectState, getDvaApp } from 'umi';
import request from '@/service/request';
import saveProjectConfig from './saveProjectConfig';
import { GLTFExporter } from '@/utils/correct-package/three/gltf/exporter';

// 保存导出
async function ExportProject(type: 'save' | 'export', onDone: any) {
  // console.log('type', type);
  const store = getDvaApp()._store.getState();
  const { projectInfo } = store.project as ProjectState;

  if (projectInfo === null) {
    message.info('无工程');
    onDone();
    return;
  }

  message.loading('执行中，请耐心等候...', 0);

  const config = saveProjectConfig();

  const exporter = new GLTFExporter();

  const ZipData: any = [
    {
      name: 'projectConfig.json',
      src: new Blob([JSON.stringify(config)], {
        type: 'text/json;charset=utf-8',
      }),
    },
  ];

  const zip = new JSZip(); //初始化
  const folder = zip.folder(projectInfo.name ?? '3D组态')!;

  const workbenchModel = store.scene.workbenchModel as THREE.Object3D;
  // 3生成模型
  if (workbenchModel !== null) {
    try {
      await new Promise((resolve) => {
        let i = 0,
          max = workbenchModel.children.length;
        for (let o of workbenchModel.children) {
          // const name = o.name.replace(/[<>:"/\\|?*]/g, '') // 过滤非法限制
          const name = o.id; // 存在名字重合的情况
          exporter.parse(
            o,
            function (gltf: any) {
              let blob;
              if (gltf instanceof ArrayBuffer) {
                blob = new Blob([gltf], { type: 'application/octet-stream' });
              } else {
                const output = JSON.stringify(gltf, null, 2);
                blob = new Blob([output], { type: 'text/plain' });
              }
              ZipData.push({
                name: `model/${name}` + '.gltf',
                src: blob,
              });
              i++;
              if (i === max) {
                resolve(undefined);
              }
            },
            (e: any) => {
              i++;
              if (i === max) {
                resolve(undefined);
              }
              throw new Error(JSON.stringify(e));
            },
            {},
          );
        }
      });
    } catch (e) {
      message.error('模型打包出错，请检查模型是否标准');
      console.error(e);
    }
  }
  for (let data of ZipData) {
    folder.file(data.name, data.src);
  }

  zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
    if (type === 'save') {
      const formData = new FormData();
      formData.append('file', content, projectInfo.name ?? '3D组态');
      request
        .post('test/save', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
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
      downloadZip(content, projectInfo.name);
      onDone();
      message.destroy();
    }
  });
}

// 下载压缩包
function downloadZip(content: any, proName: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content]));
  a.download = `${proName}.zip`;
  a.click();
  a.remove();
}

function AsyncExport(type?: 'save' | 'export') {
  return new Promise((resolve) => {
    ExportProject(type ?? 'save', resolve);
  });
}

export default AsyncExport;

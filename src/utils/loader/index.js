import { LoadingManager } from 'three';
import { message } from 'antd';
import FBXLoader from '../three-correct/fbxloader';
import getFileType from '../getFileType';

function getLoader(type) {
  switch (type) {
    case 'FBX':
      return FBXLoader;
    default: {
      console.error('Loader: Invalid model type.');
      return null;
    }
  }
}

class Loader {
  constructor() {
    this.loading = false;

    this.loadModel = (files, cb) => {
      this.loading = true;
      const models = [];
      message.loading('模型导入中...');
      const manager = new LoadingManager();
      manager.onLoad = () => {
        this.loading = false;
        message.destroy();
        cb(models);
      };
      manager.onProgress = (url, loaded, total) => {
        console.log('Loaded ' + loaded + ' of ' + total + ' files.');
      };
      manager.onError = (url) => {
        window.URL.revokeObjectURL(url);
        console.error('There was an error loading ' + url);
      };

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const file_name = file?.name; //读取选中文件的文件名
        const file_type = getFileType(file_name); //选中文件的类型
        const modelURL = window.URL.createObjectURL(file);

        if (file_name && file_type.type === 'model') {
          try {
            const Loader = getLoader(file_type.value);
            if (Loader === null) {
              message.error('不支持的3D模型：' + file_type.value);
              return;
            }
            const loader = new Loader(manager);

            // 导入模拟模型
            loader.load(modelURL, (model) => {
              window.URL.revokeObjectURL(modelURL);

              if (model.children[0]?.type === 'Group') {
                model = model.children[0];
              }

              model.name = file_name.split('.')[0];
              models.push(model);
            });
          } catch {
            message.error('模型加载失败：' + file_name);
          }
        } else {
          message.error(file_name + '不是3D模型');
        }
      }
    };
  }
}

export default Loader;

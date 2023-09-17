import { LoadingManager } from 'three';
import { message } from 'antd';
import FBXLoader from '../correct-package/three/fbxloader';
// import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import getFileType from '../getFileType';
import Loading from '@/components/Loading';

function getLoader(type) {
  switch (type) {
    case 'FBX':
      return FBXLoader;

    case 'GLTF':
      return GLTFLoader;

    default: {
      console.error('Loader: Invalid model type.');
      return null;
    }
  }
}

function LoaderModel(type, url, manager, cb) {
  switch (type) {
    case 'FBX':
      new FBXLoader(manager).load(url, (model) => {
        // cb(model.children[0]?.type === 'Group' ? model.children[0] : model);
        cb(model);
      });
      break;

    case 'GLTF':
      new GLTFLoader(manager).load(url, (model) => {
        cb(model.scene.children[0]);
      });
      break;

    default: {
      message.error('不支持的3D模型：' + type);
      console.error('Loader: Invalid model type.');
    }
  }
}

class Loader {
  constructor() {
    this.loading = false;
  }

  loadModel = (files, cb) => {
    // console.log(files)
    if (files.length === 0) {
      cb([]);
    }
    const models = [];
    const manager = new LoadingManager();
    manager.onStart = () => {
      this.loading = true;
      Loading.start({ type: 'loading', msg: '模型加载中' });
      // message.loading('模型导入中...');
    };
    manager.onLoad = () => {
      this.loading = false;
      // message.destroy();
      Loading.done();
      cb(models);
    };
    manager.onProgress = (url, loaded, total) => {
      console.log('Loaded ' + loaded + ' of ' + total + ' files.');
      Loading.refresh(
        undefined,
        `模型加载中 ${((loaded / total) * 100).toFixed(2)}%`,
      );
    };
    manager.onError = (url) => {
      window.URL.revokeObjectURL(url);
      console.error('There was an error loading ' + url);
      message.error('模型加载失败：' + url);
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const file_name = file?.name; //读取选中文件的文件名
      const file_type = getFileType(file_name); //选中文件的类型
      const modelURL = file?.url ?? window.URL.createObjectURL(file);
      if (file_name && file_type.type === 'model') {
        try {
          LoaderModel(file_type.value, modelURL, manager, (m) => {
            window.URL.revokeObjectURL(modelURL);
            m.name = file_name.split('.')[0];
            models.push(m);
          });
        } catch (e) {
          message.error('未知错误');
          console.error(e);
        }
      } else {
        message.error(file_name + '不是3D模型');
      }
    }
  };
}

export default Loader;

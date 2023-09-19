import { Quaternion, Vector3 } from 'three';
import Process from './utils/process';
import Loader from '@/utils/loader';
import '@/utils/correct-package/svelet-jsoneditor/themes/jse-theme-dark.css';
import GlobalEnv from './utils/myScript/global';
import MyScript from './utils/myScript';
import MyServices from './utils/myServices';
import CloudEnv from './utils/myServices/cloud';

(async () => {
  window.vector3 = new Vector3();
  window.quaternion = new Quaternion();
  window.cmd = new Process();
  window.loader = new Loader();
  window.autoSave = true;
  window.projectId = -1;
  window.multiple = false;
  window.globalEnv = new GlobalEnv();
  window.cloudEnv = new CloudEnv();
  window.myScript = new MyScript();
  window.myService = new MyServices();
})();

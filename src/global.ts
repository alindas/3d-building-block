import { Quaternion, Vector3 } from 'three';
import Process from './utils/process';
import Loader from '@/utils/loader';
import '@/utils/correct-package/svelet-jsoneditor/themes/jse-theme-dark.css';

(async () => {
  window.vector3 = new Vector3();
  window.quaternion = new Quaternion();
  window.cmd = new Process();
  window.loader = new Loader();
  window.autoSave = true;
  window.projectId = -1;
  window.multiple = false;
})();

import { Quaternion, Vector3 } from 'three';
import Process from './utils/process';

(async () => {
  window.vector3 = new Vector3();
  window.quaternion = new Quaternion();
  window.cmd = new Process();
})();

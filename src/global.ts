import { Quaternion, Vector3 } from 'three';
import Process from './utils/process';
import Loader from '@/utils/loader';

(async () => {
  window.vector3 = new Vector3();
  window.quaternion = new Quaternion();
  window.cmd = new Process();
  window.loader = new Loader();
})();

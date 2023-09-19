import { scriptTypes } from '.';

export interface ScriptObject {
  id: number | string;
  type: typeof scriptTypes[number];
  title: string;
  desc: string;
  ctx: (local: any, services: any, self: THREE.Object3D) => void;
}

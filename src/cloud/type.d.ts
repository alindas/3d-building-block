import { cloudTypes } from '.';

export interface CloudObject {
  id: number | string;
  type: typeof cloudTypes[number];
  title: string;
  desc: string;
}

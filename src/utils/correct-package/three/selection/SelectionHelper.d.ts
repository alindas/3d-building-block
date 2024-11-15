import { WebGLRenderer, Vector2 } from 'three';

import { SelectionBox } from './SelectionBox';

export class SelectionHelper {
  constructor(renderer: WebGLRenderer, cssClassName: string);
  element: HTMLElement;
  isDown: boolean;
  pointBottomRight: Vector2;
  pointTopLeft: Vector2;
  renderer: WebGLRenderer;
  startPoint: Vector2;

  onSelectStart(event: Event): void;
  onSelectMove(event: Event): void;
  onSelectOver(event: Event): void;
}

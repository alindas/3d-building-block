import { SelectionBox } from './SelectionBox';
import { SelectionHelper } from './SelectionHelper';

class Selection {
  constructor(scene, camera, renderer, cssClassName, onSelect) {
    this.camera = camera;
    this.selectionBox = new SelectionBox(camera, scene);
    this.helper = new SelectionHelper(renderer, cssClassName);
    this.isDown = false;

    renderer.domElement.addEventListener('pointerdown', (event) => {
      if (!window.enableSelect || event.button > 0) return;

      this.isDown = true;
      this.selectionBox.startPoint.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5,
      );
    });

    renderer.domElement.addEventListener('pointermove', (event) => {
      if (!window.enableSelect || event.button > 0) return;

      if (this.helper.isDown) {
        this.selectionBox.endPoint.set(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1,
          0.5,
        );
      }
    });

    renderer.domElement.addEventListener('pointerup', (event) => {
      if (!window.enableSelect || !this.isDown || event.button > 0) return;

      this.isDown = false;
      this.selectionBox.endPoint.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5,
      );

      const allSelected = this.selectionBox.select();
      const topSelected = {};
      allSelected.forEach((sl) => {
        const top = getTopParent(sl);
        if (top) {
          topSelected[top] = 1;
        }
      });

      onSelect?.(topSelected);
    });
  }

  update(scene) {
    this.selectionBox.updateScene(scene);
  }
}

function getTopParent(mesh) {
  if (typeof mesh === 'undefined' || mesh === null) {
    return null;
  }
  if (mesh.parent.parent?.isScene) {
    return mesh.id;
  } else {
    return getTopParent(mesh.parent);
  }
}

export default Selection;

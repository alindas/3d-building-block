import {
  ImageLoader,
  Texture,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  DoubleSide
} from 'three'

class ClickEffect {
  constructor(scene, texture = '/texture/spotd.png') {
    this.textures = []
    this.index = 0
    this.mesh = undefined

    new ImageLoader().load(texture, (image) => {
      let canvas, context, geometry, material;
      let w = image.width;
      let num = image.height / image.width;

      for (let i = 0; i < num; i++) {
        this.textures[i] = new Texture();
      }
      for (let i = 0; i < num; i++) {
        canvas = document.createElement('canvas');
        context = canvas.getContext('2d');
        canvas.height = w;
        canvas.width = w;
        context.drawImage(image, 0, w * i, w, w, 0, 0, w, w);
        this.textures[i].image = canvas;
        this.textures[i].needsUpdate = true;
      }

      geometry = new PlaneGeometry(1, 1); // 平面材质适用在某个平面上
      // geometry = new SphereGeometry( 15, 32, 16 );
      material = new MeshBasicMaterial({
        map: this.textures[0],
        transparent: true,
        side: DoubleSide,
      });

      this.mesh = new Mesh(geometry, material);
      this.mesh.rotateX(Math.PI / 2);
      this.mesh.visible = true;
      // this.mesh.scale.set(50, 50, 50)

      scene.add(this.mesh);
      console.log(scene)
    });

  }

  effect(vec3) {
    this.mesh.visible = true;
    this.mesh.position.copy(vec3);
    let id = setInterval(() => {
      if (this.index == 10) {
        this.index = 0;
        this.mesh.visible = false;
        clearInterval(id);
      }
      this.mesh.material.map = this.textures[this.index];
      this.index++;
    }, 20)
  }
}

export default ClickEffect

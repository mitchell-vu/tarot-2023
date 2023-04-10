import * as THREE from "three";

import { Assets } from "@/modules/Tarot/Assets";
import { FRUSTUM_SIZE } from "@/modules/Tarot/constants";

class Points {
  group: THREE.Group;

  static createPointsMesh(coords: Coords, count = 100, size = 1, opacity = 1): THREE.Points {
    const vertices = [];

    for (let i = 0; i < count; i += 1) {
      const x = THREE.MathUtils.randFloatSpread(coords.x);
      const y = THREE.MathUtils.randFloatSpread(coords.y);
      const z = THREE.MathUtils.randFloatSpread(100);

      vertices.push(x, y, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
      size,
      transparent: true,
      opacity,
      map: Assets.get("starTexture"),
      fog: false,
    });

    material.userData = {
      defaultOpacity: opacity,
    };

    return new THREE.Points(geometry, material);
  }

  /**
   * @constructor
   */
  constructor(width: number, height: number) {
    const aspectRatio = width / height;
    this.group = new THREE.Group();

    const stars1 = Points.createPointsMesh({ x: FRUSTUM_SIZE * aspectRatio, y: FRUSTUM_SIZE }, 5, 10, 0.75);
    const stars2 = Points.createPointsMesh({ x: FRUSTUM_SIZE * aspectRatio, y: FRUSTUM_SIZE }, 10, 12.5, 0.5);
    const stars3 = Points.createPointsMesh({ x: FRUSTUM_SIZE * aspectRatio, y: FRUSTUM_SIZE }, 30, 8, 0.5);
    const stars4 = Points.createPointsMesh({ x: FRUSTUM_SIZE * aspectRatio, y: FRUSTUM_SIZE }, 3, 30, 0.5);
    const stars5 = Points.createPointsMesh({ x: FRUSTUM_SIZE * aspectRatio, y: FRUSTUM_SIZE }, 3, 30, 0.5);

    this.group.add(stars1, stars2, stars3, stars4, stars5);
  }

  update(time: number) {
    const stars1 = this.group.children[0];
    const stars2 = this.group.children[1];
    const stars4 = this.group.children[3];
    const stars5 = this.group.children[4];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    stars1.material.opacity = Math.sin(time * 2.5) * 0.4 + 0.7;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    stars2.material.opacity = Math.sin(time * 2.5 + 2.5) * 0.4 + 0.7;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    stars4.material.opacity = Math.sin(time * 2.5 + 4.5) * 0.5 + 0.7;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    stars5.material.opacity = Math.sin(time * 2 + 7.5) * 0.5 + 0.8;

    // if (stars3) stars3.material.opacity = Math.sin(time * 1.5) * 0.35 + 0.35;
    // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // // @ts-ignore
    // if (stars7) stars7.material.opacity = Math.sin(time * 1.25) * 0.35 + 0.35;
  }
}

export default Points;
